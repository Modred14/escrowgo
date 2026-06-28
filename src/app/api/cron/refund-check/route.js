import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refundTransaction } from "@/lib/nomba";
import { notify } from "@/lib/notifications";

/**
 * Call this on a schedule (e.g. Netlify Scheduled Function or an external
 * cron pinger) with header:  Authorization: Bearer <CRON_SECRET>
 *
 * Logic: for every deal still awaiting delivery whose expectedDeliveryDate
 * has passed, refund the buyer and mark the deal REFUNDED.
 */
export async function GET(req) {
  return handleRefundSweep(req);
}
export async function POST(req) {
  return handleRefundSweep(req);
}

async function handleRefundSweep(req) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const overdueDeals = await prisma.deal.findMany({
    where: {
      status: { in: ["FUNDS_HELD", "OUT_FOR_DELIVERY"] },
      expectedDeliveryDate: { lt: now },
    },
    include: { product: true, escrow: true, payments: true },
  });

  const refunded = [];

  for (const deal of overdueDeals) {
    const successPayment = deal.payments.find((p) => p.status === "SUCCESS");
    if (!successPayment) continue;

    await refundTransaction({ providerRef: successPayment.providerRef, amount: successPayment.amount });

    await prisma.escrow.update({
      where: { dealId: deal.id },
      data: { status: "REFUNDED", refundedAt: now },
    });
    await prisma.deal.update({ where: { id: deal.id }, data: { status: "REFUNDED" } });

    await notify(deal.buyerId, {
      title: "Refund issued",
      message: `Delivery for "${deal.product.name}" wasn't confirmed by the expected date. Your payment has been refunded.`,
      type: "WARNING",
    });
    await notify(deal.sellerId, {
      title: "Deal refunded",
      message: `"${deal.product.name}" passed its expected delivery date without confirmation, so escrowgo refunded the buyer.`,
      type: "WARNING",
    });

    refunded.push(deal.id);
  }

  return NextResponse.json({ checked: overdueDeals.length, refunded: refunded.length, dealIds: refunded });
}

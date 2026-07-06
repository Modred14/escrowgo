import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refundTransaction } from "@/lib/nomba";
import { notify } from "@/lib/notifications";

/**
 * Call this on a schedule (e.g. Netlify Scheduled Function or an external
 * cron pinger) with header:  Authorization: Bearer <CRON_SECRET>
 *
 * Logic for every deal still awaiting delivery whose expectedDeliveryDate has passed:
 *
 * - Self Delivery: this is on the seller. Refund the buyer, mark the deal
 *   CANCELLED, and the QR is implicitly expired (a cancelled deal can never
 *   reach DELIVERED again, so /api/qr/verify will always reject it).
 *
 * - EscrowGo Delivery where a courier already has the item (accepted/picked
 *   up/delivered but never scanned): the delay is EscrowGo's fault, not the
 *   buyer's or seller's, so we do NOT auto-refund here. Instead we flag the
 *   deal for manual/admin review so a human resolves who gets made whole.
 *
 * - EscrowGo Delivery still UNASSIGNED past the deadline: that's the
 *   courier-timeout case, handled by /api/cron/courier-timeout, not here.
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
    include: { product: true, escrow: true, payments: true, delivery: true },
  });

  const refunded = [];
  const flagged = [];

  for (const deal of overdueDeals) {
    const successPayment = deal.payments.find((p) => p.status === "SUCCESS");
    if (!successPayment) continue;

    const courierHasItem =
      deal.deliveryOption === "ESCROWGO" &&
      ["ACCEPTED", "PICKED_UP", "DELIVERED"].includes(deal.delivery?.status);

    if (courierHasItem) {
      if (deal.flaggedForReviewAt) continue; // already flagged, don't re-notify every run

      await prisma.deal.update({
        where: { id: deal.id },
        data: { flaggedForReviewAt: now },
      });

      await notify(deal.buyerId, {
        title: "Delivery is delayed",
        message: `"${deal.product.name}" is past its expected delivery date while with our courier. This is on EscrowGo, not you — our team is reviewing it and you will not lose your money.`,
        type: "WARNING",
      });
      await notify(deal.sellerId, {
        title: "Delivery delayed — under review",
        message: `"${deal.product.name}" passed its expected delivery date while with our courier. EscrowGo's team is reviewing this deal.`,
        type: "WARNING",
      });

      flagged.push(deal.id);
      continue;
    }

    // Self Delivery (or EscrowGo never picked up) past deadline: refund the buyer.
    await refundTransaction({ providerRef: successPayment.providerRef, amount: successPayment.amount });

    await prisma.escrow.update({
      where: { dealId: deal.id },
      data: { status: "REFUNDED", refundedAt: now },
    });
    await prisma.deal.update({ where: { id: deal.id }, data: { status: "CANCELLED" } });

    await notify(deal.buyerId, {
      title: "Refund issued",
      message: `Delivery for "${deal.product.name}" wasn't confirmed by the expected date. Your payment has been refunded and the order cancelled.`,
      type: "WARNING",
    });
    await notify(deal.sellerId, {
      title: "Deal cancelled",
      message: `"${deal.product.name}" passed its expected delivery date without confirmation, so escrowgo refunded the buyer and cancelled the order.`,
      type: "WARNING",
    });

    refunded.push(deal.id);
  }

  return NextResponse.json({
    checked: overdueDeals.length,
    refunded: refunded.length,
    flagged: flagged.length,
    dealIds: refunded,
    flaggedDealIds: flagged,
  });
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

const TIMEOUT_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/**
 * Call this on a schedule with header: Authorization: Bearer <CRON_SECRET>
 *
 * If no courier has accepted an EscrowGo Delivery job within 3 days of the
 * deal becoming FUNDS_HELD (i.e. 3 days since the buyer's payment succeeded),
 * the seller is notified and the deal is automatically switched to Self
 * Delivery. From that point on, only the seller can scan the buyer's QR
 * (enforced by /api/qr/verify's deliveryOption check).
 */
export async function GET(req) {
  return handleCourierTimeoutSweep(req);
}
export async function POST(req) {
  return handleCourierTimeoutSweep(req);
}

async function handleCourierTimeoutSweep(req) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - TIMEOUT_MS);

  const candidates = await prisma.deal.findMany({
    where: {
      deliveryOption: "ESCROWGO",
      status: "FUNDS_HELD",
      delivery: { status: "UNASSIGNED" },
    },
    include: { product: true, delivery: true, payments: true },
  });

  const switched = [];

  for (const deal of candidates) {
    const successPayment = deal.payments.find((p) => p.status === "SUCCESS");
    if (!successPayment?.paidAt || successPayment.paidAt > cutoff) continue;

    await prisma.deal.update({
      where: { id: deal.id },
      data: { deliveryOption: "SELF" },
    });
    await prisma.delivery.update({
      where: { id: deal.delivery.id },
      data: { pickupLocation: deal.sellerLocation, dropoffLocation: deal.buyerLocation },
    });

    await notify(deal.sellerId, {
      title: "No courier available — switched to Self Delivery",
      message: `No EscrowGo courier accepted "${deal.product.name}" within 3 days. Please deliver it yourself, then scan the buyer's QR code once it's delivered.`,
      type: "WARNING",
    });
    await notify(deal.buyerId, {
      title: "Delivery method changed",
      message: `No courier was available for "${deal.product.name}" in time, so the seller will now deliver it directly.`,
      type: "INFO",
    });

    switched.push(deal.id);
  }

  return NextResponse.json({ checked: candidates.length, switched: switched.length, dealIds: switched });
}
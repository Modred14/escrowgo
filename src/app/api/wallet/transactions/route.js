import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DealStatus -> UI status mapping.
// NOTE: schema has no real "dispute" flag — FUNDS_HELD/OUT_FOR_DELIVERY are
// shown as "In Dispute" only as a placeholder for "in progress, not settled".

// DealStatus -> UI status mapping. Only genuinely flagged deals show as
// "In Dispute" (flaggedForReviewAt is set by the delivery-deadline cron).
// Everything else reflects its real, current state.
function toUiStatus(deal) {
  if (deal.flaggedForReviewAt) return "In Dispute";
  switch (deal.status) {
    case "PENDING_PAYMENT":
      return "Awaiting Payment";
    case "FUNDS_HELD":
      return "In Escrow";
    case "OUT_FOR_DELIVERY":
      return "Out For Delivery";
    case "DELIVERED":
      return "Awaiting Pickup Confirmation";
    case "PAYMENT_RELEASED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "REFUNDED":
      return "Refunded";
    default:
      return deal.status;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sellerId = session.user.id;

  const [releasedEscrows, deals] = await Promise.all([
    // Only escrow that has actually been RELEASED to the seller counts as
    // real balance. Money still held in escrow (FUNDS_HELD/OUT_FOR_DELIVERY/
    // DELIVERED-but-unscanned) must NOT show up as spendable balance.
    prisma.escrow.findMany({
      where: { status: "RELEASED", deal: { sellerId } },
      select: { amount: true },
    }),
    prisma.deal.findMany({
      where: { sellerId },
      include: {
        product: true,
        seller: { select: { name: true } },
        buyer: { select: { name: true } },
        delivery: { include: { agent: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const moneyIn = releasedEscrows.reduce((sum, e) => sum + e.amount, 0);

  // No withdrawal-tracking model exists yet — placeholder until one is added.
  const totalWithdrawn = 0;

  const totalTransactions = deals.length;

  const sales = deals.map((d) => ({
    id: d.slug ?? d.id,
    merchant: d.buyer?.name ?? "Awaiting merchant",
    seller: d.seller?.name ?? "You",
    courier: d.deliveryOption === "ESCROWGO" ? (d.delivery?.agent?.user?.name ?? "Not yet assigned") : "Self delivery",
    product: d.product?.name ?? "Untitled product",
    amount: d.product?.price ?? 0,
    deliveryStatus: d.delivery?.status ?? "UNASSIGNED",
    status: toUiStatus(d),
  }));

  return NextResponse.json({
    moneyIn,
    totalWithdrawn,
    totalTransactions,
    sales,
  });
}
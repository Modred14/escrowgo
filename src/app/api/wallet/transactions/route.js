import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const userId = session.user.id;

  const [releasedEscrows, withdrawals, deals, purchaseDeals] = await Promise.all([
    prisma.escrow.findMany({
      where: { status: "RELEASED", deal: { sellerId: userId } },
      select: { amount: true },
    }),
    prisma.withdrawal.findMany({
      where: { userId, status: { in: ["SUCCESS", "PENDING"] } },
      select: { amount: true },
    }),
    prisma.deal.findMany({
      where: { sellerId: userId },
      include: {
        product: true,
        seller: { select: { name: true } },
        buyer: { select: { name: true } },
        delivery: { include: { agent: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deal.findMany({
      where: { buyerId: userId },
      include: {
        product: true,
        seller: { select: { name: true } },
        qrCode: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const moneyIn = releasedEscrows.reduce((sum, e) => sum + e.amount, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

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

  const totalSpent = purchaseDeals
    .filter((d) => d.status !== "PENDING_PAYMENT" && d.status !== "CANCELLED")
    .reduce((sum, d) => sum + (d.product?.price ?? 0) + (d.deliveryFee ?? 0), 0);

  const purchases = purchaseDeals.map((d) => ({
    id: d.slug ?? d.id,
    slug: d.slug,
    seller: d.seller?.name ?? "Seller",
    product: d.product?.name ?? "Untitled product",
    amount: (d.product?.price ?? 0) + (d.deliveryFee ?? 0),
    status: toUiStatus(d),
    qrCode: d.qrCode
      ? { code: d.qrCode.code, isUsed: d.qrCode.isUsed }
      : null,
  }));

  return NextResponse.json({
    moneyIn,
    totalWithdrawn,
    totalTransactions,
    sales,
    totalSpent,
    totalPurchases: purchases.length,
    purchases,
  });
}
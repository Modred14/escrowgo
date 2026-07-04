import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DealStatus -> UI status mapping.
// NOTE: schema has no real "dispute" flag — FUNDS_HELD/OUT_FOR_DELIVERY are
// shown as "In Dispute" only as a placeholder for "in progress, not settled".

function toUiStatus(status) {
  if (status === "DELIVERED" || status === "PAYMENT_RELEASED") return "Delivered";
  if (status === "CANCELLED" || status === "REFUNDED") return "Undelivered";
  return "In Dispute";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sellerId = session.user.id;

  const [payments, deals] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "SUCCESS", deal: { sellerId } },
      select: { amount: true },
    }),
    prisma.deal.findMany({
      where: { sellerId },
      include: { product: true, buyer: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const moneyIn = payments.reduce((sum, p) => sum + p.amount, 0);

  // No withdrawal-tracking model exists yet — placeholder until one is added.
  const totalWithdrawn = 0;

  const totalTransactions = deals.length;

  const sales = deals.map((d) => ({
    id: d.slug ?? d.id,
    buyer: d.buyer?.name ?? "Awaiting buyer",
    product: d.product?.name ?? "Untitled product",
    amount: d.product?.price ?? 0,
    status: toUiStatus(d.status),
  }));

  return NextResponse.json({
    moneyIn,
    totalWithdrawn,
    totalTransactions,
    sales,
  });
}
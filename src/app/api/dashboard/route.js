import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const COMPLETED = ["DELIVERED", "PAYMENT_RELEASED"];
const CLOSED_OUT = ["CANCELLED", "REFUNDED"];

function pctChange(curr, prev) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deals = await prisma.deal.findMany({
    where: { sellerId: session.user.id },
    include: { product: true, buyer: true },
    orderBy: { createdAt: "desc" },
  });

  const totalOrders = deals.length;
  const completedOrders = deals.filter((d) => COMPLETED.includes(d.status)).length;
  const pendingOrders = deals.filter(
    (d) => !COMPLETED.includes(d.status) && !CLOSED_OUT.includes(d.status),
  ).length;

  const totalSales = deals
    .filter((d) => COMPLETED.includes(d.status))
    .reduce((sum, d) => sum + (d.product?.price ?? 0), 0);

  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthDeals = deals.filter((d) => new Date(d.createdAt) >= startThisMonth);
  const lastMonthDeals = deals.filter(
    (d) => new Date(d.createdAt) >= startLastMonth && new Date(d.createdAt) < startThisMonth,
  );

  const thisMonthSales = thisMonthDeals
    .filter((d) => COMPLETED.includes(d.status))
    .reduce((sum, d) => sum + (d.product?.price ?? 0), 0);
  const lastMonthSales = lastMonthDeals
    .filter((d) => COMPLETED.includes(d.status))
    .reduce((sum, d) => sum + (d.product?.price ?? 0), 0);

  const recentOrders = deals.slice(0, 4).map((d) => ({
    id: d.slug ?? d.id,
    item: d.product?.name ?? "Untitled product",
    buyer: d.buyer?.name ?? "Awaiting buyer",
    amount: d.product?.price ?? 0,
    status: COMPLETED.includes(d.status) ? "Completed" : "Pending",
  }));

  return NextResponse.json({
    totalOrders,
    completedOrders,
    pendingOrders,
    totalSales,
    ordersTrend: pctChange(thisMonthDeals.length, lastMonthDeals.length),
    salesTrend: pctChange(thisMonthSales, lastMonthSales),
    recentOrders,
  });
}
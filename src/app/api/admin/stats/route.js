import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalDeals, totalUsers, totalAgents, fundsHeldAgg, releasedAgg, refundedAgg, byStatus] = await Promise.all([
    prisma.deal.count(),
    prisma.user.count(),
    prisma.deliveryAgent.count(),
    prisma.escrow.aggregate({ _sum: { amount: true }, where: { status: "HELD" } }),
    prisma.escrow.aggregate({ _sum: { amount: true }, where: { status: "RELEASED" } }),
    prisma.escrow.aggregate({ _sum: { amount: true }, where: { status: "REFUNDED" } }),
    prisma.deal.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  return NextResponse.json({
    totalDeals,
    totalUsers,
    totalAgents,
    fundsHeld: fundsHeldAgg._sum.amount || 0,
    fundsReleased: releasedAgg._sum.amount || 0,
    fundsRefunded: refundedAgg._sum.amount || 0,
    byStatus: byStatus.map((b) => ({ status: b.status, count: b._count.status })),
  });
}

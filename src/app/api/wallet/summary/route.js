// src/app/api/wallet/summary/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [escrows, withdrawals] = await Promise.all([
    prisma.escrow.findMany({
      where: {
        status: "RELEASED",
        deal: { sellerId: session.user.id },
      },
      select: { amount: true },
    }),
    // PENDING withdrawals are already committed at Nomba's end (money is
    // sent/in-flight the moment they accept the payout, before our webhook
    // confirms it) — they must reduce the displayed balance too, or this
    // page shows money that isn't really spendable anymore.
    prisma.withdrawal.findMany({
      where: { userId: session.user.id, status: { in: ["SUCCESS", "PENDING"] } },
      select: { amount: true },
    }),
  ]);

  const moneyIn = escrows.reduce((sum, e) => sum + e.amount, 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const balance = moneyIn - totalWithdrawn;

  return NextResponse.json({ balance });
}
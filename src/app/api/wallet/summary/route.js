import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const escrows = await prisma.escrow.findMany({
    where: {
      status: "RELEASED",
      deal: { sellerId: session.user.id },
    },
    select: { amount: true },
  });

  const balance = escrows.reduce((sum, e) => sum + e.amount, 0);

  return NextResponse.json({ balance });
}
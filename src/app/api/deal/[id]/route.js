import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);

  const deal = await prisma.deal.findUnique({
    where: { slug: params.slug },
    include: {
      product: true,
      seller: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      buyer: { select: { id: true, name: true, email: true } },
      payments: { orderBy: { createdAt: "desc" } },
      escrow: true,
      delivery: { include: { agent: { include: { user: true } } } },
      qrCode: { select: { id: true, code: true, isUsed: true, usedAt: true } },
    },
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const isOwningBuyer = session?.user?.id && deal.buyerId === session.user.id;
  if (deal.qrCode && !isOwningBuyer) {
    deal.qrCode = { id: deal.qrCode.id, isUsed: deal.qrCode.isUsed, usedAt: deal.qrCode.usedAt };
  }

  return NextResponse.json({ deal });
}
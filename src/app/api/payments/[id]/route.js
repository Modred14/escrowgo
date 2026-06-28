import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMockMode } from "@/lib/nomba";

export async function GET(_req, { params }) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: { deal: { include: { product: true, seller: true } } },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  return NextResponse.json({ payment, mockMode: isMockMode() });
}

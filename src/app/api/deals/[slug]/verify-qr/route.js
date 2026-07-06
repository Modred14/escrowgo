import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be logged in to verify an order" }, { status: 401 });
    }

    const { slug, code } = await request.json();
    if (!slug || !code) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }

    const deal = await prisma.deal.findUnique({
      where: { slug },
      include: { qrCode: true, escrow: true, payments: true, product: true },
    });

    if (!deal) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Hard gate: only the seller who owns this deal can verify it
    if (deal.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to verify this order" },
        { status: 403 },
      );
    }

    if (!deal.qrCode || deal.qrCode.code !== code) {
      return NextResponse.json({ error: "This QR code doesn't match this order" }, { status: 400 });
    }

    if (deal.qrCode.isUsed) {
      return NextResponse.json({ error: "This QR code has already been used" }, { status: 409 });
    }

    const payment = deal.payments?.find((p) => p.status === "SUCCESS");
    if (!payment) {
      return NextResponse.json(
        { error: "Payment for this order has not been confirmed yet" },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.qRCode.update({
        where: { id: deal.qrCode.id },
        data: { isUsed: true, usedAt: new Date() },
      }),
      prisma.deal.update({
        where: { id: deal.id },
        data: { status: "PAYMENT_RELEASED" },
      }),
      ...(deal.escrow
        ? [
            prisma.escrow.update({
              where: { id: deal.escrow.id },
              data: { status: "RELEASED", releasedAt: new Date() },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      verified: true,
      product: deal.product?.name,
      amount: payment.amount,
    });
  } catch (error) {
    console.error("verify-qr error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
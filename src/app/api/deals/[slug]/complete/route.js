import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { verifyTransactionStatus } from "@/lib/nomba";
import { markPaymentSuccess } from "@/lib/payment-service";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const orderReference = searchParams.get("orderReference");
    const orderId = searchParams.get("orderId");

    if (!orderReference && !orderId) {
      return NextResponse.json(
        { error: "Missing order reference" },
        { status: 400 },
      );
    }

    const deal = await prisma.deal.findUnique({
      where: { slug },
      include: { product: true, payments: true, qrCode: true },
    });

    if (!deal) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Nomba's redirect carries both orderId and orderReference, and which one
    // matches payment.providerRef has been inconsistent in practice — so we
    // accept a match against either.
    const payment = deal.payments?.find(
      (p) =>
        (orderReference && p.providerRef === orderReference) ||
        (orderId && p.providerRef === orderId),
    );
    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 },
      );
    }
    if (payment.status === "FAILED") {
      return NextResponse.json({ verified: false, status: "FAILED" });
    }
    if (payment.status !== "SUCCESS") {
      try {
        const { status: providerStatus } = await verifyTransactionStatus({
          orderReference: payment.providerRef,
        });

        if (providerStatus === "SUCCESS") {
          // markPaymentSuccess is idempotent and handles everything a
          // successful payment needs: deal status, expected delivery date,
          // and — critically — creating the escrow and delivery records.
          // Calling it here (not just a bare payment.update) matters because
          // this polling path is often what confirms payment before any
          // webhook does, and skipping it left deals with no escrow/delivery
          // row at all, which broke QR scanning down the line.
          await markPaymentSuccess(payment.id);
          payment.status = "SUCCESS"; // reflect locally for the rest of this handler
        } else if (providerStatus === "FAILED") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });
          return NextResponse.json({ verified: false, status: "FAILED" });
        } else {
          return NextResponse.json({
            verified: false,
            status: providerStatus || "PENDING",
          });
        }
      } catch (err) {
        console.error(
          "[complete-order] Nomba verification failed:",
          err.message,
        );
        return NextResponse.json({
          verified: false,
          status: payment.status || "PENDING",
          debugError: err.message,
        });
      }
    }

    let qrCode = deal.qrCode;
    if (!qrCode) {
      qrCode = await prisma.qRCode.create({
        data: { code: crypto.randomBytes(24).toString("hex"), dealId: deal.id },
      });
    }

    if (deal.status === "PENDING_PAYMENT") {
      await prisma.deal.update({
        where: { id: deal.id },
        data: { status: "FUNDS_HELD" },
      });
    }

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${deal.slug}?code=${qrCode.code}`;

    return NextResponse.json({
      verified: true,
      status: "SUCCESS",
      qrValue: verifyUrl,
      product: {
        name: deal.product?.name,
        image: deal.product?.images?.[0] || null,
      },
      amount: payment.amount,
    });
  } catch (error) {
    console.error("complete-order error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong while checking payment" },
      { status: 500 },
    );
  }
}
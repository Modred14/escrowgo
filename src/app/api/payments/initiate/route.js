// src/app/api/payments/initiate/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutOrder } from "@/lib/nomba";
import { randomToken } from "@/lib/utils";

function getBaseUrl(req) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && /^https?:\/\//.test(envUrl)) return envUrl.replace(/\/$/, "");
  // Fallback: derive from the incoming request so callbackUrl is never "undefined/..."
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to pay." }, { status: 401 });
  }

  try {
    const { dealId } = await req.json();
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { product: true, payments: true },
    });

    if (!deal) return NextResponse.json({ error: "Deal not found." }, { status: 404 });

    if (deal.sellerId === session.user.id) {
      return NextResponse.json({ error: "Sellers cannot pay for their own deal." }, { status: 400 });
    }

    // --- Duplicate payment prevention -------------------------------------
    if (deal.status !== "PENDING_PAYMENT") {
      return NextResponse.json({ error: "This deal has already been paid for." }, { status: 409 });
    }
    const existingSuccess = deal.payments.find((p) => p.status === "SUCCESS");
    if (existingSuccess) {
      return NextResponse.json({ error: "This deal has already been paid for." }, { status: 409 });
    }
    const existingPending = deal.payments.find((p) => p.status === "PENDING");
    if (existingPending) {
      return NextResponse.json({
        success: true,
        paymentId: existingPending.id,
        checkoutUrl: existingPending.checkoutUrl || `/pay/${existingPending.id}`,
      });
    }
    // ------------------------------------------------------------------------

    if (deal.buyerId && deal.buyerId !== session.user.id) {
      return NextResponse.json({ error: "A different buyer is already attached to this deal." }, { status: 403 });
    }
    if (!deal.buyerId) {
      await prisma.deal.update({ where: { id: deal.id }, data: { buyerId: session.user.id } });
    }

    const totalAmount = deal.product.price + deal.deliveryFee;
    const orderReference = `EGO-${randomToken(14)}`;

    const payment = await prisma.payment.create({
      data: {
        dealId: deal.id,
        buyerId: session.user.id,
        amount: totalAmount,
        providerRef: orderReference,
        status: "PENDING",
      },
    });

    const { checkoutUrl, mock } = await createCheckoutOrder({
      orderReference,
      amount: totalAmount,
      currency: "NGN",
      callbackUrl: `${getBaseUrl(req)}/pay/${payment.id}`,
      customerEmail: session.user.email,
      description: `escrowgo deal: ${deal.product.name}`,
    });

    const finalCheckoutUrl = mock ? `/pay/${payment.id}?mock=1` : checkoutUrl;

    await prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutUrl: finalCheckoutUrl },
    });

    return NextResponse.json({ success: true, paymentId: payment.id, checkoutUrl: finalCheckoutUrl });
  } catch (err) {
    console.error("Initiate payment error:", err);
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 500 });
  }
}
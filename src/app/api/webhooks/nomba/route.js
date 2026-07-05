import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/nomba";
import { markPaymentSuccess } from "@/lib/payment-service";
import { notify } from "@/lib/notifications";

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("nomba-signature");
  const timestamp = req.headers.get("nomba-timestamp");

  if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventType = event?.event_type;
  const orderReference = event?.data?.transaction?.merchantTxRef;

  if (!orderReference) {
    console.log("[webhook] no merchantTxRef in payload — ignoring", eventType);
    return NextResponse.json({
      received: true,
      note: "No merchant reference in payload",
    });
  }

  const payment = await prisma.payment.findUnique({
    where: { providerRef: orderReference },
  });
  if (!payment) {
    return NextResponse.json({ received: true, note: "Unknown reference" });
  }

  if (eventType === "payment_success") {
    await markPaymentSuccess(payment.id);
  } else if (eventType === "payment_failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    await notify(payment.buyerId, {
      title: "Payment failed",
      message: "Your payment could not be completed. Please try again.",
      type: "ERROR",
    });
  } else {
    console.log("[webhook] unhandled event type:", eventType);
  }

  return NextResponse.json({ received: true });
}

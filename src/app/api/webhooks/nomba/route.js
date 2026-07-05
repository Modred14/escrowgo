import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/nomba";
import { markPaymentSuccess } from "@/lib/payment-service";
import { notify } from "@/lib/notifications";

export async function POST(req) {
  console.log("[webhook] hit at", new Date().toISOString());

  const rawBody = await req.text();
  const signature = req.headers.get("nomba-signature");
  const timestamp = req.headers.get("nomba-timestamp");

  console.log("[webhook] raw body:", rawBody);
  console.log("[webhook] signature header:", signature);
  console.log("[webhook] timestamp header:", timestamp);

  const isValidSignature = verifyWebhookSignature(rawBody, signature, timestamp);
  console.log("[webhook] signature valid:", isValidSignature);

  if (!isValidSignature) {
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

  console.log("[webhook] parsed event type:", eventType);
  console.log("[webhook] order reference:", orderReference);

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

  console.log("[webhook] payment lookup result:", payment ? payment.id : "NOT FOUND");

  if (!payment) {
    return NextResponse.json({ received: true, note: "Unknown reference" });
  }

  if (eventType === "payment_success") {
    console.log("[webhook] marking payment success:", payment.id);
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

  console.log("[webhook] done processing, returning 200");
  return NextResponse.json({ received: true });
}

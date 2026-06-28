import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/nomba";
import { markPaymentSuccess } from "@/lib/payment-service";
import { notify } from "@/lib/notifications";

/**
 * Nomba sends payment-related events here. We rely on the orderReference
 * we generated at checkout time (stored as Payment.providerRef) to find
 * the matching record — never trust amounts/identifiers from the body
 * without cross-checking against our own DB.
 *
 * Configure this URL in your Nomba dashboard as:
 *   https://<your-cloudflare-tunnel-domain>/api/webhooks/nomba
 */
export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("nomba-sig-value");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventType = event?.event_type || event?.eventType;
  const orderReference =
    event?.data?.order?.orderReference || event?.data?.orderReference || event?.data?.merchant_tx_ref;

  if (!orderReference) {
    return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { providerRef: orderReference } });
  if (!payment) {
    // Acknowledge with 200 so Nomba doesn't keep retrying a reference we'll never recognize.
    return NextResponse.json({ received: true, note: "Unknown reference" });
  }

  const isSuccessEvent =
    !eventType ||
    eventType.toLowerCase().includes("success") ||
    event?.data?.transaction?.status === "success" ||
    event?.data?.status === "success";

  if (isSuccessEvent) {
    await markPaymentSuccess(payment.id);
  } else {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await notify(payment.buyerId, {
      title: "Payment failed",
      message: "Your payment could not be completed. Please try again.",
      type: "ERROR",
    });
  }

  return NextResponse.json({ received: true });
}
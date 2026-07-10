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

  // Payout events (withdrawals) reference a Withdrawal row via merchantTxRef,
  // not a Payment row — handle those separately before falling back to the
  // payment lookup, otherwise every payout webhook gets dropped as "Unknown
  // reference" and PENDING withdrawals never resolve to SUCCESS/FAILED. That
  // left the spendable-balance calc (which only subtracts SUCCESS
  // withdrawals) unaware that money had already left the Nomba account,
  // so the wallet kept showing a balance that was no longer really there —
  // the next withdrawal attempt would then get rejected by Nomba itself for
  // insufficient funds even though our own UI said the balance was fine.
  if (eventType === "payout_success" || eventType === "payout_failed") {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { merchantTxRef: orderReference },
    });

    console.log("[webhook] withdrawal lookup result:", withdrawal ? withdrawal.id : "NOT FOUND");

    if (!withdrawal) {
      return NextResponse.json({ received: true, note: "Unknown reference" });
    }

    if (withdrawal.status !== "PENDING") {
      // Already resolved (e.g. we got an immediate SUCCESS on the initial
      // API response) — don't double-process.
      return NextResponse.json({ received: true, note: "Already resolved" });
    }

    if (eventType === "payout_success") {
      console.log("[webhook] marking withdrawal success:", withdrawal.id);
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "SUCCESS" },
      });
      await notify(withdrawal.userId, {
        title: "Withdrawal successful",
        message: `₦${withdrawal.amount.toLocaleString("en-NG")} has been paid out to ${withdrawal.accountName} (${withdrawal.accountNumber}).`,
        type: "SUCCESS",
      });
    } else {
      console.log("[webhook] marking withdrawal failed:", withdrawal.id);
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "FAILED", failureReason: "Payout failed at provider" },
      });
      await notify(withdrawal.userId, {
        title: "Withdrawal failed",
        message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString("en-NG")} could not be completed and was not deducted from your balance.`,
        type: "ERROR",
      });
    }

    console.log("[webhook] done processing, returning 200");
    return NextResponse.json({ received: true });
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
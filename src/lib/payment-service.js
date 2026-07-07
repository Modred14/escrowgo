// src/lib/payment-service.js
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

/**
 * Marks a payment as successful and fans out every downstream effect:
 * escrow creation, delivery record setup, expected-delivery date,
 * and notifications to both parties. Idempotent — safe to call twice
 * (e.g. once from the webhook, once from a manual status refresh).
 */
export async function markPaymentSuccess(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { deal: { include: { product: true } } },
  });

  if (!payment) throw new Error("Payment not found.");
  if (payment.status === "SUCCESS") {
    return { alreadyProcessed: true, payment };
  }

  const deal = payment.deal;
  // Resolve the buyer up front so it's consistent for the deal update below
  // and the notification further down, whether or not this deal already had
  // a buyer attached.
  const resolvedBuyerId = deal.buyerId || payment.buyerId;
  const now = new Date();
  const totalDays = deal.estimatedDeliveryDays;
  const expectedDeliveryDate = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000);

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "SUCCESS", paidAt: now },
  });

  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      status: "FUNDS_HELD",
      expectedDeliveryDate,
      // Register the paying account as the buyer on this deal so it shows up
      // under "Pending Products to Pick Up" on their dashboard. Normally this
      // is already set by /api/payments/initiate, but we enforce it here too
      // since payment success is the real source of truth — this makes it
      // work no matter which path marked the payment successful.
      ...(deal.buyerId ? {} : { buyerId: resolvedBuyerId }),
    },
  });

  await prisma.escrow.upsert({
    where: { dealId: deal.id },
    update: {},
    create: { dealId: deal.id, amount: deal.product.price, status: "HELD" },
  });

  await prisma.delivery.upsert({
    where: { dealId: deal.id },
    update: {},
    create: {
      dealId: deal.id,
      pickupLocation: deal.sellerLocation,
      dropoffLocation: deal.buyerLocation,
      fee: deal.deliveryFee,
      status: "UNASSIGNED",
    },
  });

  await notify(resolvedBuyerId, {
    title: "Payment secured in escrow",
    message: `Your payment for "${deal.product.name}" is locked in escrow until delivery is confirmed.`,
    type: "SUCCESS",
  });
  await notify(deal.sellerId, {
    title: "Buyer has paid — funds secured",
    message: `Funds for "${deal.product.name}" are held in escrow. Prepare the item for delivery.`,
    type: "SUCCESS",
  });

  return { alreadyProcessed: false, payment: updatedPayment };
}
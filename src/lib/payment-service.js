import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

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
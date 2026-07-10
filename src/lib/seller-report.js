import { prisma } from "@/lib/prisma";

const MS_PER_DAY = 24 * 60 * 60 * 1000;


export async function getSellerReportData(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, country: true, city: true, createdAt: true },
  });
  if (!user) return null;

  const deals = await prisma.deal.findMany({
    where: { sellerId: userId },
    include: { product: true, escrow: true, payments: true },
    orderBy: { createdAt: "asc" },
  });

  const paidDeals = deals.filter((d) => d.status !== "PENDING_PAYMENT");
  const completedDeals = deals.filter((d) => d.status === "PAYMENT_RELEASED");
  const cancelledOrRefunded = deals.filter((d) => ["CANCELLED", "REFUNDED"].includes(d.status));
  const flaggedDeals = deals.filter((d) => d.flaggedForReviewAt);

  const totalTransactions = paidDeals.length;
  const completedCount = completedDeals.length;

  const completionRate = totalTransactions > 0 ? completedCount / totalTransactions : null;
  const cancellationRate =
    totalTransactions > 0 ? cancelledOrRefunded.length / totalTransactions : null;

  const uniqueCustomers = new Set(
    paidDeals.map((d) => d.buyerId).filter(Boolean),
  ).size;

  const totalValueTransacted = completedDeals.reduce(
    (sum, d) => sum + (d.product?.price ?? 0),
    0,
  );

  let onTimeCount = 0;
  let onTimeEligible = 0;
  let deliveryDurationsDays = [];

  for (const deal of completedDeals) {
    const paidAt = deal.payments.find((p) => p.status === "SUCCESS")?.paidAt;
    const releasedAt = deal.escrow?.releasedAt;
    if (paidAt && releasedAt) {
      deliveryDurationsDays.push((releasedAt - paidAt) / MS_PER_DAY);
    }
    if (deal.expectedDeliveryDate && releasedAt) {
      onTimeEligible += 1;
      if (releasedAt <= deal.expectedDeliveryDate) onTimeCount += 1;
    }
  }

  const onTimeRate = onTimeEligible > 0 ? onTimeCount / onTimeEligible : null;
  const avgDeliveryDays =
    deliveryDurationsDays.length > 0
      ? deliveryDurationsDays.reduce((a, b) => a + b, 0) / deliveryDurationsDays.length
      : null;

  const HAS_ENOUGH_DATA = totalTransactions >= 3;
  let trustScore = null;
  if (HAS_ENOUGH_DATA) {
    const completionPart = (completionRate ?? 0) * 50;
    const onTimePart = (onTimeRate ?? completionRate ?? 0) * 30;
    const reliabilityPart = (1 - (cancellationRate ?? 0)) * 20;
    trustScore = Math.round(completionPart + onTimePart + reliabilityPart);
  }

  const recentCompleted = completedDeals
    .slice(-5)
    .reverse()
    .map((d) => ({
      productName: d.product?.name ?? "Untitled product",
      price: d.product?.price ?? 0,
      completedAt: d.escrow?.releasedAt ?? d.updatedAt,
    }));

  return {
    seller: {
      name: user.name,
      email: user.email,
      location: [user.city, user.country].filter(Boolean).join(", "),
      memberSince: user.createdAt,
    },
    generatedAt: new Date(),
    totalTransactions,
    completedCount,
    uniqueCustomers,
    totalValueTransacted,
    completionRate,
    cancellationRate,
    onTimeRate,
    avgDeliveryDays,
    trustScore,
    hasEnoughData: HAS_ENOUGH_DATA,
    flaggedCount: flaggedDeals.length,
    recentCompleted,
  };
}
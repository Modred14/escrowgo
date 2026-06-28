// Mock EscrowGO delivery network coverage for the MVP.
// In production this would call a logistics-partner API.
export const COVERED_LOCATIONS = [
  "Lagos",
  "Abuja",
  "Ibadan",
  "Port Harcourt",
  "Benin City",
  "Enugu",
  "Kano",
  "Abeokuta",
  "Owerri",
  "Uyo",
];

const SAME_CITY_FEE = 1500;
const INTERCITY_FEE = 3500;
const BUFFER_DAYS = 7;

function normalize(location) {
  return (location || "").trim().toLowerCase();
}

export function isCovered(location) {
  return COVERED_LOCATIONS.some(
    (city) => normalize(city) === normalize(location),
  );
}

/**
 * Checks coverage for both ends of a delivery and returns fee + buffer info.
 * This is the single source of truth for the "EscrowGO Delivery" business logic.
 */
export function checkDeliveryCoverage({
  sellerLocation,
  buyerLocation,
  estimatedDeliveryDays,
}) {
  const sellerCovered = isCovered(sellerLocation);
  const buyerCovered = isCovered(buyerLocation);
  const available = sellerCovered && buyerCovered;

  if (!available) {
    return {
      available: false,
      reason:
        !sellerCovered && !buyerCovered
          ? "EscrowGO Delivery does not yet operate in either location."
          : !sellerCovered
            ? `EscrowGO Delivery does not yet operate in ${sellerLocation}.`
            : `EscrowGO Delivery does not yet operate in ${buyerLocation}.`,
      fee: 0,
      bufferDays: 0,
      totalEstimatedDays: estimatedDeliveryDays,
    };
  }

  const sameCity = normalize(sellerLocation) === normalize(buyerLocation);
  const fee = sameCity ? SAME_CITY_FEE : INTERCITY_FEE;

  return {
    available: true,
    reason: null,
    fee,
    bufferDays: BUFFER_DAYS,
    totalEstimatedDays: Number(estimatedDeliveryDays) + BUFFER_DAYS,
  };
}

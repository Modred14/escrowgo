import { formatDateTime } from "@/lib/utils";

const STEPS = [
  { key: "CREATED", label: "Deal created" },
  { key: "FUNDS_HELD", label: "Funds secured in escrow" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered — pending confirmation" },
  { key: "PAYMENT_RELEASED", label: "Payment released to seller" },
];

const TERMINAL_NEGATIVE = ["REFUNDED", "CANCELLED"];

export default function Timeline({ deal }) {
  if (TERMINAL_NEGATIVE.includes(deal.status)) {
    return (
      <div className="rounded-2xl border border-seal/20 bg-seal/5 p-5">
        <p className="font-display text-base font-semibold text-seal">
          {deal.status === "REFUNDED" ? "Deal refunded" : "Deal cancelled"}
        </p>
        <p className="mt-1 text-sm text-ink/60">
          {deal.status === "REFUNDED"
            ? "Delivery wasn't confirmed by the expected date, so EscrowGO automatically returned the funds to the buyer."
            : "This deal was cancelled before completion."}
        </p>
      </div>
    );
  }

  const activeIndex = (() => {
    if (deal.status === "PENDING_PAYMENT") return -1;
    if (deal.status === "FUNDS_HELD") return 1;
    if (deal.status === "OUT_FOR_DELIVERY") return 2;
    if (deal.status === "DELIVERED") return 3;
    if (deal.status === "PAYMENT_RELEASED") return 4;
    return 0;
  })();

  const timestamps = {
    CREATED: deal.createdAt,
    FUNDS_HELD: deal.payments?.find((p) => p.status === "SUCCESS")?.paidAt,
    OUT_FOR_DELIVERY: deal.delivery?.pickedUpAt,
    DELIVERED: deal.delivery?.deliveredAt,
    PAYMENT_RELEASED: deal.escrow?.releasedAt,
  };

  return (
    <ol className="relative ml-3 space-y-7 border-l-2 border-ink/10 pl-7">
      {STEPS.map((step, i) => {
        const done = i <= activeIndex;
        const isCurrent = i === activeIndex + 1;
        return (
          <li key={step.key} className="relative">
            <span
              className={`absolute -left-[40px] flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                done
                  ? "border-mint bg-mint text-ink"
                  : isCurrent
                    ? "border-brass bg-brass/10 text-brass animate-pulse"
                    : "border-ink/15 bg-paper text-ink/30"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <p
              className={`text-sm font-semibold ${done ? "text-ink" : isCurrent ? "text-brass-dark" : "text-ink/40"}`}
            >
              {step.label}
            </p>
            {timestamps[step.key] && (
              <p className="mt-0.5 text-xs text-ink/40">
                {formatDateTime(timestamps[step.key])}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

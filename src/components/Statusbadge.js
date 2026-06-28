import { cn, DEAL_STATUS_LABELS, DEAL_STATUS_STYLES } from "@/lib/utils";

export default function StatusBadge({ status, className }) {
  const label = DEAL_STATUS_LABELS[status] || status;
  const style = DEAL_STATUS_STYLES[status] || "bg-ink/5 text-ink/60 border-ink/10";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        style,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
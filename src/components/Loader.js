export function Spinner({ className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink/60">
      <Spinner className="h-7 w-7 text-vault" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink/10 bg-white p-5">
      <div className="mb-3 h-32 rounded-xl bg-ink/5" />
      <div className="mb-2 h-3.5 w-3/4 rounded bg-ink/10" />
      <div className="mb-2 h-3.5 w-1/2 rounded bg-ink/10" />
      <div className="h-3 w-1/3 rounded bg-ink/5" />
    </div>
  );
}
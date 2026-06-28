import Link from "next/link";

export default function EmptyState({ icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-ink/60">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-vault px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-vault-light"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
export default function StatCard({ label, value, hint, accent = "vault" }) {
  const accents = {
    vault: "text-vault bg-vault/8",
    brass: "text-brass-dark bg-brass/10",
    mint: "text-mint-dark bg-mint/10",
    seal: "text-seal bg-seal/8",
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
      {hint && (
        <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${accents[accent]}`}>
          {hint}
        </span>
      )}
    </div>
  );
}
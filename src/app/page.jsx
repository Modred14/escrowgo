import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SealMark from "@/components/Sealmark";

export const metadata = {
  title: "EscrowGO — Secure deals, verified delivery",
};

const STEPS = [
  {
    n: "01",
    title: "Seller creates a secure deal",
    body: "List the item, set a price, upload photos, and choose EscrowGO Delivery or self-delivery. A payment link is generated instantly.",
  },
  {
    n: "02",
    title: "Buyer pays into escrow",
    body: "The buyer opens the link, reviews everything, and pays through Nomba. Funds are locked — not sent to the seller yet.",
  },
  {
    n: "03",
    title: "Item changes hands",
    body: "A courier or the seller delivers the item. The buyer gets a one-time QR code the moment delivery is marked complete.",
  },
  {
    n: "04",
    title: "Scan to release payment",
    body: "The seller or courier scans the buyer's QR code. Only then does EscrowGO release the held funds to the seller.",
  },
];

const ROLES = [
  {
    label: "Sellers",
    title: "Get paid without shipping blind",
    body: "Funds are confirmed and locked before you send anything. No more 'send first, hope they pay.'",
    href: "/auth/register",
    cta: "Create a deal",
  },
  {
    label: "Buyers",
    title: "Pay without trusting a stranger",
    body: "Your money sits in escrow until you confirm the item arrived. If delivery never happens, you're refunded automatically.",
    href: "/auth/register",
    cta: "Browse how it works",
  },
  {
    label: "Couriers",
    title: "Earn per verified drop-off",
    body: "Accept jobs near you, scan to confirm delivery, get credited instantly. No haggling over proof of delivery.",
    href: "/delivery/register",
    cta: "Become a courier",
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-paper">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-ink/10 bg-ink">
          <div className="absolute inset-0 bg-grain opacity-40" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-3.5 py-1.5 text-xs font-semibold text-brass-light">
                <span className="h-1.5 w-1.5 rounded-full bg-brass" /> Escrow
                held until delivery is verified
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] text-paper text-balance md:text-5xl">
                Nobody loses money to a stranger again.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-paper/65">
                EscrowGO holds the buyer's payment in a sealed escrow account
                the moment they pay — and only releases it to the seller once a
                QR scan confirms the item actually arrived.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/register"
                  className="rounded-full bg-brass px-6 py-3 text-sm font-semibold text-ink transition hover:bg-brass-light"
                >
                  Create a secure deal
                </Link>
                <Link
                  href="/delivery/register"
                  className="rounded-full border border-paper/20 px-6 py-3 text-sm font-semibold text-paper transition hover:border-brass hover:text-brass-light"
                >
                  Become a courier
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-xs text-paper/40">
                <span>Powered by Nomba (test mode)</span>
                <span className="h-1 w-1 rounded-full bg-paper/20" />
                <span>QR-verified release</span>
                <span className="h-1 w-1 rounded-full bg-paper/20" />
                <span>Auto-refund on missed delivery</span>
              </div>
            </div>

            <div className="relative mx-auto flex h-72 w-72 items-center justify-center md:h-80 md:w-80">
              <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-brass/30" />
              <div className="absolute inset-6 rounded-full border border-vault-light/40" />
              <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full bg-vault shadow-seal md:h-52 md:w-52">
                <SealMark size={56} />
                <span className="mt-3 font-mono text-[11px] tracking-widest text-paper/50">
                  FUNDS HELD
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-b border-ink/10 px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-brass-dark">
              The escrow ledger
            </p>
            <h2 className="mt-2 max-w-lg font-display text-3xl font-semibold text-ink">
              Four steps, in order — nothing released out of sequence.
            </h2>
            <div className="ledger-rule mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
              {STEPS.map((s) => (
                <div key={s.n} className="relative pt-2">
                  <span className="font-display text-4xl font-semibold text-ink/10">
                    {s.n}
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/55">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROLES */}
        <section className="border-b border-ink/10 bg-paper-dim px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-lg font-display text-3xl font-semibold text-ink">
              Built for everyone in the handoff.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {ROLES.map((r) => (
                <div
                  key={r.label}
                  className="flex flex-col rounded-2xl border border-ink/10 bg-white p-7"
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-brass-dark">
                    {r.label}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                    {r.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink/55">
                    {r.body}
                  </p>
                  <Link
                    href={r.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-vault hover:underline"
                  >
                    {r.cta} <span aria-hidden>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ESCROW EXPLAINER */}
        <section className="px-5 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brass-dark">
                Where's my money?
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
                It sits in escrow. Not with us, not with them.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink/60">
                "Escrow" means a trusted third party holds the money
                mid-transaction so neither side has to go first. EscrowGO plays
                that role: the buyer's payment is marked <em>held</em>, never
                paid out, until proof of delivery exists in the form of a
                scanned QR code only the buyer can generate.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                If delivery never happens by the agreed date, EscrowGO refunds
                the buyer automatically — no support ticket required.
              </p>
            </div>
            <div className="grid gap-4 rounded-2xl border border-ink/10 bg-vault p-7 text-paper">
              {[
                [
                  "Funds secured in escrow",
                  "Buyer paid. Money is locked, not yet sent to seller.",
                ],
                ["Out for delivery", "Item is in transit to the buyer."],
                [
                  "Delivered — awaiting confirmation",
                  "Buyer holds a QR code to confirm receipt.",
                ],
                [
                  "Payment released",
                  "QR scanned and verified. Seller is paid.",
                ],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="flex gap-3 border-b border-paper/10 pb-4 last:border-0 last:pb-0"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brass" />
                  <div>
                    <p className="text-sm font-semibold text-paper">{title}</p>
                    <p className="mt-0.5 text-xs text-paper/55">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-ink/10 bg-ink px-5 py-20 text-center">
          <SealMark size={40} className="mx-auto" />
          <h2 className="mx-auto mt-5 max-w-md font-display text-3xl font-semibold text-paper">
            Stop wiring money on trust alone.
          </h2>
          <Link
            href="/auth/register"
            className="mt-7 inline-flex rounded-full bg-brass px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-brass-light"
          >
            Create your first secure deal
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

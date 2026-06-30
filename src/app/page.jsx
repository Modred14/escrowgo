import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SealMark from "@/components/Sealmark";

export const metadata = {
  title: "escrowgo — Secure deals, verified delivery",
};

const STEPS = [
  {
    n: "01",
    title: "Seller creates a secure deal",
    body: "List the item, set a price, upload photos, and choose escrowgo Delivery or self-delivery. A payment link is generated instantly.",
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
    body: "The seller or courier scans the buyer's QR code. Only then does escrowgo release the held funds to the seller.",
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

const WITHOUT_REASONS = [
  "Buyers risk losing money to scams.",
  "No automatic sales records or business history.",
  "Additional escrow fees may apply.",
  "Payment release can be delayed.",
  "Fear of scams.",
];

const WITH_REASONS = [
  "QR-verified deliveries.",
  "Automatic sales records & reports.",
  "Faster payment release.",
  "Safer transactions for buyers and sellers.",
  "100% scam free. Buy with peace of mind.",
];

const DIFF_FEATURES = [
  {
    icon: "🔳",
    title: "QR-code",
    body: "Every order includes a unique encrypted QR code that's scanned before payment is released, reducing fraud and disputes.",
  },
  {
    icon: "🕘",
    title: "Records",
    body: "Every completed transaction is automatically saved, creating a reliable sales history businesses can track, download, and use for bookkeeping, growth, and future opportunities.",
  },
  {
    icon: "💳",
    title: "Secure payment",
    body: "Every payment is securely processed through Nomba, ensuring fast, reliable, and protected transactions from start to finish.",
  },
];

export default function LandingPage() {
  return (
    <>
      {" "}
      <div className="bg-home">
        <Navbar />

        <section className="relative overflow-hidden border-b border-ink/10">
          <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-16 text-center md:pb-28 md:pt-24">
            <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-3.5 py-1.5 text-xs font-semibold text-brass-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" /> Powering
              the future of e-Business
            </span>

            <h1 className="animate-fade-in-up [animation-delay:80ms] mt-6 text-balance font-display text-5xl font-semibold leading-[1.05] text-ink md:text-7xl">
              Scan, Deliver, <span className="text-brass">Get paid</span>
            </h1>

            <p className="animate-fade-in-up [animation-delay:160ms] mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-ink/60 md:text-lg">
              <span className="text-brass font-bold">EscrowGo</span> allows
              you to complete every transaction with confidence using secure
              QR verification, instant payment release after delivery, and
              detailed business records that support growth and future
              opportunities.
            </p>

            <div className="animate-fade-in-up [animation-delay:240ms] mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3.5 text-sm font-semibold hover:text-gray-100 text-ink shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#705A2F] hover:shadow-lg"
              >
                Get Started
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-full border border-ink/15 bg-white px-7 py-3.5 text-sm font-semibold text-brass-dark transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-md"
              >
                How it works
              </Link>
            </div>

            {/* availability strip */}
            <div className="animate-fade-in-up [animation-delay:320ms] mx-auto mt-16 grid max-w-3xl gap-10 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-ink/50">
                  Available in cities near you
                </p>
                <div className="mt-3 flex items-center justify-center gap-3 sm:justify-start">
                  {["🏝️", "🌆", "🏙️", "🏛️", "🌇"].map((e, i) => (
                    <span
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white text-sm shadow-sm transition-transform duration-300 hover:-translate-y-1"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-ink/50">
                  Supports all types of physical &amp; online businesses
                </p>
                <div className="mt-3 flex items-center justify-center gap-3 sm:justify-start">
                  {["📦", "👗", "💻", "🛒", "🚚"].map((e, i) => (
                    <span
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white text-sm shadow-sm transition-transform duration-300 hover:-translate-y-1"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <main className="bg-paper">
          {/* HOW IT WORKS */}
          <section
            id="how-it-works"
            className="border-b border-ink/10 px-5 py-20"
          >
            <div className="mx-auto max-w-6xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-brass-dark">
                The escrow ledger
              </p>
              <h2 className="mt-2 max-w-lg font-display text-3xl font-semibold text-ink">
                Four steps, in order — nothing released out of sequence.
              </h2>
              <div className="ledger-rule mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
                {STEPS.map((s) => (
                  <div
                    key={s.n}
                    className="group relative rounded-2xl pt-2 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <span className="font-display text-4xl font-semibold text-ink/10 transition-colors duration-300 group-hover:text-brass/30">
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
                    className="flex flex-col rounded-2xl border border-ink/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                      className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-vault transition-colors hover:text-brass-dark"
                    >
                      {r.cta}{" "}
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
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
                  mid-transaction so neither side has to go first. escrowgo
                  plays that role: the buyer's payment is marked <em>held</em>,
                  never paid out, until proof of delivery exists in the form of
                  a scanned QR code only the buyer can generate.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">
                  If delivery never happens by the agreed date, escrowgo refunds
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
                    className="flex gap-3 border-b border-paper/10 pb-4 transition-colors duration-300 last:border-0 last:pb-0 hover:bg-white/5"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brass" />
                    <div>
                      <p className="text-sm font-semibold text-paper">
                        {title}
                      </p>
                      <p className="mt-0.5 text-xs text-paper/55">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DIFFERENCE / COMPARISON */}
          <section className="border-t border-ink/10 bg-paper-dim px-5 py-20">
            <div className="mx-auto max-w-6xl">
              <h2 className="animate-fade-in-up [animation-delay:60ms] mx-auto mt-2 max-w-xl text-balance text-center font-display text-3xl font-semibold text-ink md:text-4xl">
                How&apos;s EscrowGo different?
              </h2>

              <div className="mt-12 grid gap-6 md:grid-cols-2">
                {/* WITHOUT */}
                <div className="animate-fade-in-up [animation-delay:120ms] rounded-2xl border border-ink/10 bg-ink/[0.04] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                    <span aria-hidden>⏱️</span> Without EscrowGo
                  </span>
                  <h3 className="mt-5 text-balance font-display text-lg font-semibold leading-snug text-ink md:text-xl">
                    The lack of secure payment verification exposes buyers to
                    fraud and financial loss.
                  </h3>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink/40">
                    Reasons
                  </p>
                  <ul className="mt-3 space-y-4">
                    {WITHOUT_REASONS.map((reason) => (
                      <li
                        key={reason}
                        className="flex items-start gap-2.5 text-sm text-ink/65"
                      >
                        <span className="mt-0.5 text-red-500" aria-hidden>
                          ✕
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WITH */}
                <div className="animate-fade-in-up [animation-delay:180ms] rounded-2xl border border-brass/30 bg-brass/10 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/40 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brass-dark">
                    <span aria-hidden>✅</span> With EscrowGo
                  </span>
                  <h3 className="mt-5 text-balance font-display text-lg font-semibold leading-snug text-ink md:text-xl">
                    EscrowGo is the solution for people trying to buy and sell
                    safely and securely.
                  </h3>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brass-dark/70">
                    Reasons
                  </p>
                  <ul className="mt-3 space-y-4">
                    {WITH_REASONS.map((reason) => (
                      <li
                        key={reason}
                        className="flex items-start gap-2.5 text-sm text-ink/70"
                      >
                        <span className="mt-0.5 text-emerald-600" aria-hidden>
                          ✓
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FEATURE CARDS */}
              <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {DIFF_FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    style={{ animationDelay: `${240 + i * 60}ms` }}
                    className="animate-fade-in-up group flex flex-col rounded-2xl border border-ink/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-lg"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass/10 text-lg transition-transform duration-300 group-hover:scale-110">
                      {f.icon}
                    </span>
                    <h4 className="mt-4 font-display text-base font-semibold uppercase tracking-wide text-ink">
                      {f.title}
                    </h4>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/55">
                      {f.body}
                    </p>
                    <Link
                      href="/marketplace"
                      className="group/link mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brass-dark transition-colors hover:text-brass"
                    >
                      Browse marketplace
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover/link:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* POWERED BY NOMBA */}
{/* POWERED BY NOMBA */}
<section className="relative overflow-hidden border-t border-ink/10 px-5 py-24 text-center">
  {/* ambient cream gradient backdrop */}
  <div
    aria-hidden
    className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,#fff7e6_0%,transparent_45%),radial-gradient(circle_at_85%_75%,#fdf2e0_0%,transparent_50%)] bg-paper"
  />
  {/* faint dot-grid texture */}
  <div
    aria-hidden
    className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(theme(colors.ink/12%)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black_30%,transparent_85%)]"
  />
  {/* watermark padlock, top-right */}
  <svg
    aria-hidden
    viewBox="0 0 100 100"
    className="absolute -right-4 top-6 h-32 w-32 text-brass/[0.10] md:h-44 md:w-44"
  >
    <rect x="22" y="44" width="56" height="44" rx="10" fill="currentColor" />
    <path
      d="M32 44V32a18 18 0 0 1 36 0v12"
      stroke="currentColor"
      strokeWidth="9"
      fill="none"
    />
  </svg>
  {/* faint world-map style arcs, bottom-left */}
  <svg
    aria-hidden
    viewBox="0 0 200 200"
    className="absolute -left-10 bottom-0 h-48 w-48 text-ink/[0.05] md:h-64 md:w-64"
  >
    <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>

  <div className="relative mx-auto max-w-2xl">
    <h2 className="animate-fade-in-up text-balance font-display text-3xl font-semibold text-ink md:text-4xl">
      Powered by <span className="text-brass">Nomba.</span>
    </h2>

    <p className="animate-fade-in-up [animation-delay:80ms] mx-auto mt-6 max-w-xl text-balance text-sm leading-relaxed text-ink/60 md:text-[15px]">
      Every payment is securely processed through Nomba&apos;s trusted
      payment infrastructure, while encrypted QR verification confirms
      every successful delivery before funds are released. Each completed
      transaction is automatically recorded, giving businesses a reliable
      digital sales history they can download, track, and use to support
      growth, bookkeeping, and future opportunities.
    </p>

    <div className="animate-fade-in-up [animation-delay:180ms] mt-5 flex justify-center">
  <div className="group flex h-15 w-40 items-center justify-center overflow-hidden rounded-[22px] bg-brass shadow-[0_12px_30px_-8px_theme(colors.brass/55%)] transition-transform duration-300 hover:-translate-y-1 hover:scale-105 ">
    <img
      src="https://nomba.com/nomba-social-preview.png"
      alt="Nomba"
      className="h-full w-full scale-170 object-cover object-center"
     
    />
    <div className="hidden h-full w-full items-center justify-center">
      <svg viewBox="0 0 48 48" className="h-9 w-9 md:h-11 md:w-11" fill="none">
        <path
          d="M10 10 L38 38 M38 10 L10 38"
          stroke="#161311"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  </div>
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
              className="mt-7 inline-flex rounded-full bg-brass px-7 py-3.5 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-light hover:shadow-lg"
            >
              Create your first secure deal
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
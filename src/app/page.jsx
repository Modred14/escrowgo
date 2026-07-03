"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SealMark from "@/components/Sealmark";
import { X, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import RolesSection from "@/components/Roles";
import { QrCode, ClipboardList, ShieldCheck } from "lucide-react";
import HowItWorks from "@/components/How";
import FAQ from "@/components/Faq";
import { useState, useEffect } from "react";
import Reveal from "@/components/reveal";
import { ChevronDown, MessageCircleQuestion, ArrowUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Revealright from "@/components/revealfright";
import RevealLeft from "@/components/revealfrleft";

const FAQS = [
  {
    q: "Why use EscrowGo?",
    a: "Buying and selling secondhand online usually means trusting a stranger with your money or your product first. EscrowGo removes that risk — the buyer's payment is locked safely until the item is delivered and confirmed, so neither side has to go first on faith.",
  },
  {
    q: "Where is my money held during the transaction?",
    a: "Once a buyer pays, funds move into a secure escrow account managed by EscrowGo — not the seller's pocket. The money only releases to the seller after the buyer receives the item and it's verified with the delivery QR code.",
  },
  {
    q: "What happens if someone tries to scam me?",
    a: "Because payment is held in escrow until delivery is confirmed, a seller can't take your money and disappear, and a buyer can't claim non-delivery on an item that scanned successfully. If a dispute does come up, our team can review the order timeline, QR scan, and delivery details to resolve it fairly.",
  },
  {
    q: "What if, as a seller, I don't have a courier?",
    a: 'No problem — when you list a product, you can choose EscrowGo\'s courier network for pickup and delivery, or select "self delivery" and hand off the item yourself. Either way, the QR verification step works the same.',
  },
  {
    q: "How do I receive my payment?",
    a: 'As soon as the buyer\'s QR code is scanned and the delivery is marked complete, payment releases automatically to your linked payout account — no invoicing, no waiting on the buyer to "confirm receipt" manually.',
  },
  {
    q: "What happens if my product isn't delivered by the specified date?",
    a: "If a delivery misses its window, the order is automatically flagged and you'll get a notification and our support team steps in — your payment stays protected in escrow the whole time.",
  },
  {
    q: "How do I become a delivery rider?",
    a: "Head to the Riders tab and apply with a valid ID and proof of a working vehicle or bike. Once approved, you'll start seeing nearby delivery requests you can accept, and get paid per completed, QR-verified drop-off.",
  },
  {
    q: "What makes EscrowGo different from other escrow services?",
    a: "EscrowGo is built specifically for peer-to-peer product sales, not big-ticket contracts. It bundles escrow, delivery coordination, and QR-verified handoffs into one link a seller can generate in seconds — plus every completed sale is automatically logged into a business record you can track and download.",
  },
];

const STATES = [
  { name: "Nigeria", src: "/nig.png" },
  { name: "Ghana", src: "/ghana.svg" },
  { name: "Senegal", src: "/senegal.svg" },
  { name: "Togo", src: "/togo.svg" },
  { name: "Cameroon", src: "/cameroon.webp" },
];
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
    icon: QrCode,
    title: "QR-code",
    body: "Every order includes a unique encrypted QR code that's scanned before payment is released, reducing fraud and disputes.",
  },
  {
    icon: ClipboardList,
    title: "Records",
    body: "Every completed transaction is automatically saved, creating a reliable sales history businesses can track, download, and use for bookkeeping, growth, and future opportunities.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payment",
    body: "Every payment is securely processed through Nomba, ensuring fast, reliable, and protected transactions from start to finish.",
  },
];

export default function LandingPage() {
  const [openIndex, setOpenIndex] = useState(-1);
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? -1 : i));

  useEffect(() => {
    if (status === "authenticated") {
      setUser(session?.user ?? null);
    } else {
      setUser(null);
    }
  }, [session, status]);
  return (
    <>
      {" "}
      <div className="bg-home">
        <Navbar />
        <Reveal>
          <section className="relative overflow-hidden border-b border-black/10">
            <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-16 text-center md:pb-30 md:pt-28">
              <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-3.5 py-1.5 text-xs font-semibold text-brass-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-brass" /> Powering
                the future of e-Business
              </span>

              <h1 className="animate-fade-in-up [animation-delay:80ms] mt-6 text-balance font-display text-5xl font-semibold leading-[1.05] text-black md:text-7xl">
                Scan, Deliver, <span className="text-brass">Get paid</span>
              </h1>

              <p className="animate-fade-in-up [animation-delay:160ms] mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-black md:text-lg">
                <span className="text-brass font-bold">EscrowGo</span> allows
                you to complete every transaction with confidence using secure
                QR verification, instant payment release after delivery, and
                detailed business records that support growth and future
                opportunities.
              </p>

              <div className="animate-fade-in-up [animation-delay:240ms] mt-9 flex flex-wrap items-center justify-center gap-3">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="group inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3.5 text-sm font-semibold hover:text-gray-100 text-black shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#705A2F] hover:shadow-lg"
                    >
                      Dashboard
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="group inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3.5 text-sm font-semibold hover:text-gray-100 text-black shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#705A2F] hover:shadow-lg"
                    >
                      Get Started
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </>
                )}
                <Link
                  href="#how-it-works"
                  className="rounded-full border border-black/15 bg-white px-7 py-3.5 text-sm font-semibold text-brass-dark transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-md"
                >
                  How it works
                </Link>
              </div>

              {/* availability strip */}
              <div className="animate-fade-in-up [animation-delay:320ms] mx-auto mt-16 grid max-w-3xl gap-10 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-black">
                    Available in countries near you
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3 ">
                    {STATES.map((s) => (
                      <span
                        key={s.name}
                        title={s.name}
                        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1"
                      >
                        <Image
                          src={s.src}
                          alt={`${s.name}`}
                          width={28}
                          height={28}
                          className="h-full w-full object-cover object-center"
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-black">
                    Supports all types of physical &amp; online businesses
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3 ">
                    {["📦", "👗", "💻", "🛒", "🚚"].map((e, i) => (
                      <span
                        key={i}
                        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
        <main className="bg-white">
          <Reveal>
            <section className="border-t border-black/10 overflow-x-hidden px-5 py-20">
              <div className="mx-auto max-w-6xl">
                <p className="animate-fade-in-up mx-auto w-full flex justify-center [animation-delay:40ms] text-xs font-semibold uppercase tracking-widest text-ink/40">
                  Why EscrowGo?
                </p>
                <h2 className="animate-fade-in-up [animation-delay:60ms] mx-auto mt-2 max-w-xl text-balance text-center font-display text-3xl font-semibold text-brass md:text-4xl">
                  What makes EscrowGo different
                </h2>

                <div className="mt-12 grid gap-6 md:grid-cols-2">
                  <Revealright>
                    <div className="animate-fade-in-up [animation-delay:120ms] rounded-2xl border border-red-200 bg-red-50/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-8">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                        <span aria-hidden>⏱️</span> Without EscrowGo
                      </span>
                      <h3 className="mt-5 text-balance font-display text-lg font-semibold leading-snug text-black md:text-xl">
                        The lack of secure payment verification exposes buyers
                        to fraud and financial loss.
                      </h3>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-red-500/70">
                        Reasons
                      </p>
                      <ul className="mt-3 space-y-4">
                        {WITHOUT_REASONS.map((reason) => (
                          <li
                            key={reason}
                            className="flex items-start gap-3 text-sm text-black/90"
                          >
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                              <X size={12} className="text-red-500" />
                            </div>
                            <span className="pt-0.5">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Revealright>
                  <RevealLeft>
                    <div className="animate-fade-in-up [animation-delay:180ms] rounded-2xl border border-green-200 bg-green-50/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-8">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-600">
                        <span aria-hidden>✅</span> With EscrowGo
                      </span>
                      <h3 className="mt-5 text-balance font-display text-lg font-semibold leading-snug text-black md:text-xl">
                        EscrowGo is the solution for people trying to buy and
                        sell safely and securely.
                      </h3>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-green-600/70">
                        Reasons
                      </p>
                      <ul className="mt-3 space-y-4">
                        {WITH_REASONS.map((reason) => (
                          <li
                            key={reason}
                            className="flex items-start gap-3 text-sm text-black/90"
                          >
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                              <CheckCircle2
                                size={12}
                                className="text-green-500"
                              />
                            </div>
                            <span className="pt-0.5">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </RevealLeft>
                </div>
<div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
  {DIFF_FEATURES.map((f, i) => {
    const Icon = f.icon;
    const Reveal = i % 2 === 0 ? RevealLeft : Revealright;
    return (
      <Reveal key={f.title} delay={240 + i * 60}>
        <div className="group flex flex-col rounded-2xl border h-full border-black/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-lg">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass/10 text-lg transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-5 w-5 text-brass-dark" />
          </span>
          <h4 className="mt-4 font-display text-base font-semibold uppercase tracking-wide text-black">
            {f.title}
          </h4>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-black/95">
            {f.body}
          </p>
        </div>
      </Reveal>
    );
  })}
</div>
              </div>
            </section>
          </Reveal>
          <Reveal>
            <section className=" px-5 py-20">
              <div className="mx-auto max-w-6xl">
                <p className="animate-fade-in-up mx-auto w-full flex justify-center [animation-delay:40ms] text-xs font-semibold uppercase tracking-widest text-ink/40">
                  WHO NEEDS ESCROWGO?
                </p>
                <h2 className="animate-fade-in-up [animation-delay:60ms] mx-auto mt-2 max-w-xl text-balance text-center font-display text-3xl font-semibold text-brass md:text-4xl">
                  One platform , Multilple uses
                </h2>

                <RolesSection />
              </div>
            </section>
          </Reveal>
          <Reveal>
            <section id="how-it-works">
              <HowItWorks />
            </section>
          </Reveal>
          <Reveal>
            {" "}
            <section className="relative w-full bg-[#FFFBEF] px-4 py-16 sm:px-8 sm:py-20 lg:py-24">
              <style>{`
        @keyframes faqRise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .faq-item {
          animation: faqRise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .faq-panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .faq-panel.is-open {
          grid-template-rows: 1fr;
        }
        .faq-panel > div {
          overflow: hidden;
          min-height: 0;
        }
      `}</style>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
                <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl" />
              </div>

              <div className="relative mx-auto max-w-6xl">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16 lg:items-start">
                  <div className="text-center lg:sticky lg:top-24 lg:h-fit lg:text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                      FAQs
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                      <span className="relative inline-block">
                        Questions mostly asked
                        <svg
                          aria-hidden
                          viewBox="0 0 200 10"
                          preserveAspectRatio="none"
                          className="absolute -bottom-1.5 left-0 h-2.5 w-full text-amber-400"
                        >
                          <path
                            d="M2 7 C 40 2, 160 2, 198 7"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-stone-500 sm:text-base lg:mx-0">
                      Everything you need to know about EscrowGo, and how it
                      works.
                    </p>

                    <Link
                      href="/contact"
                      className="group mx-auto mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 underline decoration-amber-300 decoration-2 underline-offset-4 transition-colors hover:text-amber-700 lg:mx-0"
                    >
                      Still have questions? Contact us
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>

                  <div className="flex flex-col gap-4">
                    {FAQS.map((item, i) => {
                      const isOpen = openIndex === i;
                      return (
                        <div
                          key={item.q}
                          style={{ animationDelay: `${i * 60}ms` }}
                          className={`faq-item overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                            isOpen
                              ? "border-amber-300 shadow-md shadow-amber-100"
                              : "border-stone-200 hover:border-amber-200 hover:shadow-sm"
                          }`}
                        >
                          <button
                            onClick={() => toggle(i)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                          >
                            <span
                              className={`text-[15px] font-semibold transition-colors duration-300 sm:text-base ${
                                isOpen ? "text-amber-700" : "text-stone-800"
                              }`}
                            >
                              {item.q}
                            </span>
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-300 ${
                                isOpen
                                  ? "rotate-180 bg-amber-400 text-white"
                                  : "bg-stone-100 text-amber-500"
                              }`}
                            >
                              <ChevronDown
                                className="h-4 w-4"
                                strokeWidth={2.5}
                              />
                            </span>
                          </button>

                          <div
                            className={`faq-panel ${isOpen ? "is-open" : ""}`}
                          >
                            <div>
                              <p className="px-5 pb-5 text-sm leading-relaxed text-stone-600 sm:px-6 sm:pb-6 sm:text-[15px]">
                                {item.a}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            {" "}
            <section className="relative overflow-hidden px-5 py-24 text-center">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,#fff7e6_0%,transparent_45%),radial-gradient(circle_at_85%_75%,#fdf2e0_0%,transparent_50%)] bg-paper"
              />
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(theme(colors.black/12%)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black_30%,transparent_85%)]"
              />
              <svg
                aria-hidden
                viewBox="0 0 100 100"
                className="absolute -right-4 top-6 h-32 w-32 text-brass/[0.10] md:h-44 md:w-44"
              >
                <rect
                  x="22"
                  y="44"
                  width="56"
                  height="44"
                  rx="10"
                  fill="currentColor"
                />
                <path
                  d="M32 44V32a18 18 0 0 1 36 0v12"
                  stroke="currentColor"
                  strokeWidth="9"
                  fill="none"
                />
              </svg>
              <svg
                aria-hidden
                viewBox="0 0 200 200"
                className="absolute -left-10 bottom-0 h-48 w-48 text-black/[0.05] md:h-64 md:w-64"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>

              <div className="relative mx-auto max-w-5xl">
                <div className="bg-white rounded-2xl backdrop-blur-sm w-fit mx-auto p-2 px-3 border border-gray-800/20">
                  <h2 className="animate-fade-in-up text-balance font-display text-2xl font-semibold text-black md:text-3xl">
                    Powered by <span className="text-brass">Nomba</span>
                  </h2>
                </div>

                <p className="animate-fade-in-up [animation-delay:80ms] mx-auto mt-6 max-w-5xl text-balance text-sm sm:text-base leading-relaxed font-bold ">
                  Every payment is securely processed through Nomba&apos;s
                  trusted payment infrastructure, while encrypted QR
                  verification confirms every successful delivery before funds
                  are released. Each completed transaction is automatically
                  recorded, giving businesses a reliable digital sales history
                  they can download, track, and use to support growth,
                  bookkeeping, and future opportunities.
                </p>

                <div className="animate-fade-in-up [animation-delay:180ms] mt-5 flex justify-center">
                  <Link
                    href="https://nomba.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {" "}
                    <div className="group flex h-15 w-40 items-center justify-center overflow-hidden rounded-[22px] bg-brass shadow-[0_12px_30px_-8px_theme(colors.brass/55%)] transition-transform duration-300 hover:-translate-y-1 hover:scale-105 ">
                      <img
                        src="https://nomba.com/nomba-social-preview.png"
                        alt="Nomba"
                        className="h-full w-full scale-170 object-cover object-center"
                      />
                      <div className="hidden h-full w-full items-center justify-center">
                        <svg
                          viewBox="0 0 48 48"
                          className="h-9 w-9 md:h-11 md:w-11"
                          fill="none"
                        >
                          <path
                            d="M10 10 L38 38 M38 10 L10 38"
                            stroke="#161311"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>{" "}
                  </Link>
                </div>
              </div>
            </section>
          </Reveal>
        </main>
        <Footer />
      </div>
    </>
  );
}

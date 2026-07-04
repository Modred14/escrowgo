"use client";
import { useState } from "react";
import {
  Search,
  Link2,
  ShieldCheck,
  QrCode,
  PackageCheck,
  UploadCloud,
  Wallet,
  Truck,
  ClipboardCheck,
  ClipboardList,
  PackageSearch,
  CheckCircle2,
  User,
  Store,
} from "lucide-react";
import RevealLeft from "./revealfrleft";
import RevealRight from "./revealfright";

const ROLES = [
  {
    key: "buyer",
    label: "Buyer",
    icon: User,
    accent: "amber",
    steps: [
      {
        icon: Search,
        title: "Discover",
        text: "You're scrolling your phone and spot something you like. Message the seller to start the order.",
      },
      {
        icon: Link2,
        title: "Review the link",
        text: "Open the payment link the seller sends. Check the price, item, and delivery details before you commit.",
      },
      {
        icon: ShieldCheck,
        title: "Pay securely",
        text: "Complete payment through EscrowGo. Your money is held safely until the item is in your hands.",
      },
      {
        icon: QrCode,
        title: "Get your QR code",
        text: "Receive a unique QR code tied to your order — it's your proof of delivery when the item arrives.",
        highlight: true,
      },
      {
        icon: PackageCheck,
        title: "Confirm & track",
        text: "Show your QR code on delivery. Once it's confirmed, the order is saved to your purchase history for good.",
      },
    ],
  },
  {
    key: "seller",
    label: "Seller",
    icon: Store,
    accent: "emerald",
    steps: [
      {
        icon: UploadCloud,
        title: "List your item",
        text: "Visit EscrowGo and tap \u201cList Product.\u201d Upload photos, set your price, and set your delivery location.",
      },
      {
        icon: Link2,
        title: "Generate a link",
        text: "Choose your courier option and click \u201cGenerate Link\u201d to create a secure payment page for your buyer.",
      },
      {
        icon: Wallet,
        title: "Buyer pays",
        text: "Once your buyer completes payment, funds are held in escrow instantly — no upfront risk, no chasing anyone.",
      },
      {
        icon: Truck,
        title: "Hand off delivery",
        text: "Package the item for pickup and choose our courier network or handle the delivery run yourself.",
      },
      {
        icon: ClipboardCheck,
        title: "Get paid & recorded",
        text: "The moment delivery is confirmed, payment releases instantly and the sale logs straight to your business records.",
      },
    ],
  },
  {
    key: "courier",
    label: "Courier",
    icon: Truck,
    accent: "indigo",
    steps: [
      {
        icon: ClipboardList,
        title: "Accept the job",
        text: "Browse delivery requests posted by sellers near you and accept the ones that fit your route.",
      },
      {
        icon: PackageSearch,
        title: "Pick up the item",
        text: "Collect the packaged item from the seller and confirm pickup right in the app.",
      },
      {
        icon: Truck,
        title: "Deliver to buyer",
        text: "Head to the delivery address and hand the item to the buyer in person, right on schedule.",
      },
      {
        icon: QrCode,
        title: "Scan to verify",
        text: "Ask the buyer for their unique QR code and scan it to confirm the order details match exactly.",
        highlight: true,
      },
      {
        icon: CheckCircle2,
        title: "Mark complete",
        text: "Once verified, mark the delivery done. Payment releases to the seller and your run is logged automatically.",
      },
    ],
  },
];

const ACCENTS = {
  amber: {
    text: "text-amber-600",
    textStrong: "text-amber-700",
    bg: "bg-amber-500",
    bgSoft: "bg-amber-50",
    border: "border-amber-200",
    ring: "ring-amber-300",
    chip: "bg-amber-100 text-amber-700",
    glow: "shadow-amber-200/60",
    gradient: "from-amber-400 to-orange-400",
  },
  emerald: {
    text: "text-amber-600",
    textStrong: "text-amber-700",
    bg: "bg-amber-500",
    bgSoft: "bg-amber-50",
    border: "border-amber-200",
    ring: "ring-amber-300",
    chip: "bg-amber-100 text-amber-700",
    glow: "shadow-amber-200/60",
    gradient: "from-amber-400 to-orange-400",
  },
  indigo: {
    text: "text-amber-600",
    textStrong: "text-amber-700",
    bg: "bg-amber-500",
    bgSoft: "bg-amber-50",
    border: "border-amber-200",
    ring: "ring-amber-300",
    chip: "bg-amber-100 text-amber-700",
    glow: "shadow-amber-200/60",
    gradient: "from-amber-400 to-orange-400",
  },
};

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const role = ROLES[activeIndex];
  const a = ACCENTS[role.accent];

  return (
    <section className="relative w-full overflow-hidden bg-[#FFFBEF] px-4 py-16 sm:px-8 sm:py-20 lg:py-24">
      <style>{`
        @keyframes howItWorksRise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hiw-card {
          animation: howItWorksRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes hiwPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.25); }
          50% { box-shadow: 0 0 0 10px rgba(217, 119, 6, 0); }
        }
        .hiw-pulse { animation: hiwPulse 2.2s ease-out infinite; }
      `}</style>

      {/* Ambient background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
            How it all works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-[2.75rem]">
            From Payment to{" "}
            <span
              className={`bg-gradient-to-r ${a.gradient} bg-clip-text text-transparent transition-all duration-500`}
            >
              Delivery
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm text-stone-500 sm:text-base">
            One secure flow, three points of view. See how a trade moves from
            first message to money in the bank.
          </p>
        </div>

        {/* Role toggle */}
        <div className="mt-8 flex justify-center sm:mt-10">
          <div className="relative inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
            <div
              className={`absolute inset-y-1 rounded-full bg-gradient-to-r ${a.gradient} transition-all duration-300 ease-out`}
              style={{
                width: `calc(${100 / ROLES.length}% - 4px)`,
                left: `calc(${(100 / ROLES.length) * activeIndex}% + 2px)`,
              }}
            />
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={r.key}
                  onClick={() => setActiveIndex(i)}
                  className={`relative z-10 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 sm:px-6 ${
                    isActive
                      ? "text-white"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Steps grid — layout preserved: 2x2 then full-width 5th card */}
        <div
          key={role.key}
          className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6"
        >
          {role.steps.map((step, i) => {
            const StepIcon = step.icon;
            const isLast = i === role.steps.length - 1;
            const Reveal = i % 2 === 0 ? RevealLeft : RevealRight;
            return (
              <Reveal
                key={`${role.key}-${i}`}
                delay={i * 80}
                className={isLast ? "sm:col-span-2" : ""}
              >
                <div
                  className={`hiw-card group relative rounded-2xl border ${a.border} bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:${a.glow} sm:p-7`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${a.chip}`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${a.bgSoft} ${a.text} ${
                        step.highlight ? "hiw-pulse" : ""
                      } transition-transform duration-300 group-hover:scale-110`}
                    >
                      <StepIcon className="h-5 w-5" strokeWidth={2} />
                    </span>
                  </div>

                  <h3
                    className={`mt-4 text-xs font-bold uppercase tracking-wider ${a.textStrong}`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
                    {step.text}
                  </p>

                  {!isLast && (
                    <div
                      aria-hidden
                      className={`absolute -bottom-3 left-1/2 hidden h-3 w-px -translate-x-1/2 ${a.bg}/30 sm:block`}
                    />
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Footer micro-trust row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-stone-400 sm:mt-12">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Funds held in escrow
          </span>
          <span className="flex items-center gap-1.5">
            <QrCode className="h-3.5 w-3.5" /> QR-verified handoff
          </span>
          <span className="flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" /> Auto-logged records
          </span>
        </div>
      </div>
    </section>
  );
}

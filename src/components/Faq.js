import { useState } from "react";
import { ChevronDown, MessageCircleQuestion, ArrowUpRight } from "lucide-react";

/**
 * FAQ — "Questions mostly asked"
 * Drop-in section for a landing page. Requires Tailwind + lucide-react.
 *
 * <FAQ /> — no props required.
 * Pass onContactClick to override the default "Contact us" behavior.
 */

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
    a: "No problem — when you list a product, you can choose EscrowGo's courier network for pickup and delivery, or select \"self delivery\" and hand off the item yourself. Either way, the QR verification step works the same.",
  },
  {
    q: "How do I receive my payment?",
    a: "As soon as the buyer's QR code is scanned and the delivery is marked complete, payment releases automatically to your linked payout account — no invoicing, no waiting on the buyer to \"confirm receipt\" manually.",
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

export default function FAQ({ onContactClick }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? -1 : i));

  return (
    <section className="relative w-full overflow-hidden bg-[#FFFBEF] px-4 py-16 sm:px-8 sm:py-20 lg:py-24">
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

      {/* Ambient background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          {/* Left column */}
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
              Everything you need to know about EscrowGo, and how it works.
            </p>

            <button
              onClick={onContactClick}
              className="group mx-auto mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 underline decoration-amber-300 decoration-2 underline-offset-4 transition-colors hover:text-amber-700 lg:mx-0"
            >
              Still have questions? Contact us
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <div className="mx-auto mt-8 hidden max-w-xs items-start gap-3 rounded-2xl border border-amber-200 bg-white/70 p-4 text-left backdrop-blur-sm sm:flex lg:mx-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <MessageCircleQuestion className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-xs leading-relaxed text-stone-500">
                Can't find your answer here? Our support team typically
                replies within a few hours.
              </p>
            </div>
          </div>

          {/* Right column — accordion */}
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
                      <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </button>

                  <div className={`faq-panel ${isOpen ? "is-open" : ""}`}>
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
  );
}
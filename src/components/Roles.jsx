"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

const TABS = ["Buyer", "Seller", "Courier"];

/* ─── Phone sub-components ─────────────────────────────────────── */

function PhoneFrame({ children }) {
  return (
    <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-[2.5rem] border-[6px] border-gray-900 bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-gray-900 px-5 py-1.5">
        <span className="text-[10px] font-medium text-white">9:41</span>
        <span className="text-[10px] text-white">▌▌▌ 🔋</span>
      </div>
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
          S
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-800">Seller</p>
          <p className="text-[9px] text-green-500">● Online</p>
        </div>
      </div>
      <div className="max-h-[340px] overflow-y-auto bg-gray-50">{children}</div>
      <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2">
        <div className="flex-1 rounded-full bg-gray-100 px-3 py-1.5 text-[10px] text-gray-400">
          Message…
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, children }) {
  return (
    <div
      className={`flex px-3 py-1 ${side === "right" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-2.5 py-1.5 text-[10px] leading-relaxed ${
          side === "right"
            ? "rounded-br-sm bg-yellow-300 text-gray-900"
            : "rounded-bl-sm bg-white text-gray-700 shadow-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Link({ children }) {
  return (
    <div className="flex justify-start px-3 py-1">
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white px-2.5 py-1.5 text-[10px] text-blue-500 underline shadow-sm">
        {children}
      </div>
    </div>
  );
}

function BuyerPhone() {
  return (
    <PhoneFrame>
      <div className="flex flex-col gap-0.5 py-2">
        <div className="mx-3 mb-1 rounded-xl bg-gray-100 p-2 text-center text-[9px] text-gray-500">
          🔒 Messages are end-to-end encrypted.
        </div>
        <Bubble side="right">
          I want to buy the hoodie you listed on instagram.
        </Bubble>
        <Bubble side="left">
          I would love to use EscrowGo for fast and secure delivery
        </Bubble>
        <Link>https://escrow-go.netlify.app/</Link>
        <Bubble side="left">Kindly checkout your goods and make payment</Bubble>
        <Bubble side="right">Done, I've gotten my QR-CODE</Bubble>
        <Bubble side="right">
          I've gotten my product. It's exactly what I ordered, the delivery
          driver just scanned my QR Code.
        </Bubble>
        <Bubble side="left">I've received my payment.</Bubble>
      </div>
    </PhoneFrame>
  );
}

function SellerPhone() {
  return (
    <PhoneFrame>
      <div className="flex flex-col gap-0.5 py-2">
        <div className="mx-3 mb-1 rounded-xl bg-gray-100 p-2 text-center text-[9px] text-gray-500">
          🔒 Messages are end-to-end encrypted.
        </div>
        <Bubble side="right">
          I want to buy the hoodie you listed on instagram.
        </Bubble>
        <Bubble side="left">
          I would love to use EscrowGo for fast and secure delivery
        </Bubble>
        <Link>https://escrow-go.netlify.app/</Link>
        <Bubble side="left">Kindly checkout your goods and make payment</Bubble>
        <Bubble side="right">Done, I've gotten my QR-CODE</Bubble>
        <Bubble side="right">
          The delivery driver just scanned my QR Code and got to know what I
          ordered.
        </Bubble>
        <Bubble side="left">I've received my payment.</Bubble>
      </div>
    </PhoneFrame>
  );
}

function CourierPhone() {
  return (
    <PhoneFrame>
      <div className="flex flex-col gap-0.5 py-2">
        <div className="mx-3 mb-1 rounded-xl bg-gray-100 p-2 text-center text-[9px] text-gray-500">
          🔒 Secure delivery confirmation
        </div>
        <Bubble side="left">
          New job: deliver a hoodie to 12 Broad St, Lagos.
        </Bubble>
        <Bubble side="right">I accepted the job — on my way.</Bubble>
        <Bubble side="right">Item picked up. Heading to buyer now.</Bubble>
        <Link>Scan QR to confirm delivery →</Link>
        <Bubble side="right">Buyer presented QR code. Scanning now…</Bubble>
        <Bubble side="left">✅ QR verified. Delivery confirmed.</Bubble>
        <Bubble side="left">Earnings credited to your wallet.</Bubble>
      </div>
    </PhoneFrame>
  );
}

/* ─── Content map (functions, not JSX values) ───────────────────── */

const CONTENT = {
  Buyer: {
    eyebrow: "FOR BUYERS.",
    heading: "Shop safely in five simple steps.",
    steps: [
      "Tap on the link sent by the seller.",
      "Enter EscrowGo and checkout.",
      "Get your unique QR-Code.",
      "QR-Code gets scanned by the courier upon delivery.",
      "Payment is released to seller.",
    ],
    Phone: BuyerPhone,
  },
  Seller: {
    eyebrow: "FOR SELLERS.",
    heading: "Sell safely in five simple steps.",
    steps: [
      "Generate a payment gateway for the product.",
      "Generate and share your secure checkout link.",
      "Prepare the order for delivery.",
      "Courier delivers and scans the buyer's QR code.",
      "Payment is automatically released to your bank account.",
    ],
    Phone: SellerPhone,
  },
  Courier: {
    eyebrow: "FOR COURIERS.",
    heading: "Earn per verified drop-off in five steps.",
    steps: [
      "Accept a delivery job near you.",
      "Pick up the item from the seller.",
      "Deliver to the buyer's address.",
      "Scan the buyer's QR code on arrival.",
      "Earnings are credited to your wallet instantly.",
    ],
    Phone: CourierPhone,
  },
};

/* ─── Main export ───────────────────────────────────────────────── */

export default function RolesSection() {
  const [active, setActive] = useState("Buyer");
  const { eyebrow, heading, steps, Phone } = CONTENT[active];

  return (
    <section className=" bg-white px-5 pb-15">
      <div className="mx-auto max-w-5xl">
        {/* header */}
        <div className="text-center">
    

          {/* tab pills */}
          <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-ink/10 bg-gray-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  active === tab
                    ? "bg-yellow-400 text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* content — key forces re-mount on tab change = fade-in */}
        <div
          key={active}
          className="mt-12 grid items-center gap-12 animate-fade-in-up md:grid-cols-2 md:gap-16"
        >
          {/* steps */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink/40">
              {eyebrow}
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-snug text-yellow-500 md:text-3xl">
              {heading}
            </h3>
            <ul className="mt-8 flex flex-col gap-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                    <CheckIcon className="h-3 w-3 stroke-[3] text-yellow-600" />
                  </span>
                  <span className="text-sm leading-relaxed text-gray-600">
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* phone */}
          <div className="flex justify-center">
            <Phone />
          </div>
        </div>
      </div>
    </section>
  );
}

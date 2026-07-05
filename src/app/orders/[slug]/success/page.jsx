"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Link2,
  Copy,
  Check,
  Package,
  CalendarDays,
  Clock,
  ArrowRight,
  MessageCircle,
  Send,
  Mail,
  LayoutDashboard,
} from "lucide-react";

function formatNaira(value) {
  const n = Number(value || 0);
  return n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="reveal flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-white px-4 py-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p className="truncate text-[13px] font-semibold text-amber-600">
          {value}
        </p>
      </div>
    </div>
  );
}

function ShareButton({ href, icon: Icon, iconBg, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon className="h-3.5 w-3.5 text-white" />
      </span>
      {label}
    </a>
  );
}

function SuccessContent() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams({
    amount: String(data.amount),
    deliveryFee: String(data.deliveryFee ?? 0),
    expectedDelivery: computedExpectedDeliveryDate
      ? computedExpectedDeliveryDate.toISOString()
      : "",
    createdOn: new Date().toISOString(),
  });

  router.push(`/orders/${data.dealSlug}/success?${params.toString()}`);
  const escrowgoLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/pay/${slug}`
      : "";
  const amount = searchParams.get("amount") || 0;
  const deliveryFee = searchParams.get("deliveryFee") || 0;
  const expectedDelivery = searchParams.get("expectedDelivery") || "";
  const createdOn = searchParams.get("createdOn") || "";

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2200);
      const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
        `Here's your EscrowGo payment link: ${escrowgoLink}`,
      )}`;
      const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(
        escrowgoLink,
      )}&text=${encodeURIComponent("Here's your EscrowGo payment link")}`;
      const mailHref = `mailto:?subject=${encodeURIComponent(
        "Your EscrowGo payment link",
      )}&body=${encodeURIComponent(escrowgoLink)}`;
    } catch {
      // clipboard can fail silently on old/insecure browsers
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Here's your EscrowGo payment link: ${paymentLink}`,
  )}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(
    paymentLink,
  )}&text=${encodeURIComponent("Here's your EscrowGo payment link")}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(
    "Your EscrowGo payment link",
  )}&body=${encodeURIComponent(paymentLink)}`;

  return (
    <div className="min-h-screen bg-[#FBF1D9] px-4 py-12 sm:px-6">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal {
          opacity: 0;
          animation: fadeSlideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        .badge-pop {
          animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;
        }
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        .btn-shimmer { position: relative; overflow: hidden; }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-120%);
        }
        .btn-shimmer:hover::after { animation: shimmer 1.1s ease; }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .badge-pop { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div
          className="reveal mb-8 text-center"
          style={{ animationDelay: "0ms" }}
        >
          <div className="badge-pop mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/30">
            <Check className="h-7 w-7 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-900 sm:text-3xl">
            Payment link generated
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-amber-800/70">
            Your payment link is ready to share with the buyer
          </p>
        </div>

        {/* Main card */}
        <div
          className="reveal rounded-3xl border border-amber-200/60 bg-white/70 p-5 shadow-xl shadow-amber-900/5 backdrop-blur sm:p-7"
          style={{ animationDelay: "80ms" }}
        >
          <p className="mb-2 text-[13px] font-semibold text-slate-700">
            Your payment link
          </p>

          <div className="rounded-2xl border-2 border-dashed border-amber-300 p-4">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-600">
                <Link2 className="h-4 w-4 flex-shrink-0 text-slate-400" />
                <span className="truncate">{escrowgoLink || "—"}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`btn-shimmer flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 ${
                  copied ? "bg-emerald-600" : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy link
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <InfoChip icon={Package} label="Order ID" value={slug} />
              <InfoChip
                icon={CalendarDays}
                label="Created on"
                value={formatDate(createdOn)}
              />
              <InfoChip
                icon={Clock}
                label="Expected delivery"
                value={formatDate(expectedDelivery)}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm">
            <span className="text-slate-600">Total held in escrow</span>
            <span className="font-semibold text-slate-900">
              ₦{formatNaira(amount)}
              {Number(deliveryFee) > 0 && (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (incl. ₦{formatNaira(deliveryFee)} delivery)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Next steps */}
        <div
          className="reveal mt-6 rounded-3xl border border-amber-200/60 bg-white/70 p-5 shadow-lg shadow-amber-900/5 backdrop-blur sm:p-7"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-start gap-2.5">
            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                What's the next step?
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                Share the payment link with the buyer. Once payment is
                completed, we'll notify you by email and hold the funds securely
                until the order is completed.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Share your link
            </p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Send the link to the buyer via any platform
            </p>
            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
              <ShareButton
                href={whatsappHref}
                icon={MessageCircle}
                iconBg="bg-emerald-500"
                label="WhatsApp"
              />
              <ShareButton
                href={telegramHref}
                icon={Send}
                iconBg="bg-sky-500"
                label="Telegram"
              />
              <ShareButton
                href={mailHref}
                icon={Mail}
                iconBg="bg-amber-500"
                label="Mail"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="btn-shimmer reveal mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/35"
          style={{ animationDelay: "240ms" }}
        >
          Go to dashboard
          <LayoutDashboard className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF1D9]" />}>
      <SuccessContent />
    </Suspense>
  );
}

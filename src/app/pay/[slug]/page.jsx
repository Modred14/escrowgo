"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  Truck,
  CalendarDays,
  ArrowRightLeft,
  Package,
  Tag,
  Receipt,
  ExternalLink,
  Store,
  PackageX,
} from "lucide-react";

function formatNaira(value) {
  return Number(value || 0).toLocaleString("en-NG", {
    maximumFractionDigits: 0,
  });
}

function ordinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getDate();
  const month = d.toLocaleDateString("en-NG", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

function InfoRow({ icon: Icon, label, value, last }) {
  return (
    <div
      className={`flex items-start justify-between gap-3 px-5 py-3.5 sm:px-6 ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <span className="flex flex-shrink-0 items-center gap-2 text-[13px] text-slate-500">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </span>
      <span className="min-w-0 flex-1 break-words text-right text-[13px] font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

export default function PublicOrderPage() {
  const { slug } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/deals/${slug}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data?.error || "Order not found");
        } else {
          setDeal(data);
        }
      })
      .catch(() => !cancelled && setError("Something went wrong"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const sharedStyles = (
    <style>{`
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .reveal { opacity: 0; animation: fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
      @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } }
      .btn-shimmer { position: relative; overflow: hidden; }
      .btn-shimmer::after {
        content: ''; position: absolute; top: 0; left: 0; width: 40%; height: 100%;
        background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
        transform: translateX(-120%);
      }
      .btn-shimmer:hover::after { animation: shimmer 1.1s ease; }
      .perforation {
        background-image: repeating-linear-gradient(to right, #e2c98a 0, #e2c98a 6px, transparent 6px, transparent 13px);
        height: 1px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulseGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      .spinner-ring { animation: spin 0.9s linear infinite; }
      .pulse-glow { animation: pulseGlow 1.8s ease-in-out infinite; }
      @keyframes shakeIn {
        0% { opacity: 0; transform: scale(0.9); }
        60% { opacity: 1; transform: scale(1.03); }
        100% { opacity: 1; transform: scale(1); }
      }
      .shake-in { animation: shakeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      @media (prefers-reduced-motion: reduce) {
        .reveal, .pulse-glow, .shake-in, .spinner-ring { animation: none !important; opacity: 1 !important; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#FBF1D9] px-4">
        {sharedStyles}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="pulse-glow absolute h-16 w-16 rounded-full bg-amber-400/20 blur-xl" />
          <svg className="spinner-ring h-12 w-12" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#FDE4B0"
              strokeWidth="4"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#F5B43C"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="90 150"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-amber-900">
            Loading your order
          </p>
          <p className="pulse-glow mt-1 text-[13px] text-amber-700/60">
            Fetching the latest details…
          </p>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF1D9] px-4">
        {sharedStyles}
        <div className="shake-in flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 px-6 py-14 text-center shadow-lg shadow-slate-900/5 backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <PackageX className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-[15px] font-semibold text-slate-800">
            {error || "This order could not be found."}
          </p>
          <p className="text-[13px] text-slate-500">
            Double-check the link you were sent, or contact the seller.
          </p>
        </div>
      </div>
    );
  }

  const {
    product,
    payment,
    sellerName,
    deliveryFee,
    buyerLocation,
    sellerLocation,
    deliveryOption,
    expectedDeliveryDate,
  } = deal;
  const total = (product?.price || 0) + (deliveryFee || 0);
  const deliveryDate = formatDate(expectedDeliveryDate);
  const routeLabel = [sellerLocation, buyerLocation]
    .filter(Boolean)
    .join(" → ");
  const deliveryModeLabel =
    deliveryOption === "ESCROWGO" ? "EscrowGo courier" : "Self-arranged";
  return (
    <div className="min-h-screen bg-[#FBF1D9] px-4 py-10 sm:px-6">
      {sharedStyles}

      <div className="mx-auto max-w-md">
        <div
          className="reveal mb-5 text-center"
          style={{ animationDelay: "0ms" }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secured by EscrowGo
          </span>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-500">
            <Store className="h-4 w-4" />
            Sold by{" "}
            <span className="font-semibold text-slate-700">{sellerName}</span>
          </div>
        </div>

        <div
          className="reveal overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl shadow-slate-900/10"
          style={{ animationDelay: "80ms" }}
        >
          {/* Navy header */}
          <div
            className="px-6 py-5 text-center"
            style={{
              background:
                "radial-gradient(circle at 50% -20%, rgba(245,180,60,0.15), transparent 60%), linear-gradient(135deg, #1e1b4b 0%, #2d2a6e 100%)",
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300/80">
              EscrowGo checkout
            </p>
            <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
              Order summary and checkout
            </h1>
          </div>

          {/* Product images */}
          {product?.images?.length > 0 && (
            <div className="flex gap-2 p-3 sm:gap-3 sm:p-4">
              {product.images.slice(0, 3).map((img, i) => (
                <div
                  key={img}
                  className="aspect-square flex-1 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm"
                >
                  <img
                    src={img}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="perforation mx-6" />

          {/* Info rows */}
          <div className="py-1">
            <InfoRow
              icon={Package}
              label="Product name"
              value={product?.name}
            />
            <InfoRow
              icon={Tag}
              label="Price"
              value={`₦${formatNaira(product?.price)}`}
            />
            {deliveryFee > 0 && (
              <InfoRow
                icon={Truck}
                label="Delivery fee"
                value={`₦${formatNaira(deliveryFee)}`}
              />
            )}
            <InfoRow
              icon={Truck}
              label="Delivery mode"
              value={deliveryModeLabel}
            />
            {deliveryDate && (
              <InfoRow
                icon={CalendarDays}
                label="Expected delivery date"
                value={deliveryDate}
              />
            )}
            <InfoRow
              icon={ArrowRightLeft}
              label="Route"
              value={routeLabel}
              last
            />
          </div>

          {/* Total highlight */}
          <div className="px-6 pb-2 pt-3">
            <div className="flex items-center justify-between rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <Receipt className="h-4 w-4" />
                Total
              </span>
              <span className="text-lg font-bold text-amber-900">
                ₦{formatNaira(total)}
              </span>
            </div>
          </div>

          <div className="perforation mx-6 my-3" />

          {/* Payment method card */}
          <div className="mx-4 mb-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-4 text-center sm:mx-6">
            {" "}
            <p className="text-sm font-semibold text-slate-800">
              Payment method
            </p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Pay via <span className="font-medium text-amber-600">Nomba</span>{" "}
              — Africa's #1 payment platform
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-bold text-amber-300">
                N
              </span>
              <span className="text-[13px] font-semibold text-slate-700">
                Nomba secure checkout
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 pb-6 sm:px-6">
            {payment?.checkoutUrl && payment.status === "PENDING" ? (
              <a
                href={payment.checkoutUrl}
                className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Pay with Nomba
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <div className="rounded-xl bg-emerald-50 px-4 py-3.5 text-center text-sm font-medium text-emerald-700">
                {payment?.status === "SUCCESS"
                  ? "This order has already been paid for."
                  : "Payment is currently unavailable for this order."}
              </div>
            )}
          </div>
        </div>

        <p
          className="reveal mt-5 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-500"
          style={{ animationDelay: "160ms" }}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
          Your funds stay protected in escrow until delivery is confirmed.
        </p>
      </div>
    </div>
  );
}

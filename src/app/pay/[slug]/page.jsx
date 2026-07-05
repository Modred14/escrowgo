"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  Truck,
  Clock,
  ExternalLink,
  Store,
  PackageX,
  Loader2,
} from "lucide-react";

function formatNaira(value) {
  return Number(value || 0).toLocaleString("en-NG", {
    maximumFractionDigits: 0,
  });
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PublicOrderPage() {
  const { slug } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-50 px-4 text-center">
        <PackageX className="h-10 w-10 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">
          {error || "This order could not be found."}
        </p>
      </div>
    );
  }

  const { product, payment, sellerName, deliveryFee, expectedDeliveryDate } =
    deal;
  const total = (product?.price || 0) + (deliveryFee || 0);
  const deliveryDate = formatDate(expectedDeliveryDate);

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6">
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
        @media (prefers-reduced-motion: reduce) { .reveal { animation: none !important; opacity: 1 !important; } }
      `}</style>

      <div className="mx-auto max-w-2xl">
        <div
          className="reveal mb-6 text-center"
          style={{ animationDelay: "0ms" }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secured by EscrowGo
          </span>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-500">
            <Store className="h-4 w-4" />
            Sold by <span className="font-semibold text-slate-700">{sellerName}</span>
          </div>
        </div>

        <div
          className="reveal overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg"
          style={{ animationDelay: "80ms" }}
        >
          {product?.images?.length > 0 && (
            <div>
              <div className="aspect-square w-full bg-slate-100">
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {product.images.map((img, i) => (
                    <button
                      key={img}
                      onClick={() => setActiveImage(i)}
                      className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                        activeImage === i
                          ? "border-amber-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-5 sm:p-7">
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              {product?.name}
            </h1>
            {product?.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {product.description}
              </p>
            )}

            <div className="mt-5 space-y-2.5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> Route
                </span>
                <span className="text-right font-medium text-slate-700">
                  {deal.sellerLocation} → {deal.buyerLocation}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Truck className="h-3.5 w-3.5" /> Delivery
                </span>
                <span className="font-medium text-slate-700">
                  {deal.deliveryOption === "ESCROWGO"
                    ? "EscrowGo courier"
                    : "Self-arranged"}
                </span>
              </div>
              {deliveryDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> Expected delivery
                  </span>
                  <span className="font-medium text-slate-700">
                    {deliveryDate}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
              <div>
                <p className="text-[11px] text-slate-400">Product price</p>
                <p className="text-sm font-medium text-slate-700">
                  ₦{formatNaira(product?.price)}
                </p>
              </div>
              {deliveryFee > 0 && (
                <div>
                  <p className="text-[11px] text-slate-400">Delivery fee</p>
                  <p className="text-sm font-medium text-slate-700">
                    ₦{formatNaira(deliveryFee)}
                  </p>
                </div>
              )}
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Total</p>
                <p className="text-lg font-semibold text-slate-900">
                  ₦{formatNaira(total)}
                </p>
              </div>
            </div>

            {payment?.checkoutUrl && payment.status === "PENDING" ? (
              <a
                href={payment.checkoutUrl}
                className="btn-shimmer mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Pay with Nomba
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                {payment?.status === "SUCCESS"
                  ? "This order has already been paid for."
                  : "Payment is currently unavailable for this order."}
              </div>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              Your funds stay protected in escrow until delivery is confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
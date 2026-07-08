// src/app/deal/[slug]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  LayoutDashboard,
  ShieldCheck,
  MapPin,
  Truck,
  CalendarDays,
  Store,
  Package,
  Lock,
  ExternalLink,
  Sparkles,
  Search,
} from "lucide-react";
import StatusBadge from "@/components/Statusbadge";
import Timeline from "@/components/Timeline";
import { Spinner } from "@/components/Loader";
import { formatNaira, formatDate } from "@/lib/utils";

const sharedStyles = (
  <style>{`
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .reveal { opacity: 0; animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }

    @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } }
    .btn-shimmer { position: relative; overflow: hidden; }
    .btn-shimmer::after {
      content: ''; position: absolute; top: 0; left: 0; width: 40%; height: 100%;
      background: linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent);
      transform: translateX(-120%);
    }
    .btn-shimmer:hover::after { animation: shimmer 1.15s ease; }

    @keyframes softPulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
    .soft-pulse { animation: softPulse 2.2s ease-in-out infinite; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner-ring { animation: spin 0.9s linear infinite; }

    .thumb-active { box-shadow: 0 0 0 2px #FEC417; }

    @media (prefers-reduced-motion: reduce) {
      .reveal, .soft-pulse, .spinner-ring { animation: none !important; opacity: 1 !important; }
    }
  `}</style>
);

/**
 * Slim in-page utility bar replacing the global Navbar/Footer on this route.
 * Keeps a back action and a direct path to the dashboard without the full
 * site chrome, so the checkout/tracking experience stays focused.
 */
function TopBar({ router }) {
  return (
    <div className="reveal sticky top-0 z-20 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink/60 transition hover:bg-ink/5 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-1.5 font-display text-sm font-semibold tracking-tight text-vault">
          <img src="/logo.png" alt="Escrowgo" className="h-4 w-4 text-brass" />
          Escrowgo
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 rounded-full bg-vault px-4 py-1.5 text-sm font-semibold text-paper shadow-sm transition hover:-translate-y-0.5 hover:bg-vault-light hover:shadow-md"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </button>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-ink/10 bg-white/70 p-3.5">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-vault/8">
        <Icon className="h-4 w-4 text-vault" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-ink/40">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function DealPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [paying, setPaying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  async function load() {
    try {
      const res = await fetch(`/api/deals/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deal not found.");
      setDeal(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (deal?.qrCode?.code && !deal.qrCode.isUsed) {
      import("qrcode").then((QR) => {
        QR.toDataURL(deal.qrCode.code, {
          margin: 2,
          width: 260,
          color: { dark: "#0E1A17", light: "#F3F5F2" },
        }).then(setQrDataUrl);
      });
    }
  }, [deal?.qrCode?.code, deal?.qrCode?.isUsed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        {sharedStyles}
        <TopBar router={router} />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-ink/60">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="soft-pulse absolute h-14 w-14 rounded-full bg-brass/20 blur-lg" />
            <Spinner className="spinner-ring h-9 w-9 text-vault" />
          </div>
          <p className="soft-pulse text-sm font-medium">Loading deal…</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-paper">
        {sharedStyles}
        <TopBar router={router} />
        <main className="flex min-h-[70vh] items-center justify-center px-5 text-center">
          <div className="reveal flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-ink/10 bg-white/70 px-8 py-14 shadow-card backdrop-blur">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
              <Search className="h-6 w-6 text-ink/40" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink">
              Deal not found
            </h1>
            <p className="text-sm text-ink/55">
              This link may be invalid or the deal was removed.
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-1 flex items-center gap-2 rounded-xl bg-vault px-5 py-2.5 text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:bg-vault-light"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isSeller = session?.user?.id === deal.sellerId;
  const isBuyer = session?.user?.id === deal.buyerId;
  const totalAmount = deal.product.price + deal.deliveryFee;

  async function handlePay() {
    if (sessionStatus !== "authenticated") {
      router.push(`/auth/login?callbackUrl=/deal/${slug}`);
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: deal.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment.");
      router.push(data.checkoutUrl);
    } catch (err) {
      toast.error(err.message);
      setPaying(false);
    }
  }

  async function handleSelfDeliveryAction(action) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/deals/${slug}/self-deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      toast.success(
        action === "PICKED_UP"
          ? "Marked as picked up."
          : "Marked as delivered.",
      );
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper bg-grain">
      {sharedStyles}
      <TopBar router={router} />

      <main className="px-5 py-10">
        <div className="mx-auto max-w-5xl">
          <div
            className="reveal mb-7 flex flex-wrap items-center justify-between gap-3"
            style={{ animationDelay: "40ms" }}
          >
            <StatusBadge status={deal.status} />
            <span className="text-xs text-ink/40">
              Created {formatDate(deal.createdAt)}
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* ───────────────── Left column ───────────────── */}
            <div>
              <div
                className="reveal overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card"
                style={{ animationDelay: "80ms" }}
              >
                <div className="relative aspect-[4/3] bg-paper-dim">
                  {deal.product.images?.[activeImage] && (
                    <img
                      src={deal.product.images[activeImage]}
                      alt={deal.product.name}
                      className="h-full w-full object-cover transition-opacity duration-300"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/25 to-transparent" />
                </div>
                {deal.product.images?.length > 1 && (
                  <div className="flex gap-2 p-3">
                    {deal.product.images.map((img, i) => (
                      <button
                        key={img}
                        onClick={() => setActiveImage(i)}
                        className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                          i === activeImage
                            ? "thumb-active border-transparent"
                            : "border-transparent opacity-70 hover:opacity-100"
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

              <div
                className="reveal mt-7"
                style={{ animationDelay: "140ms" }}
              >
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
                  {deal.product.name}
                </h1>
                <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-ink/60">
                  {deal.product.description}
                </p>
              </div>

              <div
                className="reveal mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"
                style={{ animationDelay: "180ms" }}
              >
                <InfoTile icon={Store} label="Seller" value={deal.sellerName} />
                <InfoTile icon={MapPin} label="From" value={deal.sellerLocation} />
                <InfoTile icon={MapPin} label="To" value={deal.buyerLocation} />
                <InfoTile
                  icon={Truck}
                  label="Delivery"
                  value={deal.deliveryOption === "ESCROWGO" ? "escrowgo Delivery" : "Self Delivery"}
                />
              </div>

              {deal.expectedDeliveryDate && (
                <div
                  className="reveal mt-4 flex items-center gap-2.5 rounded-2xl border border-brass/25 bg-brass/5 p-4 text-sm text-ink/70"
                  style={{ animationDelay: "220ms" }}
                >
                  <CalendarDays className="h-4 w-4 flex-shrink-0 text-brass-dark" />
                  <span>
                    Expected delivery by{" "}
                    <span className="font-semibold text-ink">
                      {formatDate(deal.expectedDeliveryDate)}
                    </span>
                    {deal.deliveryOption === "ESCROWGO" &&
                      " — includes a 7-day buffer."}
                  </span>
                </div>
              )}

              <div
                className="reveal mt-10"
                style={{ animationDelay: "260ms" }}
              >
                <h2 className="font-display text-lg font-semibold text-ink">
                  Progress
                </h2>
                <div className="mt-5 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
                  <Timeline deal={deal} />
                </div>
              </div>

              <div
                className="reveal mt-8 overflow-hidden rounded-2xl border border-vault/15 bg-gradient-to-br from-vault/[0.04] to-brass/[0.04] p-6"
                style={{ animationDelay: "300ms" }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-vault">
                    <ShieldCheck className="h-5 w-5 text-brass" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      How escrow protects you
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                      Your payment is held by escrowgo, not handed to the
                      seller right away. It's only released after delivery is
                      confirmed by scanning a one-time QR code — and if
                      delivery never happens by the expected date, escrowgo
                      refunds you automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ───────────────── Sidebar ───────────────── */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div
                className="reveal overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card"
                style={{ animationDelay: "120ms" }}
              >
                <div className="border-b border-ink/10 px-6 pb-5 pt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                    Item price
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-ink">
                    {formatNaira(deal.product.price)}
                  </p>
                  {deal.deliveryOption === "ESCROWGO" && deal.deliveryFee > 0 && (
                    <p className="mt-1 text-xs text-ink/50">
                      + {formatNaira(deal.deliveryFee)} delivery fee
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-paper-dim/70 px-3.5 py-2.5">
                    <span className="text-sm font-semibold text-ink">Total</span>
                    <span className="font-mono font-semibold text-vault">
                      {formatNaira(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-5">
                  {deal.status === "PENDING_PAYMENT" && !isSeller && (
                    <button
                      onClick={handlePay}
                      disabled={paying}
                      className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl bg-vault py-3.5 text-sm font-semibold text-paper shadow-seal transition-all duration-300 hover:-translate-y-0.5 hover:bg-vault-light disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {paying ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-brass" />
                      )}
                      Pay Securely
                    </button>
                  )}

                  {deal.status === "PENDING_PAYMENT" && isSeller && (
                    <p className="soft-pulse rounded-xl bg-paper-dim p-3.5 text-center text-xs font-medium text-ink/50">
                      Waiting for the buyer to complete payment.
                    </p>
                  )}

                  {deal.status !== "PENDING_PAYMENT" && (
                    <p className="flex items-center justify-center gap-1.5 rounded-xl bg-mint/10 p-3.5 text-center text-xs font-semibold text-mint-dark">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Payment secured — see progress above.
                    </p>
                  )}

                  {isSeller &&
                    deal.deliveryOption === "SELF" &&
                    deal.delivery && (
                      <div className="mt-5 space-y-2.5 border-t border-ink/10 pt-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                          Self-delivery controls
                        </p>
                        {deal.delivery.status === "UNASSIGNED" &&
                          deal.status === "FUNDS_HELD" && (
                            <button
                              onClick={() => handleSelfDeliveryAction("PICKED_UP")}
                              disabled={actionLoading}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-vault py-2.5 text-sm font-semibold text-vault transition hover:bg-vault/5 disabled:opacity-60"
                            >
                              {actionLoading && <Spinner className="h-3.5 w-3.5" />}
                              Mark as picked up
                            </button>
                          )}
                        {deal.delivery.status === "PICKED_UP" && (
                          <button
                            onClick={() => handleSelfDeliveryAction("DELIVERED")}
                            disabled={actionLoading}
                            className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl bg-brass py-2.5 text-sm font-semibold text-ink transition hover:bg-brass-light disabled:opacity-60"
                          >
                            {actionLoading && <Spinner className="h-3.5 w-3.5" />}
                            Mark as delivered
                          </button>
                        )}
                        {deal.delivery.status === "DELIVERED" && (
                          <p className="text-center text-xs leading-relaxed text-ink/50">
                            Delivered. Ask the buyer to show their QR code,
                            then scan it from your{" "}
                            <a
                              href="/dashboard"
                              className="font-semibold text-vault hover:underline"
                            >
                              Dashboard
                            </a>{" "}
                            using the "Scan Delivery QR Code" card.
                          </p>
                        )}
                      </div>
                    )}

                  {isBuyer && deal.qrCode?.code && !deal.qrCode.isUsed && (
                    <div className="mt-5 border-t border-ink/10 pt-5 text-center">
                      <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/40">
                        <Sparkles className="h-3.5 w-3.5 text-brass" />
                        Your release code
                      </p>
                      <p className="mt-1 text-xs text-ink/50">
                        Show this to the seller or courier to release payment.
                      </p>
                      {qrDataUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrDataUrl}
                          alt="Release QR code"
                          className="mx-auto mt-3.5 h-44 w-44 rounded-2xl border border-ink/10 shadow-card"
                        />
                      )}
                      <p className="mt-2.5 break-all font-mono text-[10px] text-ink/30">
                        {deal.qrCode.code}
                      </p>
                    </div>
                  )}

                  {isBuyer && deal.qrCode?.isUsed && (
                    <p className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-mint/10 p-3.5 text-center text-xs font-semibold text-mint-dark">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      QR scanned — payment released to the seller.
                    </p>
                  )}
                </div>
              </div>

              <p
                className="reveal mt-5 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink/40"
                style={{ animationDelay: "200ms" }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Payments processed securely via Nomba
              </p>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
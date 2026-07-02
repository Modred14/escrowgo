"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/Statusbadge";
import Timeline from "@/components/Timeline";
import { PageLoader, Spinner } from "@/components/Loader";
import { formatNaira, formatDate } from "@/lib/utils";

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
      setDeal(data.deal);
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
      <>
        <Navbar />
        <PageLoader label="Loading deal…" />
        <Footer />
      </>
    );
  }

  if (!deal) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[60vh] items-center justify-center px-5 text-center">
          <div>
            <p className="text-5xl">🔍</p>
            <h1 className="mt-3 font-display text-xl font-semibold text-ink">
              Deal not found
            </h1>
            <p className="mt-1 text-sm text-ink/55">
              This link may be invalid or the deal was removed.
            </p>
          </div>
        </main>
        <Footer />
      </>
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
    <>
      <Navbar />
      <main className="bg-paper px-5 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <StatusBadge status={deal.status} />
            <span className="text-xs text-ink/40">
              Created {formatDate(deal.createdAt)}
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <div className="aspect-[4/3] bg-paper-dim">
                  {deal.product.images?.[activeImage] && (
                    <img
                      src={deal.product.images[activeImage]}
                      alt={deal.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                {deal.product.images?.length > 1 && (
                  <div className="flex gap-2 p-3">
                    {deal.product.images.map((img, i) => (
                      <button
                        key={img}
                        onClick={() => setActiveImage(i)}
                        className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${i === activeImage ? "border-brass" : "border-transparent"}`}
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

              <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
                {deal.product.name}
              </h1>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/60">
                {deal.product.description}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-ink/10 bg-white p-5 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-ink/40">Seller</p>
                  <p className="mt-0.5 font-semibold text-ink">
                    {deal.seller.name}
                  </p>
                </div>
                <div>
                  <p className="text-ink/40">From</p>
                  <p className="mt-0.5 font-semibold text-ink">
                    {deal.sellerLocation}
                  </p>
                </div>
                <div>
                  <p className="text-ink/40">To</p>
                  <p className="mt-0.5 font-semibold text-ink">
                    {deal.buyerLocation}
                  </p>
                </div>
                <div>
                  <p className="text-ink/40">Delivery</p>
                  <p className="mt-0.5 font-semibold text-ink">
                    {deal.deliveryOption === "ESCROWGO"
                      ? "escrowgo Delivery"
                      : "Self Delivery"}
                  </p>
                </div>
              </div>

              {deal.expectedDeliveryDate && (
                <div className="mt-4 rounded-2xl border border-brass/20 bg-brass/5 p-4 text-sm text-ink/70">
                  Expected delivery by{" "}
                  <span className="font-semibold text-ink">
                    {formatDate(deal.expectedDeliveryDate)}
                  </span>
                  {deal.deliveryOption === "ESCROWGO" &&
                    " — includes a 7-day buffer."}
                </div>
              )}

              <div className="mt-10">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Progress
                </h2>
                <div className="mt-4">
                  <Timeline deal={deal} />
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-5">
                <h3 className="font-display text-base font-semibold text-ink">
                  How escrow protects you
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  Your payment is held by escrowgo, not handed to the seller
                  right away. It's only released after delivery is confirmed by
                  scanning a one-time QR code — and if delivery never happens by
                  the expected date, escrowgo refunds you automatically.
                </p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
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
                <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="font-mono font-semibold text-vault">
                    {formatNaira(totalAmount)}
                  </span>
                </div>

                {deal.status === "PENDING_PAYMENT" && !isSeller && (
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-vault py-3 text-sm font-semibold text-paper transition hover:bg-vault-light disabled:opacity-60"
                  >
                    {paying && <Spinner className="h-4 w-4" />}
                    Pay Securely
                  </button>
                )}

                {deal.status === "PENDING_PAYMENT" && isSeller && (
                  <p className="mt-5 rounded-xl bg-paper-dim p-3 text-center text-xs text-ink/50">
                    Waiting for the buyer to complete payment.
                  </p>
                )}

                {deal.status !== "PENDING_PAYMENT" && (
                  <p className="mt-5 rounded-xl bg-mint/10 p-3 text-center text-xs font-semibold text-mint-dark">
                    Payment secured — see progress above.
                  </p>
                )}

                {isSeller &&
                  deal.deliveryOption === "SELF" &&
                  deal.delivery && (
                    <div className="mt-5 space-y-2 border-t border-ink/10 pt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                        Self-delivery controls
                      </p>
                      {deal.delivery.status === "UNASSIGNED" &&
                        deal.status === "FUNDS_HELD" && (
                          <button
                            onClick={() =>
                              handleSelfDeliveryAction("PICKED_UP")
                            }
                            disabled={actionLoading}
                            className="w-full rounded-xl border border-vault py-2.5 text-sm font-semibold text-vault hover:bg-vault/5 disabled:opacity-60"
                          >
                            Mark as picked up
                          </button>
                        )}
                      {deal.delivery.status === "PICKED_UP" && (
                        <button
                          onClick={() => handleSelfDeliveryAction("DELIVERED")}
                          disabled={actionLoading}
                          className="w-full rounded-xl bg-brass py-2.5 text-sm font-semibold text-ink hover:bg-brass-light disabled:opacity-60"
                        >
                          Mark as delivered
                        </button>
                      )}
                      {deal.delivery.status === "DELIVERED" && (
                        <p className="text-center text-xs text-ink/50">
                          Delivered. Ask the buyer to show their QR code, then
                          scan it on the{" "}
                          <a
                            href="/scanner"
                            className="font-semibold text-vault hover:underline"
                          >
                            Scanner
                          </a>{" "}
                          page.
                        </p>
                      )}
                    </div>
                  )}

                {isBuyer && deal.qrCode?.code && !deal.qrCode.isUsed && (
                  <div className="mt-5 border-t border-ink/10 pt-5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
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
                        className="mx-auto mt-3 h-44 w-44 rounded-xl border border-ink/10"
                      />
                    )}
                    <p className="mt-2 break-all font-mono text-[10px] text-ink/30">
                      {deal.qrCode.code}
                    </p>
                  </div>
                )}

                {isBuyer && deal.qrCode?.isUsed && (
                  <p className="mt-5 rounded-xl bg-mint/10 p-3 text-center text-xs font-semibold text-mint-dark">
                    QR scanned — payment released to the seller.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

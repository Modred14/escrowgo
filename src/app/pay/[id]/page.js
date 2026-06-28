"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SealMark from "@/components/SealMark";
import { Spinner, PageLoader } from "@/components/Loaders";
import { formatNaira } from "@/lib/utils";

export default function PayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/payments/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment not found.");
      setPayment(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  // Poll while a real (non-mock) Nomba payment is awaiting the webhook.
  useEffect(() => {
    if (!payment || payment.mockMode) return;
    if (payment.payment.status !== "PENDING") return;

    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [payment]);

  async function confirmMockPayment() {
    setConfirming(true);
    try {
      const res = await fetch("/api/payments/mock-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed.");
      toast.success("Payment confirmed. Funds secured in escrow.");
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return <PageLoader label="Loading checkout…" />;
  if (!payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5">
        <p className="text-paper/60">We couldn't find this payment.</p>
      </main>
    );
  }

  const { payment: p, mockMode } = payment;
  const deal = p.deal;
  const isSuccess = p.status === "SUCCESS";
  const isFailed = p.status === "FAILED";

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-paper/10 bg-vault-deep p-7 text-paper shadow-seal">
        <div className="flex items-center gap-2.5">
          <SealMark size={30} />
          <span className="font-display text-base font-semibold">escrowgo checkout</span>
        </div>
        {mockMode && (
          <span className="mt-3 inline-flex rounded-full bg-brass/15 px-2.5 py-1 text-[11px] font-semibold text-brass-light">
            Nomba TEST mode — simulated checkout
          </span>
        )}

        <div className="mt-6 space-y-2 border-y border-paper/10 py-5 text-sm">
          <div className="flex justify-between text-paper/60">
            <span>Item</span>
            <span className="text-paper">{deal.product.name}</span>
          </div>
          <div className="flex justify-between text-paper/60">
            <span>Seller</span>
            <span className="text-paper">{deal.seller.name}</span>
          </div>
          <div className="flex justify-between text-paper/60">
            <span>Reference</span>
            <span className="font-mono text-xs text-paper/70">{p.providerRef}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="font-mono">{formatNaira(p.amount)}</span>
          </div>
        </div>

        {isSuccess ? (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint/20 text-2xl">✅</div>
            <p className="mt-3 text-sm font-semibold">Payment secured in escrow</p>
            <button
              onClick={() => router.push(`/deal/${deal.slug}`)}
              className="mt-5 w-full rounded-xl bg-brass py-2.5 text-sm font-semibold text-ink hover:bg-brass-light"
            >
              View deal
            </button>
          </div>
        ) : isFailed ? (
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-seal-light">Payment failed</p>
            <button
              onClick={() => router.push(`/deal/${deal.slug}`)}
              className="mt-5 w-full rounded-xl border border-paper/20 py-2.5 text-sm font-semibold hover:border-brass"
            >
              Back to deal
            </button>
          </div>
        ) : mockMode ? (
          <button
            onClick={confirmMockPayment}
            disabled={confirming}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brass py-3 text-sm font-semibold text-ink transition hover:bg-brass-light disabled:opacity-60"
          >
            {confirming && <Spinner className="h-4 w-4" />}
            Confirm Test Payment
          </button>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <Spinner className="h-6 w-6 text-brass" />
            <p className="text-sm text-paper/60">Waiting for Nomba to confirm your payment…</p>
          </div>
        )}
      </div>
    </main>
  );
}

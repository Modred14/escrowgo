"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import { Spinner } from "@/components/Loader";
import {
  checkDeliveryCoverage,
  COVERED_LOCATIONS,
} from "@/lib/delivery-coverage";
import { formatNaira } from "@/lib/utils";

const initialForm = {
  name: "",
  description: "",
  price: "",
  images: [],
  sellerLocation: "",
  buyerLocation: "",
  estimatedDeliveryDays: 3,
  deliveryOption: "ESCROWGO",
};

export default function CreateDealPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const coverage = useMemo(() => {
    if (
      form.deliveryOption !== "ESCROWGO" ||
      !form.sellerLocation ||
      !form.buyerLocation
    )
      return null;
    return checkDeliveryCoverage({
      sellerLocation: form.sellerLocation,
      buyerLocation: form.buyerLocation,
      estimatedDeliveryDays: Number(form.estimatedDeliveryDays) || 0,
    });
  }, [
    form.deliveryOption,
    form.sellerLocation,
    form.buyerLocation,
    form.estimatedDeliveryDays,
  ]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the deal.");

      if (data.forcedSelfDelivery) {
        toast(
          "escrowgo Delivery isn't available for that route — switched to Self Delivery.",
          { icon: "📦" },
        );
      }
      setResult(data);
      toast.success("Secure deal created.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center bg-paper px-5 py-16">
          <div className="w-full max-w-md rounded-2xl border border-mint/30 bg-white p-8 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint/15 text-2xl">
              ✅
            </div>
            <h1 className="mt-4 font-display text-xl font-semibold text-ink">
              Deal created
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              Share this link with your buyer to get paid securely.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-ink/10 bg-paper px-3.5 py-2.5">
              <code className="flex-1 truncate text-left text-xs text-ink/70">
                {result.paymentLink}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.paymentLink);
                  toast.success("Link copied.");
                }}
                className="shrink-0 rounded-lg bg-vault px-3 py-1.5 text-xs font-semibold text-paper hover:bg-vault-light"
              >
                Copy
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push(`/deal/${result.deal.slug}`)}
                className="flex-1 rounded-xl border border-ink/15 py-2.5 text-sm font-semibold text-ink hover:bg-paper-dim"
              >
                View deal
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 rounded-xl bg-vault py-2.5 text-sm font-semibold text-paper hover:bg-vault-light"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-paper px-5 py-10">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Create Secure Deal
            </h1>
            <p className="mt-1 text-sm text-ink/55">
              Fill in the details once — escrowgo handles trust from here.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-card"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/70">
                  Product name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="iPhone 13 Pro Max, 256GB"
                  className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/70">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Condition, accessories included, anything the buyer should know."
                  className="w-full resize-none rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink/70">
                    Price (NGN)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="450000"
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink/70">
                    Estimated delivery (days)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="30"
                    value={form.estimatedDeliveryDays}
                    onChange={(e) =>
                      update("estimatedDeliveryDays", e.target.value)
                    }
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/70">
                  Product photos
                </label>
                <ImageUploader
                  images={form.images}
                  onChange={(imgs) => update("images", imgs)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink/70">
                    Your location (seller)
                  </label>
                  <input
                    required
                    list="locations"
                    value={form.sellerLocation}
                    onChange={(e) => update("sellerLocation", e.target.value)}
                    placeholder="Lagos"
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink/70">
                    Buyer's location
                  </label>
                  <input
                    required
                    list="locations"
                    value={form.buyerLocation}
                    onChange={(e) => update("buyerLocation", e.target.value)}
                    placeholder="Abuja"
                    className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
                  />
                </div>
                <datalist id="locations">
                  {COVERED_LOCATIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink/70">
                  Delivery option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "ESCROWGO",
                      label: "escrowgo Delivery",
                      desc: "We coordinate pickup & drop-off",
                    },
                    {
                      value: "SELF",
                      label: "Self Delivery",
                      desc: "You handle delivery yourself",
                    },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => update("deliveryOption", opt.value)}
                      className={`rounded-xl border-2 p-3.5 text-left transition ${
                        form.deliveryOption === opt.value
                          ? "border-vault bg-vault/5"
                          : "border-ink/10"
                      }`}
                    >
                      <p className="text-sm font-semibold text-ink">
                        {opt.label}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/50">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-vault py-3 text-sm font-semibold text-paper transition hover:bg-vault-light disabled:opacity-60"
              >
                {loading && <Spinner className="h-4 w-4" />}
                Generate payment link
              </button>
            </form>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                Delivery preview
              </p>

              {form.deliveryOption === "SELF" ? (
                <p className="mt-3 text-sm text-ink/60">
                  You'll coordinate delivery yourself and mark progress from the
                  deal page.
                </p>
              ) : !form.sellerLocation || !form.buyerLocation ? (
                <p className="mt-3 text-sm text-ink/40">
                  Enter both locations to check escrowgo Delivery coverage.
                </p>
              ) : coverage?.available ? (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-semibold text-mint-dark">
                    ✓ Covered route
                  </p>
                  <p className="text-ink/60">
                    Delivery fee:{" "}
                    <span className="font-mono font-semibold text-ink">
                      {formatNaira(coverage.fee)}
                    </span>
                  </p>
                  <p className="text-ink/60">
                    Buffer added:{" "}
                    <span className="font-semibold text-ink">
                      {coverage.bufferDays} days
                    </span>
                  </p>
                  <p className="text-ink/60">
                    Total estimate:{" "}
                    <span className="font-semibold text-ink">
                      {coverage.totalEstimatedDays} days
                    </span>
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-semibold text-seal">✕ Not covered</p>
                  <p className="text-ink/60">{coverage?.reason}</p>
                  <p className="text-ink/50">
                    escrowgo Delivery will be disabled — this deal will fall
                    back to Self Delivery automatically.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-brass/20 bg-brass/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brass-dark">
                How escrow works
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink/55">
                The buyer's payment is locked until they confirm delivery with a
                QR scan. You only get paid once that's verified.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

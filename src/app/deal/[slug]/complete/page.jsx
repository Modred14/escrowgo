"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ShieldCheck,
  Info,
  ArrowRight,
  Download,
  LayoutDashboard,
  PackageX,
  Package,
} from "lucide-react";

function formatNaira(value) {
  return Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function OrderCompletePage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderReference = searchParams.get("orderId");

  const [state, setState] = useState({ loading: true, error: "", data: null });
  const [qrDataUrl, setQrDataUrl] = useState("");

 useEffect(() => {
    if (!slug || !orderReference) return;
    let cancelled = false;
    let pollTimer = null;

    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/deals/${slug}/complete?orderReference=${encodeURIComponent(orderReference)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to check payment status");
        if (cancelled) return;

        if (data.status === "FAILED") {
          setState({ loading: false, error: "", data: { failed: true } });
          return;
        }

        if (!data.verified) {
        
          setState({ loading: true, error: "", data: { pending: true, status: data.status } });
          pollTimer = setTimeout(checkStatus, 3000);
          return;
        }

        setState({ loading: false, error: "", data });
        const url = await QRCode.toDataURL(data.qrValue, {
          width: 400,
          margin: 1,
          color: { dark: "#1e1b1b", light: "#ffffff" },
        });
        if (!cancelled) setQrDataUrl(url);
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err.message, data: null });
      }
    }

    checkStatus();
    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [slug, orderReference]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `escrowgo-qr-${slug}.png`;
    a.click();
  };

  const sharedStyles = (
    <style>{`
      @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      .reveal { opacity: 0; animation: fadeSlideUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards; }
      @keyframes shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } }
      .btn-shimmer { position: relative; overflow: hidden; }
      .btn-shimmer::after {
        content: ''; position: absolute; top: 0; left: 0; width: 40%; height: 100%;
        background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
        transform: translateX(-120%);
      }
      .btn-shimmer:hover::after { animation: shimmer 1.1s ease; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulseGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      .spinner-ring { animation: spin 0.9s linear infinite; }
      .pulse-glow { animation: pulseGlow 1.8s ease-in-out infinite; }
      @keyframes qrPop { from { opacity: 0; transform: scale(0.9) rotate(-2deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
      .qr-pop { animation: qrPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
      @keyframes shakeIn { 0% { opacity: 0; transform: scale(0.9); } 60% { opacity: 1; transform: scale(1.03); } 100% { opacity: 1; transform: scale(1); } }
      .shake-in { animation: shakeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      @media (prefers-reduced-motion: reduce) {
        .reveal, .pulse-glow, .spinner-ring, .qr-pop, .shake-in { animation: none !important; opacity: 1 !important; }
      }
    `}</style>
  );

  if (state.loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#FBF1D9] px-4">
        {sharedStyles}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="pulse-glow absolute h-16 w-16 rounded-full bg-amber-400/20 blur-xl" />
          <svg className="spinner-ring h-12 w-12" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#FDE4B0" strokeWidth="4" />
            <circle cx="25" cy="25" r="20" fill="none" stroke="#F5B43C" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 150" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-amber-900">Verifying your payment</p>
          <p className="pulse-glow mt-1 text-[13px] text-amber-700/60">This will only take a moment…</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF1D9] px-4">
        {sharedStyles}
        <div className="shake-in flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 px-6 py-14 text-center shadow-lg shadow-slate-900/5 backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <PackageX className="h-7 w-7 text-red-400" />
          </div>
          <p className="text-[15px] font-semibold text-slate-800">{state.error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (state.data?.failed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF1D9] px-4">
        {sharedStyles}
        <div className="shake-in flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-red-200 bg-white/80 px-6 py-14 text-center shadow-lg shadow-red-900/5 backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <PackageX className="h-7 w-7 text-red-400" />
          </div>
          <p className="text-[15px] font-semibold text-slate-800">Payment failed</p>
          <p className="text-[13px] text-slate-500">
            Your payment could not be completed. No funds were held in escrow.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/deals/${slug}`)}
            className="mt-1 rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Try payment again
          </button>
        </div>
      </div>
    );
  }

  if (state.data?.pending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF1D9] px-4">
        {sharedStyles}
        <div className="shake-in flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-amber-200 bg-white/80 px-6 py-14 text-center shadow-lg shadow-amber-900/5 backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <Info className="h-7 w-7 text-amber-500" />
          </div>
          <p className="text-[15px] font-semibold text-slate-800">Payment not yet confirmed</p>
          <p className="text-[13px] text-slate-500">
            Status: <span className="font-medium text-slate-700">{state.data.status}</span>. This
            page will update once Nomba confirms your payment.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 rounded-xl bg-amber-500 px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-600"
          >
            Check again
          </button>
        </div>
      </div>
    );
  }

  const { product, amount } = state.data;

  return (
    <div className="min-h-screen bg-[#FBF1D9] px-4 py-12 sm:px-6">
      {sharedStyles}
      <div className="mx-auto max-w-lg">
        <div className="reveal mb-6 text-center" style={{ animationDelay: "0ms" }}>
          <h1 className="text-2xl font-bold tracking-tight text-amber-900 sm:text-3xl">
            <span className="underline decoration-amber-400 decoration-4 underline-offset-4">QR</span>{" "}
            Code Generation
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-amber-800/70">
            QR code has been generated and should be kept secure and scanned by only the seller
          </p>
        </div>

        <div
          className="reveal rounded-3xl border border-amber-200/60 bg-white p-5 shadow-xl shadow-amber-900/5 sm:p-7"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600">
              <Info className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-emerald-900">IMPORTANT</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-emerald-800/80">
                QR-Code must be kept safe and scanned by only the seller
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <p className="mb-3 text-sm font-semibold text-slate-700">Your QR Code</p>
            <div className="qr-pop rounded-2xl border-2 border-dashed border-amber-300 bg-white p-4 shadow-sm">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Order verification QR code" className="h-52 w-52 sm:h-60 sm:w-60" />
              ) : (
                <div className="flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
                  <svg className="spinner-ring h-8 w-8" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="#eee" strokeWidth="4" />
                    <circle cx="25" cy="25" r="20" fill="none" stroke="#F5B43C" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 150" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 flex items-start gap-2.5">
            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">What's the next step?</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                Download or screenshot your QR-Code and keep it safe and secure,{" "}
                <span className="font-semibold text-amber-600">EscrowGo</span> won't ask for the
                QR-Code
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Package className="h-4 w-4 text-slate-500" /> Order summary
            </p>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex min-w-0 items-center gap-3">
                {product?.image ? (
                  <img src={product.image} alt={product.name} className="h-11 w-11 flex-shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-11 w-11 flex-shrink-0 rounded-lg bg-slate-100" />
                )}
                <span className="truncate text-sm font-medium text-slate-700">{product?.name}</span>
              </div>
              <span className="flex-shrink-0 text-sm font-semibold text-slate-900">
                ₦{formatNaira(amount)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-[13px] font-semibold text-amber-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
          >
            <Download className="h-4 w-4" />
            Download QR-Code
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="btn-shimmer mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/35"
          >
            Go to dashboard
            <LayoutDashboard className="h-4 w-4" />
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            Payments are secured and protected by{" "}
            <span className="font-semibold text-amber-500">Nomba</span>
          </p>
        </div>
      </div>
    </div>
  );
}
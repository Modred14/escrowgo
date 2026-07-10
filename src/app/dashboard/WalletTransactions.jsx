// src/app/dashboard/WalletTransactions.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  CreditCard,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Truck,
  PackageCheck,
  Ban,
  X,
} from "lucide-react";
import { useCountUp, formatNaira, C } from "./hooks";
import WithdrawModal from "./WithdrawModal";

const STATUS_STYLES = {
  "Awaiting Payment": { bg: "#F1F0EC", fg: C.textMuted, icon: Clock3 },
  "In Escrow": { bg: "#FBF0DE", fg: C.goldDeep, icon: ShieldCheck },
  "Out For Delivery": { bg: "#FBF0DE", fg: C.goldDeep, icon: Truck },
  "Awaiting Pickup Confirmation": {
    bg: "#FBF0DE",
    fg: C.goldDeep,
    icon: PackageCheck,
  },
  Completed: { bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  Cancelled: { bg: C.redSoft, fg: C.red, icon: Ban },
  Refunded: { bg: C.redSoft, fg: C.red, icon: XCircle },
  "In Dispute": { bg: "#FBF0DE", fg: C.goldDeep, icon: AlertTriangle },
};

function useWalletData() {
  const [data, setData] = useState({
    moneyIn: 0,
    totalWithdrawn: 0,
    totalTransactions: 0,
    sales: [],
    totalSpent: 0,
    totalPurchases: 0,
    purchases: [],
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet/transactions");
      if (!res.ok) throw new Error("Failed to load wallet data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, reload: load };
}
function MiniStat({
  icon: Icon,
  label,
  value,
  prefix = "",
  tint,
  delay,
  mounted,
}) {
  const count = useCountUp(value, { start: mounted, duration: 1300 });
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-white p-5 opacity-0 animate-riseIn transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: C.line,
        animationDelay: `${delay}ms`,
        boxShadow: "0 1px 2px rgba(22,19,13,0.04)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow =
          "0 16px 32px -18px rgba(198,156,63,0.35)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 2px rgba(22,19,13,0.04)")
      }
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: tint.bg, color: tint.fg }}
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <p
        className="mt-4 text-[13px] font-medium"
        style={{ color: C.textMuted }}
      >
        {label}
      </p>
      <p
        className="mt-1 font-serif text-[24px] font-semibold tracking-tight"
        style={{ color: tint.fg }}
      >
        {prefix}
        {Number(count).toLocaleString("en-NG")}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || {
    bg: "#F1F0EC",
    fg: C.textMuted,
    icon: Clock3,
  };
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-transform duration-200"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      <Icon size={11} /> {status}
    </span>
  );
}

// Small tappable QR preview. Renders a 56x56 thumbnail from the deal's
// release code; taps invoke onOpen so the parent can show the full-size
// modal. Deals without an active (unused) QR code fall back to a plain
// status icon and aren't clickable.
function QrThumb({ code, onOpen }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (code) {
      import("qrcode").then((QR) => {
        QR.toDataURL(code, {
          margin: 1,
          width: 112,
          color: { dark: "#0E1A17", light: "#F3F5F2" },
        }).then((url) => {
          if (!cancelled) setDataUrl(url);
        });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!code) {
    return (
      <div
        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border"
        style={{ borderColor: C.line, backgroundColor: "#F3F5F2" }}
      >
        <Receipt size={18} style={{ color: C.textMuted }} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-transform duration-200 hover:scale-105 active:scale-95"
      style={{ borderColor: C.line }}
      aria-label="View full QR code"
    >
      {dataUrl ? (
        <img src={dataUrl} alt="QR code preview" className="h-full w-full" />
      ) : (
        <div className="skeleton h-full w-full" />
      )}
    </button>
  );
}

// Full-size QR modal shown when a purchase's preview is tapped.
function QrCodeModal({ purchase, onClose }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    if (purchase?.qrCode?.code) {
      import("qrcode").then((QR) => {
        QR.toDataURL(purchase.qrCode.code, {
          margin: 2,
          width: 260,
          color: { dark: "#0E1A17", light: "#F3F5F2" },
        }).then((url) => {
          if (!cancelled) setDataUrl(url);
        });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [purchase?.qrCode?.code]);

  if (!purchase) return null;

  // Rendered via portal (see below) so this fixed-position overlay attaches
  // to <body> instead of a card ancestor. Several parent cards use
  // `animate-riseIn`, whose `forwards` fill-mode leaves a lingering
  // `transform: translateY(0)` on the element after the entrance animation
  // finishes. Any transform on an ancestor turns `position: fixed` into a
  // containing-block-relative position instead of viewport-relative, so
  // without the portal this modal was getting clipped by that ancestor's
  // `overflow-hidden` and rendering squashed/inline instead of full-size.
  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-[13px] font-semibold uppercase tracking-wide"
            style={{ color: C.textMuted }}
          >
            Release QR code
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p
          className="mt-1 truncate text-[13px] font-semibold"
          style={{ color: C.ink }}
        >
          {purchase.product}
        </p>
        <p className="text-[12px]" style={{ color: C.textMuted }}>
          Sold by {purchase.seller}
        </p>

        <div className="mt-4 flex justify-center">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Full release QR code"
              className="h-56 w-56 rounded-xl border"
              style={{ borderColor: C.line }}
            />
          ) : (
            <div className="skeleton h-56 w-56 rounded-xl" />
          )}
        </div>

        <p className="mt-3 break-all font-mono text-[10px] text-slate-400">
          {purchase.qrCode?.code}
        </p>
        <p className="mt-2 text-[12px]" style={{ color: C.textMuted }}>
          Show this to the seller or courier to release payment.
        </p>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
// Buyer-side list of QR release codes. Small preview per row; tapping opens
// the full QR in a modal. Purely presentational — the underlying data
// (status, qrCode.isUsed) is refetched from /api/wallet/transactions on
// every load, so this always reflects the buyer's live transaction state.
function PurchasesList({ purchases, loading }) {
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl border bg-white opacity-0 animate-riseIn"
      style={{ borderColor: C.line, animationDelay: "420ms" }}
    >
      <div
        className="flex items-center justify-between border-b p-5"
        style={{ borderColor: C.line }}
      >
        <p
          className="font-serif text-[17px] font-semibold"
          style={{ color: C.ink }}
        >
          Your purchases
        </p>
        <p className="text-[12px]" style={{ color: C.textMuted }}>
          Tap a QR to view it full-size
        </p>
      </div>

      <div className="flex flex-col divide-y" style={{ borderColor: C.line }}>
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="skeleton h-14 w-14 flex-shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="skeleton h-3.5 w-32 rounded-md" />
                <div className="skeleton mt-2 h-3 w-20 rounded-md" />
              </div>
            </div>
          ))}

        {!loading &&
          purchases.map((p, i) => {
            const activeCode =
              p.qrCode && !p.qrCode.isUsed ? p.qrCode.code : null;
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 p-4 opacity-0 animate-riseIn"
                style={{ animationDelay: `${460 + i * 60}ms` }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <QrThumb code={activeCode} onOpen={() => setSelected(p)} />
                  <div className="min-w-0">
                    <p
                      className="truncate text-[13.5px] font-medium"
                      style={{ color: C.ink }}
                    >
                      {p.product}
                    </p>
                    <p
                      className="mt-0.5 truncate text-[12px]"
                      style={{ color: C.textMuted }}
                    >
                      Sold by {p.seller} · {formatNaira(p.amount)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            );
          })}

        {!loading && purchases.length === 0 && (
          <div
            className="px-5 py-8 text-center text-[13px]"
            style={{ color: C.textMuted }}
          >
            You haven't bought anything yet.
          </div>
        )}
      </div>

      <QrCodeModal purchase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default function WalletTransactions() {
  const {
    moneyIn,
    totalWithdrawn,
    totalTransactions,
    sales,
    purchases,
    loading,
    reload,
  } = useWalletData();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const balance = moneyIn - totalWithdrawn;
  const balanceCount = useCountUp(balance, {
    start: mounted && !loading,
    duration: 1600,
    decimals: 2,
  });
  const filteredSales = sales.filter(
    (s) =>
      s.merchant.toLowerCase().includes(query.toLowerCase()) ||
      s.product.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="max-w-full overflow-x-hidden">
      {/* Header */}
      <div
        className="flex items-start justify-between opacity-0 animate-riseIn"
        style={{ animationDelay: "60ms" }}
      >
        <div>
          <h1
            className="font-serif text-[30px] font-semibold tracking-tight"
            style={{ color: C.ink }}
          >
            Wallet & Transactions
          </h1>
          <p className="mt-1.5 text-[14px]" style={{ color: C.textMuted }}>
            Manage your escrow balance and review every sale in one place.
          </p>
        </div>
      </div>

      {/* Hero balance card */}
      <div
        className="shimmer-sweep relative mt-7 overflow-hidden rounded-2xl p-5 opacity-0 animate-riseIn sm:p-7"
        style={{
          animationDelay: "140ms",
          background: `linear-gradient(120deg, #FCEFC7 0%, #F3DA9C 45%, #E8C873 100%)`,
          border: "1px solid rgba(139,107,33,0.18)",
        }}
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(22,19,13,0.1)" }}
              >
                <Sparkles size={12} style={{ color: C.goldDeep }} />
              </div>
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: C.goldDeep }}
              >
                EscrowGo Wallet Balance
              </span>
            </div>
            <p
              className="mt-3 text-[13px]"
              style={{ color: "rgba(22,19,13,0.55)" }}
            >
              Available balance
            </p>
            {loading ? (
              <div className="skeleton mt-2 h-9 w-40 rounded-md sm:h-11" />
            ) : (
              <p
                className="mt-1 font-serif text-[30px] font-semibold tracking-tight sm:text-[38px]"
                style={{ color: C.ink }}
              >
                {formatNaira(balanceCount)}
              </p>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 hover:brightness-95 active:scale-[0.98] sm:w-auto"
                style={{ backgroundColor: C.ink, color: C.goldSoft }}
              >
                <ArrowUpFromLine size={14} /> Withdraw money
              </button>
            </div>
          </div>

          {/* Decorative wallet illustration */}
          <div className="relative hidden h-[140px] w-[160px] shrink-0 sm:block">
            <div
              className="absolute right-4 top-2 h-[90px] w-[130px] rotate-[8deg] rounded-xl transition-transform duration-500 hover:rotate-[3deg]"
              style={{
                backgroundColor: C.ink,
                boxShadow: "0 20px 40px -16px rgba(22,19,13,0.4)",
              }}
            />
            <div
              className="absolute right-10 top-6 h-[90px] w-[130px] -rotate-[6deg] rounded-xl transition-transform duration-500 hover:-rotate-[2deg]"
              style={{
                background: `linear-gradient(135deg, ${C.inkSoft}, ${C.ink})`,
                boxShadow: "0 16px 30px -14px rgba(22,19,13,0.35)",
              }}
            />
            <div
              className="absolute bottom-1 right-6 flex h-[74px] w-[120px] items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
                boxShadow: "0 14px 26px -10px rgba(198,156,63,0.55)",
              }}
            >
              <Wallet size={30} style={{ color: C.ink }} strokeWidth={1.8} />
            </div>
            <div
              className="pulse-seal absolute -top-1 right-0 flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                backgroundColor: C.cream,
                boxShadow: "0 6px 14px -4px rgba(22,19,13,0.3)",
              }}
            >
              <CreditCard size={15} style={{ color: C.goldDeep }} />
            </div>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-white p-5"
              style={{ borderColor: C.line }}
            >
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton mt-4 h-3 w-24 rounded-md" />
              <div className="skeleton mt-2 h-6 w-20 rounded-md" />
            </div>
          ))
        ) : (
          <>
            <MiniStat
              icon={ArrowDownToLine}
              label="Money in"
              value={moneyIn}
              prefix="₦"
              tint={{ bg: C.greenSoft, fg: C.green }}
              mounted={mounted}
              delay={200}
            />
            <MiniStat
              icon={ArrowUpFromLine}
              label="Total withdrawn"
              value={totalWithdrawn}
              prefix="₦"
              tint={{ bg: C.redSoft, fg: C.red }}
              mounted={mounted}
              delay={250}
            />
            <MiniStat
              icon={Receipt}
              label="Total transactions"
              value={totalTransactions}
              tint={{ bg: "#FBF0DE", fg: C.goldDeep }}
              mounted={mounted}
              delay={300}
            />{" "}
          </>
        )}
      </div>

      {/* Sales history */}
      <div
        className="mt-6 overflow-hidden rounded-2xl border bg-white opacity-0 animate-riseIn"
        style={{ borderColor: C.line, animationDelay: "360ms" }}
      >
        <div
          className="flex min-w-0 flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: C.line }}
        >
          <p
            className="font-serif text-[17px] font-semibold"
            style={{ color: C.ink }}
          >
            Sales history
          </p>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: C.textMuted }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search product"
                className="w-full rounded-lg border py-2 pl-8 pr-3 text-[12.5px] outline-none transition-all duration-300 sm:w-[200px] sm:focus:w-[240px]"
                style={{ borderColor: C.line, color: C.ink }}
              />
            </div>
            <button
              className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold transition-all duration-300 hover:gap-1.5"
              style={{ color: C.goldDeep }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Mobile: stacked cards, no horizontal scroll */}
        <div
          className="flex flex-col divide-y md:hidden"
          style={{ borderColor: C.line }}
        >
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="skeleton h-3.5 w-32 rounded-md" />
                  <div className="skeleton mt-2 h-3 w-20 rounded-md" />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <div className="skeleton h-3.5 w-16 rounded-md" />
                  <div className="skeleton h-5 w-20 rounded-full" />
                </div>
              </div>
            ))}
          {!loading &&
            filteredSales.map((row, i) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-3 p-4 opacity-0 animate-riseIn transition-colors duration-200"
                style={{
                  borderColor: C.line,
                  animationDelay: `${420 + i * 60}ms`,
                }}
              >
                <div className="min-w-0">
                  <p
                    className="truncate text-[13.5px] font-medium"
                    style={{ color: C.ink }}
                  >
                    {row.product}
                  </p>
                  <p
                    className="mt-0.5 truncate text-[12px]"
                    style={{ color: C.textMuted }}
                  >
                    {row.courier && row.courier !== "Self delivery" && (
                      <> · courier: {row.courier}</>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: C.ink }}
                  >
                    {formatNaira(row.amount)}
                  </span>
                  <StatusBadge status={row.status} />
                </div>
              </div>
            ))}
          {!loading && filteredSales.length === 0 && (
            <div
              className="px-5 py-8 text-center text-[13px]"
              style={{ color: C.textMuted }}
            >
              No transactions match
              {query && ` "${query}"`}.
            </div>
          )}
        </div>

        {/* Tablet & up: full table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                {["Product", "Courier", "Total amount", "Delivery status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="w-1/4 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: C.goldDeep }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-t"
                    style={{ borderColor: C.line }}
                  >
                    <td className="w-1/4 px-5 py-3.5">
                      <div className="skeleton h-3.5 w-28 rounded-md" />
                    </td>
                    <td className="w-1/4 px-5 py-3.5">
                      <div className="skeleton h-3.5 w-24 rounded-md" />
                    </td>
                    <td className="w-1/4 px-5 py-3.5">
                      <div className="skeleton h-3.5 w-20 rounded-md" />
                    </td>
                    <td className="w-1/4 px-5 py-3.5">
                      <div className="skeleton h-5 w-20 rounded-full" />
                    </td>
                  </tr>
                ))}
              {!loading &&
                filteredSales.map((row, i) => (
                  <tr
                    key={row.id}
                    className="opacity-0 animate-riseIn border-t transition-colors duration-200 hover:bg-[#FBF7EF]"
                    style={{
                      borderColor: C.line,
                      animationDelay: `${420 + i * 60}ms`,
                    }}
                  >
                    <td
                      className="w-1/4 truncate px-5 py-3.5 text-[13.5px]"
                      style={{ color: C.inkFaint }}
                    >
                      {row.product}
                    </td>
                    <td
                      className="w-1/4 truncate px-5 py-3.5 text-[13.5px]"
                      style={{ color: C.inkFaint }}
                    >
                      {row.courier}
                    </td>
                    <td
                      className="w-1/4 truncate px-5 py-3.5 text-[13.5px]"
                      style={{ color: C.textMuted }}
                    >
                      {formatNaira(row.amount)}
                    </td>
                    <td className="w-1/4 px-5 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              {!loading && filteredSales.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-[13px]"
                    style={{ color: C.textMuted }}
                  >
                    No transactions match
                    {query && ` "${query}"`}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buyer-side: purchases with release QR codes */}
      <PurchasesList purchases={purchases} loading={loading} />

      <WithdrawModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={balance}
        onSuccess={reload}
      />
    </div>
  );
}
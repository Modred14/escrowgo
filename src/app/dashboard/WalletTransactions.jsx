"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useCountUp, formatNaira, C } from "./hooks";

const STATUS_STYLES = {
  Delivered: { bg: C.greenSoft, fg: C.green, icon: CheckCircle2 },
  Undelivered: { bg: C.redSoft, fg: C.red, icon: XCircle },
  "In Dispute": { bg: "#FBF0DE", fg: C.goldDeep, icon: AlertTriangle },
};

function useWalletData() {
  const [data] = useState({
    moneyIn: 2000000,
    totalWithdrawn: 1500000,
    totalTransactions: 100,
    sales: [
      {
        id: "TX-5510",
        buyer: "John Micheal",
        product: "Samsung S21 Ultra",
        amount: 250000,
        status: "Delivered",
      },
      {
        id: "TX-5509",
        buyer: "Kunle Ogundiran",
        product: "Hoodie",
        amount: 50000,
        status: "Undelivered",
      },
      {
        id: "TX-5508",
        buyer: "Joshua Kimmich",
        product: "Samsung S23 Ultra",
        amount: 450000,
        status: "Delivered",
      },
      {
        id: "TX-5507",
        buyer: "Kelvin Henry",
        product: "iPhone 14 Pro",
        amount: 750000,
        status: "Undelivered",
      },
      {
        id: "TX-5506",
        buyer: "Faiq Modred",
        product: "iPhone 14 Pro",
        amount: 750000,
        status: "In Dispute",
      },
    ],
  });
  return data;
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
  const s = STATUS_STYLES[status];
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

export default function WalletTransactions() {
  const { moneyIn, totalWithdrawn, totalTransactions, sales } = useWalletData();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const balance = 2000000;
  const balanceCount = useCountUp(balance, { start: mounted, duration: 1600 });

  const filteredSales = sales.filter(
    (s) =>
      s.buyer.toLowerCase().includes(query.toLowerCase()) ||
      s.product.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
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
        className="shimmer-sweep relative mt-7 overflow-hidden rounded-2xl p-7 opacity-0 animate-riseIn"
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
            <p
              className="mt-1 font-serif text-[38px] font-semibold tracking-tight"
              style={{ color: C.ink }}
            >
              {formatNaira(balanceCount)}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 hover:brightness-95 active:scale-[0.98]"
                style={{ backgroundColor: C.ink, color: C.goldSoft }}
              >
                <ArrowUpFromLine size={14} /> Withdraw money
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 hover:bg-white/40 active:scale-[0.98]"
                style={{ borderColor: "rgba(22,19,13,0.2)", color: C.ink }}
              >
                <ArrowDownToLine size={14} /> Fund wallet
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
        />
      </div>

      {/* Sales history */}
      <div
        className="mt-6 overflow-hidden rounded-2xl border bg-white opacity-0 animate-riseIn"
        style={{ borderColor: C.line, animationDelay: "360ms" }}
      >
        <div
          className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: C.line }}
        >
          <p
            className="font-serif text-[17px] font-semibold"
            style={{ color: C.ink }}
          >
            Sales history
          </p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: C.textMuted }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search buyer or product"
                className="w-[200px] rounded-lg border py-2 pl-8 pr-3 text-[12.5px] outline-none transition-all duration-300 focus:w-[240px]"
                style={{ borderColor: C.line, color: C.ink }}
              />
            </div>
            <button
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold transition-all duration-300 hover:gap-1.5"
              style={{ color: C.goldDeep }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                {[
                  "Buyer name",
                  "Product",
                  "Total amount",
                  "Delivery status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: C.goldDeep }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((row, i) => (
                <tr
                  key={row.id}
                  className="opacity-0 animate-riseIn border-t transition-colors duration-200 hover:bg-[#FBF7EF]"
                  style={{
                    borderColor: C.line,
                    animationDelay: `${420 + i * 60}ms`,
                  }}
                >
                  <td
                    className="px-5 py-3.5 text-[13.5px] font-medium"
                    style={{ color: C.ink }}
                  >
                    {row.buyer}
                  </td>
                  <td
                    className="px-5 py-3.5 text-[13.5px]"
                    style={{ color: C.inkFaint }}
                  >
                    {row.product}
                  </td>
                  <td
                    className="px-5 py-3.5 text-[13.5px]"
                    style={{ color: C.textMuted }}
                  >
                    {formatNaira(row.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-[13px]"
                    style={{ color: C.textMuted }}
                  >
                    No transactions match "{query}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

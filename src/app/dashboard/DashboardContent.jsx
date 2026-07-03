"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag, CheckCircle2, Clock3, Wallet, TrendingUp, Plus, Bell,
} from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import {useCountUp, formatNaira, C } from "./hooks";
import { useSession } from "next-auth/react";

/* Real dashboard data — swap for API data */
function useDashboardData() {
  const [data] = useState({
    totalOrders: 100,
    completedOrders: 92,
    pendingOrders: 8,
    totalSales: 2000000,
    ordersTrend: 6.1,
    salesTrend: 12.4,
    recentOrders: [
      { id: "ORD-2298", item: "iPhone 15 Pro Max", buyer: "T. Balogun", amount: 850000, status: "Completed" },
      { id: "ORD-2297", item: "MacBook Air M3", buyer: "C. Okoye", amount: 1120000, status: "Completed" },
      { id: "ORD-2296", item: "PlayStation 5", buyer: "A. Suleiman", amount: 420000, status: "Pending" },
      { id: "ORD-2295", item: "Canon EOS R6", buyer: "F. Danjuma", amount: 980000, status: "Completed" },
    ],
  });
  return data;
}

function StatCard({ icon: Icon, label, value, prefix = "", trend, tint, delay, mounted, decimals }) {
  const count = useCountUp(value, { start: mounted, decimals, duration: 1500 });
  const display = decimals > 0 ? count : Number(count).toLocaleString("en-NG");

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-white p-5 opacity-0 animate-riseIn transition-all duration-300 hover:-translate-y-1"
      style={{ borderColor: C.line, animationDelay: `${delay}ms`, boxShadow: "0 1px 2px rgba(22,19,13,0.04)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 32px -18px rgba(198,156,63,0.35)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 2px rgba(22,19,13,0.04)")}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: tint.bg, color: tint.fg }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: C.greenSoft, color: C.green }}>
            <TrendingUp size={11} /> {trend}%
          </span>
        )}
      </div>
      <p className="mt-4 text-[13px] font-medium" style={{ color: C.textMuted }}>{label}</p>
      <p className="mt-1 font-serif text-[26px] font-semibold tracking-tight" style={{ color: C.ink }}>
        {prefix}{display}
      </p>
    </div>
  );
}

export default function DashboardContent({ onNavigate }) {
  const { data: session, status } = useSession();
  const data = useDashboardData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const completionPct = Math.round((data.completedOrders / data.totalOrders) * 100);
  const radialData = [{ name: "completed", value: completionPct, fill: C.gold }];

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "";
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
    : "";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between opacity-0 animate-riseIn" style={{ animationDelay: "80ms" }}>
        <div>
          {status === "loading" ? (
            <>
              <div className="skeleton h-8 w-64 rounded-lg" />
              <div className="skeleton mt-3 h-4 w-52 rounded-md" />
            </>
          ) : (
            <>
              <h1 className="font-serif text-[30px] font-semibold tracking-tight" style={{ color: C.ink }}>
                Welcome back{firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-1.5 text-[14px]" style={{ color: C.textMuted }}>
                Track your orders and enjoy secure, escrow-protected shopping.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition-all duration-300 hover:-translate-y-0.5"
            style={{ borderColor: C.line }}
          >
            <Bell size={16} style={{ color: C.inkFaint }} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.gold }} />
          </button>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full font-serif text-[14px] font-semibold ring-2 ring-offset-2"
            style={{
              background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
              color: C.ink,
              ["--tw-ring-color"]: "rgba(198,156,63,0.4)",
              ["--tw-ring-offset-color"]: C.cream,
            }}
          >
            {initials || "··"}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={data.totalOrders} trend={data.ordersTrend} tint={{ bg: "#EAF0FF", fg: "#3457D5" }} mounted={mounted} delay={140} />
        <StatCard icon={CheckCircle2} label="Completed Orders" value={data.completedOrders} tint={{ bg: C.greenSoft, fg: C.green }} mounted={mounted} delay={190} />
        <StatCard icon={Clock3} label="Pending Orders" value={data.pendingOrders} tint={{ bg: "#FBF0DE", fg: C.goldDeep }} mounted={mounted} delay={240} />
        <StatCard icon={Wallet} label="Total Sales" value={data.totalSales} prefix="₦" trend={data.salesTrend} tint={{ bg: C.greenSoft, fg: C.green }} mounted={mounted} delay={290} />
      </div>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Create order panel */}
        <button
          className="group relative flex min-h-[300px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed opacity-0 animate-riseIn transition-all duration-300 hover:border-solid xl:col-span-2"
          style={{ borderColor: "rgba(198,156,63,0.4)", backgroundColor: "#FBF4E2", animationDelay: "360ms" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7EBCB")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FBF4E2")}
        >
          <div className="cta-plus flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300" style={{ backgroundColor: C.ink }}>
            <Plus size={24} style={{ color: C.gold }} strokeWidth={2.4} />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: C.ink }}>Create Order</p>
            <p className="mt-1 text-[13px]" style={{ color: C.textMuted }}>
              <span className="font-semibold" style={{ color: C.goldDeep }}>Click here</span>{" "}to start a new escrow-protected order
            </p>
          </div>
        </button>

        {/* Completion radial + recent orders */}
        <div className="flex flex-col gap-5 rounded-2xl border bg-white p-5 opacity-0 animate-riseIn" style={{ borderColor: C.line, animationDelay: "410ms" }}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold" style={{ color: C.ink }}>Order Completion</p>
            <span className="text-[11px]" style={{ color: C.textMuted }}>This month</span>
          </div>

          <div className="relative mx-auto h-[150px] w-[150px]">
            <RadialBarChart
              width={150} height={150} cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" barSize={10}
              data={mounted ? radialData : [{ ...radialData[0], value: 0 }]}
              startAngle={90} endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: "#F1EBDA" }} dataKey="value" cornerRadius={20} fill={C.gold} isAnimationActive animationDuration={1500} animationEasing="ease-out" />
            </RadialBarChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-[24px] font-semibold" style={{ color: C.ink }}>{completionPct}%</span>
              <span className="text-[10px]" style={{ color: C.textMuted }}>completed</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t pt-3" style={{ borderColor: C.line }}>
            {data.recentOrders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-[12px]">
                <div className="flex flex-col">
                  <span className="font-medium" style={{ color: C.ink }}>{o.item}</span>
                  <span style={{ color: C.textMuted }}>{o.buyer}</span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: o.status === "Completed" ? C.greenSoft : "#FBF0DE",
                    color: o.status === "Completed" ? C.green : C.goldDeep,
                  }}
                >
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
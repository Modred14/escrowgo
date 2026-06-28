"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { PageLoader } from "@/components/Loaders";
import { formatNaira, formatDate } from "@/lib/utils";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [deals, setDeals] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    fetch("/api/admin/deals").then((r) => r.json()).then((d) => setDeals(d.deals || []));
  }, []);

  if (!stats || !deals) {
    return (
      <>
        <Navbar />
        <PageLoader label="Loading admin overview…" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-paper px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-2xl font-semibold text-ink">Admin overview</h1>
          <p className="mt-1 text-sm text-ink/55">Platform-wide visibility across every escrow.</p>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total deals" value={stats.totalDeals} />
            <StatCard label="Total users" value={stats.totalUsers} />
            <StatCard label="Couriers" value={stats.totalAgents} />
            <StatCard label="Held in escrow" value={formatNaira(stats.fundsHeld)} accent="brass" />
            <StatCard label="Released" value={formatNaira(stats.fundsReleased)} accent="mint" />
            <StatCard label="Refunded" value={formatNaira(stats.fundsRefunded)} accent="seal" />
          </div>

          <div className="mt-9 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-paper-dim text-xs uppercase text-ink/40">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Seller</th>
                  <th className="px-4 py-3 text-left">Buyer</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-t border-ink/5">
                    <td className="px-4 py-3 font-medium text-ink">{d.product?.name}</td>
                    <td className="px-4 py-3 text-ink/55">{d.seller?.name}</td>
                    <td className="px-4 py-3 text-ink/55">{d.buyer?.name || "—"}</td>
                    <td className="px-4 py-3 font-mono text-ink/70">{formatNaira(d.product?.price)}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-ink/45">{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

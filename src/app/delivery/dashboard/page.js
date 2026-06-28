"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { CardSkeleton, Spinner } from "@/components/Loaders";
import { formatNaira, formatDate } from "@/lib/utils";

const TABS = ["available", "assigned", "earnings"];

export default function DeliveryDashboard() {
  const [tab, setTab] = useState("available");
  const [available, setAvailable] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadAvailable = useCallback(async () => {
    const res = await fetch("/api/delivery/available");
    const data = await res.json();
    setAvailable(data.deliveries || []);
  }, []);

  const loadEarnings = useCallback(async () => {
    const res = await fetch("/api/delivery/earnings");
    const data = await res.json();
    setEarningsData(data);
  }, []);

  useEffect(() => {
    loadAvailable();
    loadEarnings();
    const interval = setInterval(() => {
      loadAvailable();
      loadEarnings();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadAvailable, loadEarnings]);

  async function handleAccept(deliveryId) {
    setBusyId(deliveryId);
    try {
      const res = await fetch(`/api/delivery/${deliveryId}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Delivery accepted.");
      loadAvailable();
      loadEarnings();
      setTab("assigned");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleAction(deliveryId, action) {
    setBusyId(deliveryId);
    try {
      const res = await fetch(`/api/delivery/${deliveryId}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(action === "pickup" ? "Marked as picked up." : "Marked as delivered.");
      loadEarnings();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const assignedDeliveries = (earningsData?.deliveries || []).filter((d) => d.status === "ACCEPTED" || d.status === "PICKED_UP");
  const completedDeliveries = (earningsData?.deliveries || []).filter((d) => d.status === "DELIVERED");

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-paper px-5 py-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-2xl font-semibold text-ink">Delivery dashboard</h1>
          <p className="mt-1 text-sm text-ink/55">Accept jobs, track progress, and watch your earnings grow.</p>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <StatCard label="Total earnings" value={formatNaira(earningsData?.stats?.totalEarnings || 0)} accent="brass" />
            <StatCard label="Active jobs" value={earningsData?.stats?.activeCount ?? "—"} accent="vault" />
            <StatCard label="Completed" value={earningsData?.stats?.completedCount ?? "—"} accent="mint" />
          </div>

          <div className="mt-8 flex gap-1 rounded-full bg-ink/5 p-1 text-sm font-semibold w-fit">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-5 py-2 capitalize transition ${tab === t ? "bg-white text-ink shadow-sm" : "text-ink/50"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === "available" && (
              available === null ? (
                <div className="grid gap-4 md:grid-cols-2">{[1, 2].map((i) => <CardSkeleton key={i} />)}</div>
              ) : available.length === 0 ? (
                <EmptyState icon="📦" title="No deliveries available right now" description="Check back soon — new escrowgo Delivery jobs near you will show up here." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {available.map((d) => (
                    <div key={d.id} className="rounded-2xl border border-ink/10 bg-white p-5">
                      <p className="font-display text-base font-semibold text-ink">{d.deal.product.name}</p>
                      <p className="mt-1 text-xs text-ink/50">{d.pickupLocation} → {d.dropoffLocation}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-brass-dark">{formatNaira(d.fee)} fee</span>
                        <button
                          onClick={() => handleAccept(d.id)}
                          disabled={busyId === d.id}
                          className="flex items-center gap-1.5 rounded-full bg-vault px-4 py-1.5 text-xs font-semibold text-paper hover:bg-vault-light disabled:opacity-60"
                        >
                          {busyId === d.id && <Spinner className="h-3.5 w-3.5" />}
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === "assigned" && (
              assignedDeliveries.length === 0 ? (
                <EmptyState icon="🚚" title="No assigned deliveries" description="Accept a job from the Available tab to see it here." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {assignedDeliveries.map((d) => (
                    <div key={d.id} className="rounded-2xl border border-ink/10 bg-white p-5">
                      <div className="flex items-start justify-between">
                        <p className="font-display text-base font-semibold text-ink">{d.deal.product.name}</p>
                        <StatusBadge status={d.deal.status} />
                      </div>
                      <p className="mt-1 text-xs text-ink/50">{d.pickupLocation} → {d.dropoffLocation}</p>
                      <div className="mt-4">
                        {d.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleAction(d.id, "pickup")}
                            disabled={busyId === d.id}
                            className="w-full rounded-xl border border-vault py-2 text-sm font-semibold text-vault hover:bg-vault/5 disabled:opacity-60"
                          >
                            Mark picked up
                          </button>
                        )}
                        {d.status === "PICKED_UP" && (
                          <button
                            onClick={() => handleAction(d.id, "deliver")}
                            disabled={busyId === d.id}
                            className="w-full rounded-xl bg-brass py-2 text-sm font-semibold text-ink hover:bg-brass-light disabled:opacity-60"
                          >
                            Mark delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === "earnings" && (
              completedDeliveries.length === 0 ? (
                <EmptyState icon="💰" title="No completed deliveries yet" description="Earnings from completed deliveries will show up here." />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-paper-dim text-xs uppercase text-ink/40">
                      <tr>
                        <th className="px-4 py-3 text-left">Item</th>
                        <th className="px-4 py-3 text-left">Route</th>
                        <th className="px-4 py-3 text-left">Delivered</th>
                        <th className="px-4 py-3 text-right">Fee earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedDeliveries.map((d) => (
                        <tr key={d.id} className="border-t border-ink/5">
                          <td className="px-4 py-3 font-medium text-ink">{d.deal.product.name}</td>
                          <td className="px-4 py-3 text-ink/55">{d.pickupLocation} → {d.dropoffLocation}</td>
                          <td className="px-4 py-3 text-ink/55">{formatDate(d.deliveredAt)}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-mint-dark">{formatNaira(d.fee)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

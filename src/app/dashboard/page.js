"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DealCard from "@/components/DealCard";
import EmptyState from "@/components/EmptyState";
import StatCard from "@/components/StatCard";
import { CardSkeleton } from "@/components/Loaders";
import { formatNaira } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState("selling");
  const [deals, setDeals] = useState(null);

  useEffect(() => {
    let active = true;
    setDeals(null);
    fetch(`/api/deals?as=${tab === "selling" ? "seller" : "buyer"}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setDeals(data.deals || []);
      });
    return () => {
      active = false;
    };
  }, [tab]);

  const escrowHeld = (deals || [])
    .filter((d) => d.status === "FUNDS_HELD" || d.status === "OUT_FOR_DELIVERY" || d.status === "DELIVERED")
    .reduce((sum, d) => sum + (d.escrow?.amount || 0), 0);

  const released = (deals || [])
    .filter((d) => d.status === "PAYMENT_RELEASED")
    .reduce((sum, d) => sum + (d.escrow?.amount || 0), 0);

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-paper px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">
                Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-1 text-sm text-ink/55">Track every deal from payment to release.</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Total deals" value={deals ? deals.length : "—"} />
            <StatCard label="In escrow" value={formatNaira(escrowHeld)} hint="Held" accent="brass" />
            <StatCard label="Released" value={formatNaira(released)} hint="Completed" accent="mint" />
            <StatCard label="Role" value={session?.user?.role === "ADMIN" ? "Admin" : "Buyer / Seller"} />
          </div>

          <div className="mt-9 flex gap-1 rounded-full bg-ink/5 p-1 text-sm font-semibold w-fit">
            {["selling", "buying"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-5 py-2 capitalize transition ${
                  tab === t ? "bg-white text-ink shadow-sm" : "text-ink/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {deals === null ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </div>
            ) : deals.length === 0 ? (
              <EmptyState
                icon="🔏"
                title={tab === "selling" ? "You haven't listed anything yet" : "No purchases yet"}
                description={
                  tab === "selling"
                    ? "Create a secure deal to generate a payment link you can send to any buyer."
                    : "Once a seller sends you a deal link, it'll show up here after you pay."
                }
                actionLabel={tab === "selling" ? "Create Secure Deal" : "Browse how it works"}
                actionHref={tab === "selling" ? "/create-deal" : "/"}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} viewerRole={tab === "selling" ? "seller" : "buyer"} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

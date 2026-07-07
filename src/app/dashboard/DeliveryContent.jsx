// src/app/dashboard/DeliveryContent.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Truck,
  PackageCheck,
  ClipboardList,
  ShoppingBag,
  RefreshCw,
  CalendarCheck2,
  CalendarClock,
  Inbox,
  Tv,
  Package,
  Clock3,
  Check,
  X,
} from "lucide-react";
import { useCountUp, formatNaira, C } from "./hooks";
import { useSession } from "next-auth/react";

function BreakdownRow({ icon: Icon, label, value, color, delay }) {
  return (
    <div
      className="flex items-center justify-between opacity-0 animate-riseIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} strokeWidth={2.2} style={{ color }} />
        <span className="text-[12.5px] font-medium" style={{ color: C.ink }}>
          {label}
        </span>
      </div>
      <span className="text-[13px] font-bold tabular-nums" style={{ color }}>
        {value.toLocaleString("en-NG")}
      </span>
    </div>
  );
}

function DeliveryStatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  mounted,
  delay,
  rows,
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
          "0 16px 32px -18px rgba(22,19,13,0.18)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 2px rgba(22,19,13,0.04)")
      }
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon size={19} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p
            className="truncate text-[12.5px] font-semibold"
            style={{ color: C.textMuted }}
          >
            {label}
          </p>
          <p
            className="text-[24px] font-bold leading-tight tracking-tight tabular-nums"
            style={{ color: valueColor }}
          >
            {Math.round(count).toLocaleString("en-NG")}
          </p>
        </div>
      </div>

      {rows && rows.length > 0 && (
        <div
          className="mt-4 space-y-2.5 border-t pt-3.5"
          style={{ borderColor: C.line }}
        >
          {rows.map((row, i) => (
            <BreakdownRow key={row.label} {...row} delay={delay + 100 + i * 60} />
          ))}
        </div>
      )}
    </div>
  );
}

function SimpleStatCard({ icon: Icon, iconBg, iconColor, label, value, valueColor, prefix, mounted, delay }) {
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
          "0 16px 32px -18px rgba(31,157,85,0.28)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 2px rgba(22,19,13,0.04)")
      }
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon size={19} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p
            className="truncate text-[12.5px] font-semibold"
            style={{ color: C.textMuted }}
          >
            {label}
          </p>
          <p
            className="text-[24px] font-bold leading-tight tracking-tight tabular-nums"
            style={{ color: valueColor }}
          >
            {prefix}
            {Math.round(count).toLocaleString("en-NG")}
          </p>
        </div>
      </div>
    </div>
  );
}

function PickupCard({ pickup, onAccept, onDecline, delay }) {
  const Icon = pickup.icon || Package;
  return (
    <div
      className="rounded-2xl border bg-white p-5 opacity-0 animate-riseIn transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
      style={{
        borderColor: C.line,
        animationDelay: `${delay}ms`,
        boxShadow: "0 1px 2px rgba(22,19,13,0.04)",
      }}
    >
      {/* Top: icon, title, order meta */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: C.gold }}
          >
            <Icon size={20} style={{ color: "#fff" }} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[14.5px] font-bold" style={{ color: C.ink }}>
              {pickup.title}
            </p>
            <p className="text-[12.5px]" style={{ color: C.textMuted }}>
              {pickup.deliveryType}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[12px]" style={{ color: C.textMuted }}>
            Order ID :{" "}
            <span className="font-bold" style={{ color: C.ink }}>
              #{pickup.orderId}
            </span>
          </p>
          <p
            className="mt-1 flex items-center justify-end gap-1 text-[11.5px]"
            style={{ color: C.textMuted }}
          >
            <Clock3 size={11} /> {pickup.timeAgo}
          </p>
        </div>
      </div>

      {/* Middle: route timeline + payout */}
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: C.gold }}
              />
              <span
                className="mt-1 w-px flex-1"
                style={{ backgroundColor: C.line, minHeight: "26px" }}
              />
            </div>
            <div className="pb-3">
              <p className="text-[13px] font-semibold" style={{ color: C.ink }}>
                {pickup.pickupLocation}
              </p>
              <p className="text-[12px]" style={{ color: C.textMuted }}>
                {pickup.pickupAddress}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: C.red }}
              />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: C.ink }}>
                {pickup.dropoffLocation}
              </p>
              <p className="text-[12px]" style={{ color: C.textMuted }}>
                {pickup.dropoffAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 sm:text-right">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: C.textMuted }}
          >
            Payout
          </p>
          <p className="mt-1 text-[17px] font-bold" style={{ color: C.ink }}>
            {formatNaira(pickup.payout)}
          </p>
          <div
            className="mt-2 border-t pt-2 sm:min-w-[110px]"
            style={{ borderColor: C.line }}
          >
            <p
              className="flex items-center gap-1 text-[11.5px] sm:justify-end"
              style={{ color: C.textMuted }}
            >
              <Clock3 size={11} /> Est. {pickup.etaMinutes} mins
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: actions */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => onDecline?.(pickup.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
          style={{ backgroundColor: "#F3A5A5" }}
        >
          <X size={15} strokeWidth={2.4} />
          Decline
        </button>
        <button
          type="button"
          onClick={() => onAccept?.(pickup.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-md active:scale-[0.98]"
          style={{ backgroundColor: C.gold, color: C.ink }}
        >
          <Check size={15} strokeWidth={2.6} />
          Accept order
        </button>
      </div>
    </div>
  );
}

export default function DeliveryContent() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  // Zero-state for now — this will be wired up to /api/delivery data next.
  const [totalDeliveries] = useState(0);
  const [delivered] = useState(0);
  const [inTransit] = useState(0);

  const [availablePickups] = useState(0);
  const [pickupsToday] = useState(0);
  const [pickupsTomorrow] = useState(0);

  const [pendingDeliveries] = useState(0);
  const [pendingToday] = useState(0);
  const [pendingTomorrow] = useState(0);

  const [totalSales] = useState(0);

  // Available pickup requests — empty for now. Once wired to the real API,
  // each item should look like:
  // { id, title, deliveryType, icon, orderId, timeAgo, pickupLocation,
  //   pickupAddress, dropoffLocation, dropoffAddress, payout, etaMinutes }
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  function handleAcceptPickup(id) {
    setPickups((prev) => prev.filter((p) => p.id !== id));
  }

  function handleDeclinePickup(id) {
    setPickups((prev) => prev.filter((p) => p.id !== id));
  }

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "";

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-start justify-between opacity-0 animate-riseIn"
        style={{ animationDelay: "80ms" }}
      >
        <div>
          <h1
            className="text-[30px] font-semibold tracking-tight"
            style={{ color: C.ink }}
          >
            Delivery{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1.5 text-[14px]" style={{ color: C.textMuted }}>
            Manage your pickups, track deliveries, and watch your earnings
            grow.
          </p>
        </div>
      </div>

      {/* Stat cards — matches the reference layout */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DeliveryStatCard
          icon={Truck}
          iconBg="#EAF0FF"
          iconColor="#3457D5"
          label="Total deliveries"
          value={totalDeliveries}
          valueColor="#3457D5"
          mounted={mounted}
          delay={140}
          rows={[
            {
              icon: PackageCheck,
              label: "Delivered",
              value: delivered,
              color: "#1E3A8A",
            },
            {
              icon: RefreshCw,
              label: "In transit",
              value: inTransit,
              color: "#3457D5",
            },
          ]}
        />

        <DeliveryStatCard
          icon={PackageCheck}
          iconBg={C.greenSoft}
          iconColor={C.green}
          label="Available pickups"
          value={availablePickups}
          valueColor={C.green}
          mounted={mounted}
          delay={190}
          rows={[
            {
              icon: CalendarCheck2,
              label: "Today",
              value: pickupsToday,
              color: C.green,
            },
            {
              icon: CalendarClock,
              label: "Tomorrow",
              value: pickupsTomorrow,
              color: "#6FBE93",
            },
          ]}
        />

        <DeliveryStatCard
          icon={ClipboardList}
          iconBg="#FBF0DE"
          iconColor={C.goldDeep}
          label="Pending deliveries"
          value={pendingDeliveries}
          valueColor={C.goldDeep}
          mounted={mounted}
          delay={240}
          rows={[
            {
              icon: CalendarCheck2,
              label: "Today",
              value: pendingToday,
              color: C.goldDeep,
            },
            {
              icon: CalendarClock,
              label: "Tomorrow",
              value: pendingTomorrow,
              color: "#D2A94A",
            },
          ]}
        />

        <SimpleStatCard
          icon={ShoppingBag}
          iconBg={C.greenSoft}
          iconColor={C.green}
          label="Total sales"
          value={totalSales}
          valueColor={C.green}
          prefix="₦ "
          mounted={mounted}
          delay={290}
        />
      </div>

      {/* Available Pickups */}
      <div
        className="mt-8 opacity-0 animate-riseIn"
        style={{ animationDelay: "340ms" }}
      >
        <h2
          className="text-[20px] font-bold tracking-tight"
          style={{ color: C.ink }}
        >
          Available pickups
        </h2>
        <p className="mt-1 text-[13px]" style={{ color: C.textMuted }}>
          Review and respond to new delivery requests
        </p>

        {pickups.length > 0 ? (
          <div className="mt-5 flex flex-col gap-4">
            {pickups.map((pickup, i) => (
              <PickupCard
                key={pickup.id}
                pickup={pickup}
                delay={380 + i * 70}
                onAccept={handleAcceptPickup}
                onDecline={handleDeclinePickup}
              />
            ))}
          </div>
        ) : (
          <div
            className="mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-14 text-center"
            style={{
              borderColor: "rgba(198,156,63,0.3)",
              backgroundColor: "#FBF9F3",
            }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(198,156,63,0.12)" }}
            >
              <Inbox size={24} style={{ color: C.goldDeep }} strokeWidth={2} />
            </div>
            <p
              className="mt-4 text-[13.5px] font-semibold"
              style={{ color: C.ink }}
            >
              No pickups available right now
            </p>
            <p
              className="mt-1 max-w-[280px] text-[12.5px] leading-relaxed"
              style={{ color: C.textMuted }}
            >
              New pickup requests near you will show up here the moment a
              seller is ready to hand off a package.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
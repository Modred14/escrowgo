"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Clock3,
  Wallet,
  TrendingUp,
  Plus,
  Bell,
} from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { useCountUp, formatNaira, C } from "./hooks";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { QrCode, ScanLine, X } from "lucide-react";

import jsQR from "jsqr";

function useQrScanner(active, onScan) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    function tick() {
      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        onScan(code.data);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    async function start() {
        setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          tick();
        }
      } catch (err) {
        setError(err.message || "Camera access failed");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [active, onScan]);

  return { videoRef, error };
}

function useDashboardData() {
  const [data, setData] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
    ordersTrend: 0,
    salesTrend: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}
function StatCard({
  icon: Icon,
  label,
  value,
  prefix = "",
  trend,
  tint,
  delay,
  mounted,
  decimals,
}) {
  const count = useCountUp(value, { start: mounted, decimals, duration: 1500 });
  const display = decimals > 0 ? count : Number(count).toLocaleString("en-NG");

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
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: tint.bg, color: tint.fg }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>
        {trend !== undefined && (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: C.greenSoft, color: C.green }}
          >
            <TrendingUp size={11} /> {trend}%
          </span>
        )}
      </div>
      <p
        className="mt-4 text-[13px] font-medium"
        style={{ color: C.textMuted }}
      >
        {label}
      </p>
      <p
        className="mt-1  text-[26px] font-semibold tracking-tight"
        style={{ color: C.ink }}
      >
        {prefix}
        {display}
      </p>
    </div>
  );
}

export default function DashboardContent({ onNavigate }) {
  const { data: session, status } = useSession();
  const { data, loading: dataLoading } = useDashboardData();
  const [mounted, setMounted] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

 const handleScan = useCallback((scannedValue) => {
  console.log("Scanned:", scannedValue);

  // call delivery-confirm API
}, []);

const { videoRef, error: qrError } = useQrScanner(qrModalOpen, handleScan);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const completionPct =
    data.totalOrders > 0
      ? Math.round((data.completedOrders / data.totalOrders) * 100)
      : 0;
  const radialData = [
    { name: "completed", value: completionPct, fill: C.gold },
  ];

  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "";

  return (
    <div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes scanLine {
          0% {
            top: 24px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: calc(100% - 24px);
            opacity: 0;
          }
        }
        .animate-scanLine {
          animation: scanLine 2.2s ease-in-out infinite;
        }
      `}</style>
      {qrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl animate-scaleIn"
            style={{ border: `1px solid ${C.line}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 hover:bg-slate-100"
              style={{ color: C.textMuted }}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-1 pb-5 pt-1 text-center">
              <p className="text-[15px] font-semibold" style={{ color: C.ink }}>
                Scan QR Code
              </p>
              <p className="text-[12px]" style={{ color: C.textMuted }}>
                Point the camera at the delivery QR code
              </p>
            </div>

            <div
              className="relative mx-auto flex h-64 w-64 items-center justify-center overflow-hidden rounded-2xl"
              style={{ backgroundColor: "#0B1220" }}
            >
               <video
    ref={videoRef}
    className="absolute inset-0 h-full w-full object-cover"
    muted
    playsInline
  />
           


              <div className="absolute inset-6">
                <span
                  className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-2 border-t-2"
                  style={{ borderColor: C.gold }}
                />
                <span
                  className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-2 border-t-2"
                  style={{ borderColor: C.gold }}
                />
                <span
                  className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-2"
                  style={{ borderColor: C.gold }}
                />
                <span
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-2 border-r-2"
                  style={{ borderColor: C.gold }}
                />
              </div>

              <span
                className="absolute left-6 right-6 h-0.5 animate-scanLine"
                style={{
                  backgroundColor: C.gold,
                  boxShadow: `0 0 12px 2px ${C.gold}`,
                }}
              />

              <ScanLine
                className="h-10 w-10 opacity-20"
                style={{ color: C.gold }}
              />
               {qrError && (
    <p className="absolute bottom-2 px-4 text-center text-[11px] text-red-400">
      {qrError}
    </p>
  )}
            </div>

            <p
              className="mt-5 flex items-center justify-center gap-1.5 text-[11px]"
              style={{ color: C.textMuted }}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: C.gold }}
              />
              Waiting for QR code…
            </p>

            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="mt-5 w-full rounded-xl py-2.5 text-[13px] font-semibold text-white transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{ backgroundColor: C.gold }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div
        className="flex items-start justify-between opacity-0 animate-riseIn"
        style={{ animationDelay: "80ms" }}
      >
        <div>
          {status === "loading" ? (
            <>
              <div className="skeleton h-8 w-64 rounded-lg" />
              <div className="skeleton mt-3 h-4 w-52 rounded-md" />
            </>
          ) : (
            <>
              <h1
                className=" text-[30px] font-semibold tracking-tight"
                style={{ color: C.ink }}
              >
                Welcome back{firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-1.5 text-[14px]" style={{ color: C.textMuted }}>
                Track your orders and enjoy secure, escrow-protected shopping.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-semibold ring-2 ring-offset-2"
            style={{
              background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
              color: C.ink,
              ["--tw-ring-color"]: "rgba(198,156,63,0.4)",
              ["--tw-ring-offset-color"]: C.cream,
            }}
          >
            {initials || "··"}
          </div> */}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={data.totalOrders}
          trend={data.ordersTrend}
          tint={{ bg: "#EAF0FF", fg: "#3457D5" }}
          mounted={mounted}
          delay={140}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Orders"
          value={data.completedOrders}
          tint={{ bg: C.greenSoft, fg: C.green }}
          mounted={mounted}
          delay={190}
        />
        <StatCard
          icon={Clock3}
          label="Pending Orders"
          value={data.pendingOrders}
          tint={{ bg: "#FBF0DE", fg: C.goldDeep }}
          mounted={mounted}
          delay={240}
        />
        <StatCard
          icon={Wallet}
          label="Total Sales"
          value={data.totalSales}
          prefix="₦"
          trend={data.salesTrend}
          tint={{ bg: C.greenSoft, fg: C.green }}
          mounted={mounted}
          delay={290}
        />
      </div>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Create order panel */}

        <Link
          href="/create-deal"
          className="group relative flex min-h-[300px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed opacity-0 animate-riseIn transition-all duration-300 hover:border-solid xl:col-span-2"
          style={{
            borderColor: "rgba(198,156,63,0.4)",
            backgroundColor: "#FBF4E2",
            animationDelay: "360ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#F7EBCB")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#FBF4E2")
          }
        >
          <div
            className="cta-plus flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300"
            style={{ backgroundColor: C.ink }}
          >
            <Plus size={24} style={{ color: C.gold }} strokeWidth={2.4} />
          </div>
          <div className="text-center">
            <p
              className="text-[13px] font-bold uppercase tracking-[0.14em]"
              style={{ color: C.ink }}
            >
              Create Order
            </p>
            <p className="mt-1 text-[13px]" style={{ color: C.textMuted }}>
              <span className="font-semibold" style={{ color: C.goldDeep }}>
                Click here
              </span>{" "}
              to start a new escrow-protected order
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setQrModalOpen(true)}
          className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border bg-white p-6 opacity-0 animate-riseIn transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          style={{ borderColor: C.line, animationDelay: "410ms" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${C.gold}1a, transparent 70%)`,
            }}
          />

          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
            style={{ backgroundColor: "#FBF0DE" }}
          >
            <QrCode className="h-7 w-7" style={{ color: C.goldDeep }} />
            <span
              className="absolute inset-0 rounded-2xl border-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ borderColor: C.gold }}
            />
          </div>

          <div className="relative flex flex-col items-center gap-1 text-center">
            <p className="text-[13px] font-semibold" style={{ color: C.ink }}>
              Scan Delivery QR Code
            </p>
            <p className="text-[11px]" style={{ color: C.textMuted }}>
              Confirm pickup or delivery in seconds
            </p>
          </div>

          <span
            className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold text-white transition-transform duration-300 group-hover:scale-[1.03]"
            style={{ backgroundColor: C.gold }}
          >
            <ScanLine className="h-3.5 w-3.5" />
            Open scanner
          </span>
        </button>
      </div>
    </div>
  );
}

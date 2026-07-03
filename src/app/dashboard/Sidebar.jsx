"use client";
import React, { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  ShieldCheck,
  Settings,
  Eye,
  EyeOff,
  Truck,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useCountUp, formatNaira, C } from "./hooks";
import Image from "next/image";
import { useSession } from "next-auth/react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "wallet", label: "Wallet & Transactions", icon: Wallet },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "settings", label: "Profile & Settings", icon: Settings },
];

function NavItem({ icon: Icon, label, active, delay, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 ease-out opacity-0 animate-riseIn"
      style={{
        animationDelay: `${delay}ms`,
        color: active ? C.gold : "rgba(251,247,239,0.55)",
        backgroundColor: active ? "rgba(198,156,63,0.12)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!active)
          e.currentTarget.style.backgroundColor = "rgba(251,247,239,0.05)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full transition-all duration-300"
          style={{ backgroundColor: C.gold }}
        />
      )}
      <Icon size={18} strokeWidth={2} />
      <span className="text-[13.5px] font-medium tracking-wide">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate, page, setPage }) {
  const { data: session, status} = useSession();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const balance = 2000000; // shared wallet balance
  const balanceCount = useCountUp(balance, { start: true, duration: 1600 });
  const currentPage = activePage ?? page;
  const handleNavigate = onNavigate ?? setPage;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[290px] shrink-0 flex-col overflow-hidden px-5 py-7 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: C.ink }}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute right-4 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-all duration-300 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X size={18} />
        </button>

        <div
          className="flex items-center gap-2.5 px-2 opacity-0 animate-riseIn"
          style={{ animationDelay: "50ms" }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg font-serif text-base font-bold">
            <Image src="/logo.png" alt="EscrowGo" width={24} height={24} />
          </div>
          <span
            className="font-serif text-[18px] font-semibold tracking-tight"
            style={{ color: C.cream }}
          >
            EscrowGo<span style={{ color: C.gold }}>.</span>
          </span>
        </div>

        <div
          className="shimmer-sweep relative mt-3 overflow-hidden rounded-2xl p-5 opacity-0 animate-riseIn"
          style={{
            animationDelay: "150ms",
            background: `linear-gradient(155deg, ${C.inkSoft} 0%, ${C.ink} 65%)`,
            border: "1px solid rgba(198,156,63,0.25)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="pulse-seal flex h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(198,156,63,0.15)" }}
              >
                <ShieldCheck size={12} style={{ color: C.gold }} />
              </div>
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "rgba(251,247,239,0.6)" }}
              >
                Account Balance
              </span>
            </div>
            <button
              onClick={() => setBalanceVisible((v) => !v)}
              className="text-white/40 transition-colors hover:text-white/80"
            >
              {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
          <p
            className="mt-1 text-[11px]"
            style={{ color: "rgba(251,247,239,0.4)" }}
          >
            Available
          </p>
          <p
            className="mt-1.5 font-serif text-[25px] font-semibold tracking-tight"
            style={{ color: C.cream }}
          >
            {balanceVisible ? formatNaira(balanceCount) : "₦ • • • • • • •"}
          </p>
          <button
            className="mt-3 w-full rounded-xl py-1.5 text-[12px] font-semibold transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
              color: C.ink,
              boxShadow: "0 8px 20px -8px rgba(198,156,63,0.6)",
            }}
          >
            Withdraw Funds
          </button>
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1">
          <p
            className="px-4 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] opacity-0 animate-riseIn"
            style={{ color: "rgba(251,247,239,0.35)", animationDelay: "220ms" }}
          >
            Menu
          </p>
          {NAV_ITEMS.map((item, i) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={currentPage === item.key}
              delay={260 + i * 50}
              onClick={() => {
                handleNavigate(item.key);
                setMobileMenuOpen(false);
              }}
            />
          ))}
        </nav>

        <div
          className="group relative overflow-hidden rounded-2xl p-4 opacity-0 animate-riseIn transition-all duration-300 hover:border-[rgba(198,156,63,0.55)]"
          style={{
            border: "1px solid rgba(198,156,63,0.3)",
            backgroundColor: "rgba(198,156,63,0.06)",
            animationDelay: "470ms",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(198,156,63,0.18)" }}
            >
              <Truck size={13} style={{ color: C.gold }} />
            </div>
            <span
              className="text-[12px] font-semibold uppercase tracking-wide"
              style={{ color: C.goldSoft }}
            >
              Become a Courier
            </span>
          </div>
          <p
            className="mt-2.5 text-[12px] leading-relaxed"
            style={{ color: "rgba(251,247,239,0.5)" }}
          >
            Accept delivery requests, verify handoffs with QR-code scanning, and
            earn on every completed order.
          </p>
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold transition-all duration-300 group-hover:gap-2"
            style={{ color: C.gold }}
          >
            Become a courier <ArrowRight size={12} />
          </a>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="animate-fadeIn fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* expose trigger for the header to use */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        data-sidebar-trigger
        className="hidden"
        aria-hidden
      />
    </>
  );
}

"use client";
import React, { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import WalletTransactions from "./WalletTransactions";
import { C } from "./hooks";
import SecurityContent from "./SecurityContent";
import ProfileSettingsContent from "./ProfileSettingsContent";

export default function AppLayout() {
  const [page, setPage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen w-full"
      style={{
        backgroundColor: C.cream,
        fontFamily: "'Inter', ui-sans-serif, system-ui",
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,450;9..144,550;9..144,650&family=Inter:wght@400;500;600;700;800&display=swap"
      />
      <style>{`
        @keyframes riseIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .animate-riseIn { animation: riseIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes shimmerSweep { 0% { transform: translateX(-120%) skewX(-12deg); } 100% { transform: translateX(220%) skewX(-12deg); } }
        .shimmer-sweep::after { content: ''; position: absolute; top: 0; left: 0; width: 40%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.16), transparent); animation: shimmerSweep 3.2s ease-in-out infinite; }
        @keyframes pulseRing { 0%, 100% { box-shadow: 0 0 0 0 rgba(198,156,63,0.35); } 50% { box-shadow: 0 0 0 8px rgba(198,156,63,0); } }
        .pulse-seal { animation: pulseRing 2.6s ease-in-out infinite; }
        .font-serif { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .skeleton { background: linear-gradient(90deg, rgba(22,19,13,0.06) 25%, rgba(22,19,13,0.1) 37%, rgba(22,19,13,0.06) 63%); background-size: 400% 100%; animation: skeletonShine 1.4s ease infinite; }
        @keyframes skeletonShine { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
      `}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,450;9..144,550;9..144,650&family=Inter:wght@400;500;600;700;800&display=swap"
      />
      <style>{`
      @keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-riseIn { animation: riseIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

        @keyframes shimmerSweep {
          0% { transform: translateX(-120%) skewX(-12deg); }
          100% { transform: translateX(220%) skewX(-12deg); }
        }
        .shimmer-sweep::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.16), transparent);
          animation: shimmerSweep 3.2s ease-in-out infinite;
        }

        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(198,156,63,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(198,156,63,0); }
        }
        .pulse-seal { animation: pulseRing 2.6s ease-in-out infinite; }

        @keyframes ctaPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.08) rotate(90deg); }
        }
        .cta-plus { animation: ctaPulse 3.4s ease-in-out infinite; }

        .font-serif { font-family: 'Fraunces', ui-serif, Georgia, serif; }

        .skeleton {
          background: linear-gradient(90deg, rgba(22,19,13,0.06) 25%, rgba(22,19,13,0.1) 37%, rgba(22,19,13,0.06) 63%);
          background-size: 400% 100%;
          animation: skeletonShine 1.4s ease infinite;
        }
        @keyframes skeletonShine {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>

      <Sidebar
        activePage={page}
        onNavigate={setPage}
        open={mobileMenuOpen}
        setOpen={setMobileMenuOpen}
      />

      <main className="flex-1 px-6 py-7 sm:px-10 lg:px-12">
        <div className="mb-2 flex justify-end lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition-all duration-300 hover:-translate-y-0.5"
            style={{ borderColor: C.line }}
          >
            <Menu size={18} style={{ color: C.inkFaint }} />
          </button>
        </div>

        {/* Only this swaps — sidebar above never remounts */}
        <div key={page} className="animate-fadeIn">
          {page === "dashboard" && <DashboardContent onNavigate={setPage} />}
          {page === "wallet" && <WalletTransactions />}
          {page === "security" && <SecurityContent />}
          {page === "settings" && <ProfileSettingsContent />}
        </div>
      </main>
    </div>
  );
}

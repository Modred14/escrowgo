import Link from "next/link";
import SealMark from "@/components/Sealmark";

export default function NotFound() {
  return (
    <main className="e404-root relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-5 text-center">
      {/* Layered background: deep vault glow + drifting circuit grid + brand grain */}
      <div className="pointer-events-none absolute inset-0">
        <div className="e404-glow absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="e404-grid absolute inset-0 opacity-[0.12]" />
        <div className="bg-grain absolute inset-0 opacity-[0.05]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/0 via-ink/10 to-ink" />

        {/* Floating brass particles */}
        <span className="e404-particle absolute left-[18%] top-[24%] h-1.5 w-1.5 rounded-full bg-brass/70" style={{ animationDelay: "0s" }} />
        <span className="e404-particle absolute left-[82%] top-[30%] h-1 w-1 rounded-full bg-mint/60" style={{ animationDelay: "1.1s" }} />
        <span className="e404-particle absolute left-[27%] top-[68%] h-1 w-1 rounded-full bg-brass/50" style={{ animationDelay: "2.2s" }} />
        <span className="e404-particle absolute left-[74%] top-[72%] h-1.5 w-1.5 rounded-full bg-brass/60" style={{ animationDelay: "0.6s" }} />
        <span className="e404-particle absolute left-[50%] top-[16%] h-1 w-1 rounded-full bg-mint/50" style={{ animationDelay: "1.7s" }} />
      </div>

      {/* Status pill */}
      <div className="e404-rise relative flex items-center gap-2 rounded-full border border-brass/25 bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm" style={{ animationDelay: "0ms" }}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-seal/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-seal" />
        </span>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-paper/60">
          Error 404 · Unsealed route
        </span>
      </div>

      {/* Seal emblem with rotating brass ring + glow */}
      <div className="e404-rise relative mt-9 flex h-28 w-28 items-center justify-center" style={{ animationDelay: "90ms" }}>
        <div className="e404-ring-spin absolute inset-0 rounded-full border border-dashed border-brass/40" />
        <div className="e404-ring-spin-rev absolute inset-2 rounded-full border border-dashed border-mint/25" />
        <div className="e404-seal-pulse absolute inset-3 rounded-full bg-vault-light/20 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-vault shadow-seal">
          <img src="/logo.png"/>
        </div>
      </div>

      {/* 404 numeral */}
      <h1
        className="e404-rise e404-shimmer-text mt-8 select-none font-display text-[88px] font-semibold leading-none tracking-tight sm:text-[128px]"
        style={{ animationDelay: "160ms" }}
      >
        404
      </h1>

      <p
        className="e404-rise mt-4 max-w-md font-display text-2xl font-semibold text-paper sm:text-[28px]"
        style={{ animationDelay: "230ms" }}
      >
        This page slipped through the vault.
      </p>
      <p
        className="e404-rise mt-3 max-w-sm text-[14.5px] leading-relaxed text-paper/50"
        style={{ animationDelay: "290ms" }}
      >
        The page you're looking for doesn't exist, has moved, or was never sealed
        in the first place. Nothing here has been compromised — your escrow and
        data stay exactly where you left them.
      </p>

      {/* CTAs */}
      <div className="e404-rise mt-8 flex flex-col items-center gap-3 sm:flex-row" style={{ animationDelay: "360ms" }}>
        <Link
          href="/"
          className="e404-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-brass px-7 py-3 text-[13.5px] font-semibold text-ink shadow-seal transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
        >
          <span className="e404-cta-sheen absolute inset-0" />
          <span className="relative">Back to home</span>
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-white/[0.02] px-7 py-3 text-[13.5px] font-semibold text-paper/80 backdrop-blur-sm transition-all duration-300 hover:border-brass/40 hover:bg-white/[0.05] hover:text-paper"
        >
          Go to dashboard
        </Link>
      </div>

      {/* Scan line motif, echoing the QR-verification brand mark */}
      <div className="e404-rise mt-12 flex w-full max-w-xs items-center gap-3 text-paper/25" style={{ animationDelay: "430ms" }}>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-paper/15 to-transparent" />
        <span className="e404-scan relative h-1 w-24 overflow-hidden rounded-full bg-paper/10">
          <span className="absolute inset-y-0 left-0 w-8 rounded-full bg-brass" />
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-paper/15 to-transparent" />
      </div>

      <style>{`
        .e404-glow {
          background: radial-gradient(circle, rgba(254,196,23,0.16) 0%, rgba(20,60,48,0.25) 42%, rgba(14,26,23,0) 72%);
          filter: blur(4px);
          animation: e404-breathe 7s ease-in-out infinite;
        }
        .e404-grid {
          background-image:
            linear-gradient(rgba(224,180,92,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(224,180,92,0.5) 1px, transparent 1px);
          background-size: 42px 42px;
          -webkit-mask-image: radial-gradient(ellipse 60% 55% at 50% 40%, #000 0%, transparent 75%);
          mask-image: radial-gradient(ellipse 60% 55% at 50% 40%, #000 0%, transparent 75%);
          animation: e404-drift 26s linear infinite;
        }
        @keyframes e404-drift {
          from { background-position: 0 0, 0 0; }
          to { background-position: 84px 42px, 84px 42px; }
        }
        @keyframes e404-breathe {
          0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        }
        .e404-particle {
          animation: e404-float 6s ease-in-out infinite;
        }
        @keyframes e404-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-18px) scale(1.3); opacity: 1; }
        }
        .e404-ring-spin {
          animation: e404-spin 18s linear infinite;
        }
        .e404-ring-spin-rev {
          animation: e404-spin-rev 13s linear infinite;
        }
        @keyframes e404-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes e404-spin-rev {
          to { transform: rotate(-360deg); }
        }
        .e404-seal-pulse {
          animation: e404-seal-pulse 3.4s ease-in-out infinite;
        }
        @keyframes e404-seal-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        .e404-shimmer-text {
          background: linear-gradient(100deg, #9C7320 0%, #FEC417 22%, #FCEFC7 42%, #FEC417 62%, #9C7320 85%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: e404-shimmer 5s ease-in-out infinite;
        }
        @keyframes e404-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .e404-cta-sheen {
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
          transform: translateX(-120%);
        }
        .e404-cta:hover .e404-cta-sheen {
          animation: e404-sheen 1s ease forwards;
        }
        @keyframes e404-sheen {
          to { transform: translateX(120%); }
        }
        .e404-scan span {
          animation: e404-scan-move 2.6s ease-in-out infinite;
        }
        @keyframes e404-scan-move {
          0% { left: -2rem; }
          50% { left: 100%; }
          100% { left: -2rem; }
        }
        .e404-rise {
          opacity: 0;
          animation: e404-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes e404-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .e404-glow, .e404-grid, .e404-particle, .e404-ring-spin, .e404-ring-spin-rev,
          .e404-seal-pulse, .e404-shimmer-text, .e404-scan span, .e404-rise {
            animation: none !important;
          }
          .e404-rise { opacity: 1; transform: none; }
        }
      `}</style>
    </main>
  );
}
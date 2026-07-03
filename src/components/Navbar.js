"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SealMark from "@/components/Sealmark";
import { useSession } from "next-auth/react";
import { C } from "@/app/dashboard/hooks";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Privacy", href: "#privacy" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(session?.user);
  }, [session]);
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "?";
  return (
    <header className="sticky top-0 z-50 px-5 pt-4 bg-transparent">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-ink/10 bg-white px-4 py-2.5 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <span className="">
            <Image
              src="/logo.png"
              alt="EscrowGo logo"
              className="object-contain"
              width={25}
              height={24}
            />
          </span>
          <span className="font-display text-base font-semibold text-ink">
            EscrowGo<span className="text-brass">.</span>
          </span>
        </Link>

        {/* desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-ink/70 transition-colors duration-200 hover:text-brass-dark"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          {user ? (
            <Link href="/dashboard">
              <p className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full font-serif text-[14px] font-semibold ring-2 ring-offset-2"
                  style={{
                    background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
                    color: C.ink,
                    ["--tw-ring-color"]: "rgba(198,156,63,0.4)",
                    ["--tw-ring-offset-color"]: C.cream,
                  }}
                >
                  {initial || "··"}
                </div>
              </p>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#705A2F] hover:text-gray-100 hover:shadow-md"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* mobile hamburger / close icon */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors duration-200 hover:border-brass/40 md:hidden"
        >
          <span className="relative block h-3.5 w-4">
            <span
              className={`absolute left-0 top-0 h-[1.5px] w-full bg-ink transition-all duration-300 ${
                open ? "top-1/2 -translate-y-1/2 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-ink transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-ink transition-all duration-300 ${
                open ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      {/* mobile menu panel */}
      <div
        className={`mx-auto max-w-6xl overflow-hidden transition-all duration-300 ease-out md:hidden ${
          open ? "mt-2 max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors duration-200 hover:bg-paper-dim hover:text-brass-dark"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-500 hover:bg-[#705A2F] hover:text-gray-100"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-500 hover:bg-[#705A2F] hover:text-gray-100"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

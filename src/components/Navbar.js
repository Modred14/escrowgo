"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import SealMark from "@/components/Sealmark";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [{ href: "/dashboard", label: "Dashboard" }];
  if (session?.user?.role === "DELIVERY_AGENT") {
    links.push({ href: "/delivery/dashboard", label: "Delivery" });
  }
  if (session?.user?.role === "ADMIN") {
    links.push({ href: "/admin", label: "Admin" });
  }
  links.push({ href: "/scanner", label: "Scanner" });

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <SealMark size={32} />
          <span className="font-display text-lg font-semibold text-ink">
            EscrowGO
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {status === "authenticated" &&
            links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition hover:text-vault ${
                  pathname.startsWith(l.href) ? "text-vault" : "text-ink/60"
                }`}
              >
                {l.label}
              </Link>
            ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <NotificationBell />
              <Link
                href="/create-deal"
                className="rounded-full bg-vault px-4 py-2 text-sm font-semibold text-paper transition hover:bg-vault-light"
              >
                Create Secure Deal
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-medium text-ink/50 hover:text-seal"
              >
                Sign out
              </button>
            </>
          ) : status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-ink/5" />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-ink/70 hover:text-vault"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-vault px-4 py-2 text-sm font-semibold text-paper transition hover:bg-vault-light"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {status === "authenticated" ? (
              <>
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm font-medium text-ink/70"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/create-deal"
                  className="rounded-full bg-vault px-4 py-2.5 text-center text-sm font-semibold text-paper"
                  onClick={() => setOpen(false)}
                >
                  Create Secure Deal
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left text-sm font-medium text-seal"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-ink/70"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-vault px-4 py-2.5 text-center text-sm font-semibold text-paper"
                  onClick={() => setOpen(false)}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

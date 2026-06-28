import Link from "next/link";
import SealMark from "@/components/Sealmark";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <SealMark size={28} />
              <span className="font-display text-lg font-semibold text-paper">
                EscrowGO
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-paper/50">
              Payment stays sealed in escrow until delivery is verified by QR.
              Built for buyers and sellers who haven't met yet.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-paper/80">Product</span>
              <Link
                href="/create-deal"
                className="text-paper/50 hover:text-brass"
              >
                Create a deal
              </Link>
              <Link
                href="/delivery/register"
                className="text-paper/50 hover:text-brass"
              >
                Become a courier
              </Link>
              <Link href="/scanner" className="text-paper/50 hover:text-brass">
                Release scanner
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-paper/80">Account</span>
              <Link
                href="/auth/login"
                className="text-paper/50 hover:text-brass"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="text-paper/50 hover:text-brass"
              >
                Register
              </Link>
              <Link
                href="/dashboard"
                className="text-paper/50 hover:text-brass"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-paper/10 pt-6 text-xs text-paper/35 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} EscrowGO. Built for demo purposes —
            payments run on Nomba TEST mode.
          </span>
        </div>
      </div>
    </footer>
  );
}

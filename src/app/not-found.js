import Link from "next/link";
import SealMark from "@/components/SealMark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center">
      <SealMark size={44} />
      <h1 className="mt-5 font-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink/55">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="mt-6 rounded-full bg-vault px-6 py-2.5 text-sm font-semibold text-paper hover:bg-vault-light">
        Back to home
      </Link>
    </main>
  );
}

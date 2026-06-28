"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QRScanner from "@/components/QRScanner";
import { Spinner } from "@/components/Loaders";

export default function ScannerPage() {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [lastCode, setLastCode] = useState(null);

  const handleResult = useCallback(
    async (code) => {
      if (verifying || code === lastCode) return;
      setLastCode(code);
      setVerifying(true);
      setResult(null);
      try {
        const res = await fetch("/api/qr/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!res.ok) {
          setResult({ success: false, message: data.error });
          toast.error(data.error);
        } else {
          setResult({ success: true, deal: data.deal });
          toast.success("Escrow released.");
        }
      } catch {
        setResult({ success: false, message: "Something went wrong verifying that code." });
      } finally {
        setVerifying(false);
      }
    },
    [verifying, lastCode]
  );

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-paper px-5 py-10">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-2xl font-semibold text-ink">Release scanner</h1>
          <p className="mt-1 text-sm text-ink/55">
            Scan the buyer's QR code to confirm delivery and release escrow. Only the seller or assigned courier can do this.
          </p>

          <div className="mt-7">
            <QRScanner onResult={handleResult} disabled={verifying} />
          </div>

          {verifying && (
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-ink/55">
              <Spinner className="h-4 w-4" /> Verifying…
            </div>
          )}

          {result && (
            <div
              className={`mt-5 rounded-2xl border p-5 text-center ${
                result.success ? "border-mint/30 bg-mint/10" : "border-seal/30 bg-seal/5"
              }`}
            >
              {result.success ? (
                <>
                  <p className="text-2xl">✅</p>
                  <p className="mt-2 text-sm font-semibold text-mint-dark">Escrow released for "{result.deal.productName}"</p>
                  <Link href={`/deal/${result.deal.slug}`} className="mt-3 inline-block text-xs font-semibold text-vault hover:underline">
                    View deal →
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-2xl">⚠️</p>
                  <p className="mt-2 text-sm font-semibold text-seal">{result.message}</p>
                  <button
                    onClick={() => {
                      setResult(null);
                      setLastCode(null);
                    }}
                    className="mt-3 text-xs font-semibold text-ink/50 hover:text-ink"
                  >
                    Try again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// src/app/dashboard/WithdrawModal.jsx
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Wallet,
  Search,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Delete,
} from "lucide-react";
import { formatNaira, C } from "./hooks";

// Steps: form (amount/bank/account) -> pin (enter PIN) -> no-pin (must set
// one first) -> success. Rendered via portal so it always sits above the
// dashboard, whether it's opened from the sidebar or the wallet tab.
export default function WithdrawModal({ open, onClose, balance = 0, onSuccess }) {
  const [step, setStep] = useState("form");

  const [amount, setAmount] = useState("");
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null); // { name, code }
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const [pinSet, setPinSet] = useState(null); // null = unknown yet
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pickerRef = useRef(null);

  // Reset everything each time the modal is opened fresh.
  useEffect(() => {
    if (!open) return;
    setStep("form");
    setAmount("");
    setBankQuery("");
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setLookupError("");
    setPin("");
    setPinError("");
    setSubmitting(false);

    (async () => {
      try {
        const res = await fetch("/api/security/status");
        const json = await res.json();
        setPinSet(!!json.pinSet);
      } catch {
        setPinSet(false);
      }
    })();

    (async () => {
      setBanksLoading(true);
      try {
        const res = await fetch("/api/wallet/banks");
        const json = await res.json();
        setBanks(json.banks || []);
      } catch {
        setBanks([]);
      } finally {
        setBanksLoading(false);
      }
    })();
  }, [open]);

  // Close the bank dropdown on outside click.
  useEffect(() => {
    if (!bankPickerOpen) return;
    function onDocClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setBankPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [bankPickerOpen]);

  // Debounced account-name lookup once we have a 10-digit account number
  // and a selected bank.
  useEffect(() => {
    setAccountName("");
    setLookupError("");
    if (!selectedBank || !/^\d{10}$/.test(accountNumber)) return;

    setLookupLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/wallet/banks/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountNumber, bankCode: selectedBank.code }),
        });
        const json = await res.json();
        if (!res.ok) {
          setLookupError(json.error || "Couldn't verify this account.");
        } else {
          setAccountName(json.accountName || "");
        }
      } catch {
        setLookupError("Couldn't verify this account. Check your connection.");
      } finally {
        setLookupLoading(false);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [accountNumber, selectedBank]);

  const filteredBanks = useMemo(() => {
    if (!bankQuery) return banks;
    const q = bankQuery.toLowerCase();
    return banks.filter((b) => b.name.toLowerCase().includes(q));
  }, [banks, bankQuery]);

  const numericAmount = Number(amount);
  const amountValid = numericAmount > 0 && numericAmount <= balance;
  const canContinue =
    amountValid && selectedBank && /^\d{10}$/.test(accountNumber) && !!accountName && !lookupLoading;

  function handleClose() {
    if (submitting) return;
    onClose?.();
  }

  function handleContinue() {
    if (!canContinue) return;
    setStep(pinSet ? "pin" : "no-pin");
  }

  function pressDigit(d) {
    if (pin.length >= 4) return;
    setPinError("");
    setPin((p) => p + d);
  }
  function backspace() {
    setPinError("");
    setPin((p) => p.slice(0, -1));
  }

  async function submitWithdrawal(fullPin) {
    setSubmitting(true);
    setPinError("");
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          accountNumber,
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          pin: fullPin,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.error === "no_pin") {
          setStep("no-pin");
          return;
        }
        setPinError(json.error || "Something went wrong. Try again.");
        setPin("");
        return;
      }

      setStep("success");
      onSuccess?.();
    } catch (err) {
      setPinError("Network error. Please try again.");
      setPin("");
    } finally {
      setSubmitting(false);
    }
  }

  // Auto-submit the moment the 4th digit is entered.
  useEffect(() => {
    if (step === "pin" && pin.length === 4 && !submitting) {
      submitWithdrawal(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, step]);

  // IMPORTANT: this early return must come after every hook above it, or
  // hook order breaks between "closed" and "open" renders (Rules of Hooks).
  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="p-6">
          {step === "form" && (
            <>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "rgba(198,156,63,0.15)" }}
                >
                  <Wallet size={16} style={{ color: C.goldDeep }} />
                </div>
                <div>
                  <p className="font-serif text-[18px] font-semibold" style={{ color: C.ink }}>
                    Withdraw funds
                  </p>
                  <p className="text-[12px]" style={{ color: C.textMuted }}>
                    Available: {formatNaira(balance)}
                  </p>
                </div>
              </div>

              <label className="mt-5 block text-[12px] font-semibold" style={{ color: C.inkFaint }}>
                Amount (₦)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:border-[rgba(198,156,63,0.6)]"
                style={{ borderColor: C.line, color: C.ink }}
              />
              {amount && !amountValid && (
                <p className="mt-1 text-[11.5px]" style={{ color: C.red }}>
                  {numericAmount > balance
                    ? "That's more than your available balance."
                    : "Enter an amount greater than zero."}
                </p>
              )}

              <label className="mt-4 block text-[12px] font-semibold" style={{ color: C.inkFaint }}>
                Bank
              </label>
              <div className="relative mt-1.5" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setBankPickerOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-[14px] transition-colors focus:border-[rgba(198,156,63,0.6)]"
                  style={{ borderColor: C.line, color: selectedBank ? C.ink : C.textMuted }}
                >
                  {selectedBank ? selectedBank.name : banksLoading ? "Loading banks…" : "Select your bank"}
                  <Search size={14} style={{ color: C.textMuted }} />
                </button>

                {bankPickerOpen && (
                  <div
                    className="absolute z-20 mt-1.5 max-h-56 w-full overflow-hidden rounded-xl border bg-white shadow-lg"
                    style={{ borderColor: C.line }}
                  >
                    <input
                      autoFocus
                      value={bankQuery}
                      onChange={(e) => setBankQuery(e.target.value)}
                      placeholder="Search banks…"
                      className="w-full border-b px-3.5 py-2.5 text-[13px] outline-none"
                      style={{ borderColor: C.line }}
                    />
                    <div className="max-h-44 overflow-y-auto">
                      {filteredBanks.map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => {
                            setSelectedBank(b);
                            setBankPickerOpen(false);
                            setBankQuery("");
                          }}
                          className="block w-full px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-[#FBF7EF]"
                          style={{ color: C.ink }}
                        >
                          {b.name}
                        </button>
                      ))}
                      {!banksLoading && filteredBanks.length === 0 && (
                        <p className="px-3.5 py-3 text-[12.5px]" style={{ color: C.textMuted }}>
                          No banks match “{bankQuery}”.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <label className="mt-4 block text-[12px] font-semibold" style={{ color: C.inkFaint }}>
                Account number
              </label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0123456789"
                inputMode="numeric"
                className="mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:border-[rgba(198,156,63,0.6)]"
                style={{ borderColor: C.line, color: C.ink }}
              />

              <div className="mt-2 min-h-[20px]">
                {lookupLoading && (
                  <p className="flex items-center gap-1.5 text-[12px]" style={{ color: C.textMuted }}>
                    <Loader2 size={12} className="animate-spin" /> Verifying account…
                  </p>
                )}
                {!lookupLoading && accountName && (
                  <p className="flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: C.green }}>
                    <CheckCircle2 size={13} /> {accountName}
                  </p>
                )}
                {!lookupLoading && lookupError && (
                  <p className="text-[12px]" style={{ color: C.red }}>
                    {lookupError}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
                  color: C.ink,
                }}
              >
                Continue <ArrowRight size={15} />
              </button>
            </>
          )}

          {step === "no-pin" && (
            <div className="flex flex-col items-center py-3 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(214,69,69,0.1)" }}
              >
                <ShieldAlert size={24} style={{ color: C.red }} />
              </div>
              <p className="mt-4 font-serif text-[18px] font-semibold" style={{ color: C.ink }}>
                Set a PIN to withdraw
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: C.textMuted }}>
                You need a 4-digit transaction PIN before you can withdraw funds. Set one on
                the Security page, then come back here.
              </p>
              <Link
                href="/dashboard?tab=security"
                onClick={handleClose}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-semibold transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
                  color: C.ink,
                }}
              >
                Go to Security page <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="mt-3 text-[12.5px] font-medium"
                style={{ color: C.textMuted }}
              >
                Back
              </button>
            </div>
          )}

          {step === "pin" && (
            <div className="flex flex-col items-center py-2 text-center">
              <p className="font-serif text-[18px] font-semibold" style={{ color: C.ink }}>
                Enter your PIN
              </p>
              <p className="mt-1.5 text-[13px]" style={{ color: C.textMuted }}>
                Confirm {formatNaira(numericAmount)} to {accountName}
              </p>

              <div className="mt-6 flex gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex h-12 w-11 items-center justify-center rounded-xl border text-[20px] font-semibold"
                    style={{
                      borderColor: pinError ? C.red : C.line,
                      color: C.ink,
                      backgroundColor: "#FBF7EF",
                    }}
                  >
                    {pin[i] ? "•" : ""}
                  </div>
                ))}
              </div>

              {pinError && (
                <p className="mt-3 text-[12px]" style={{ color: C.red }}>
                  {pinError}
                </p>
              )}
              {submitting && (
                <p className="mt-3 flex items-center gap-1.5 text-[12px]" style={{ color: C.textMuted }}>
                  <Loader2 size={12} className="animate-spin" /> Processing withdrawal…
                </p>
              )}

              <div className="mt-6 grid w-full grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((k, i) =>
                  k === "" ? (
                    <div key={i} />
                  ) : k === "back" ? (
                    <button
                      key={i}
                      type="button"
                      disabled={submitting}
                      onClick={backspace}
                      className="flex items-center justify-center rounded-xl py-3 text-[15px] transition-colors hover:bg-[#FBF7EF] disabled:opacity-40"
                      style={{ color: C.ink }}
                    >
                      <Delete size={16} />
                    </button>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      disabled={submitting}
                      onClick={() => pressDigit(k)}
                      className="flex items-center justify-center rounded-xl py-3 text-[16px] font-semibold transition-colors hover:bg-[#FBF7EF] disabled:opacity-40"
                      style={{ color: C.ink }}
                    >
                      {k}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setPin("");
                  setPinError("");
                  setStep("form");
                }}
                className="mt-2 text-[12.5px] font-medium disabled:opacity-40"
                style={{ color: C.textMuted }}
              >
                Back
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-4 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: C.greenSoft }}
              >
                <CheckCircle2 size={26} style={{ color: C.green }} />
              </div>
              <p className="mt-4 font-serif text-[18px] font-semibold" style={{ color: C.ink }}>
                Withdrawal on its way
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: C.textMuted }}>
                {formatNaira(numericAmount)} is headed to {accountName} ({selectedBank?.name}).
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-5 w-full rounded-xl py-3 text-[13.5px] font-semibold transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
                  color: C.ink,
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
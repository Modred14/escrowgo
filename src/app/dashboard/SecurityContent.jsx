"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Smartphone,
  MessageSquareText,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { C } from "./hooks";

function formatWhen(date) {
  if (!date) return "Not set yet";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function scorePassword(pw) {
  if (!pw) return { score: 0, label: "", color: C.line };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = [C.red, C.red, C.goldDeep, C.gold, C.green, C.green];
  return { score, label: labels[score], color: colors[score] };
}

function CardHeader({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
            boxShadow: "0 8px 18px -10px rgba(198,156,63,0.7)",
          }}
        >
          <Icon size={19} style={{ color: C.ink }} strokeWidth={2.2} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p
              className="font-serif text-[17px] font-semibold"
              style={{ color: C.ink }}
            >
              {title}
            </p>
            {badge}
          </div>
          <p className="mt-0.5 text-[13px]" style={{ color: C.textMuted }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ ok, okLabel, pendingLabel }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-colors duration-300"
      style={{
        backgroundColor: ok ? C.greenSoft : "#FBF0DE",
        color: ok ? C.green : C.goldDeep,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: ok ? C.green : C.goldDeep }}
      />
      {ok ? okLabel : pendingLabel}
    </span>
  );
}

function PrimaryButton({ children, onClick, loading, disabled, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      style={{
        background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
        color: C.ink,
        boxShadow: disabled ? "none" : "0 10px 22px -10px rgba(198,156,63,0.7)",
      }}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {loading ? "Saving…" : children}
    </button>
  );
}

function PinDigitGroup({ label, values, setValues, refsArr, disabled, error }) {
  const handleChange = (i, raw) => {
    const v = raw.replace(/[^0-9]/g, "").slice(-1);
    const next = [...values];
    next[i] = v;
    setValues(next);
    if (v && i < 3) refsArr.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      refsArr.current[i - 1]?.focus();
    }
  };

  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: C.textMuted }}
      >
        {label}
      </p>
      <div className="mt-2.5 flex gap-2.5">
        {values.map((v, i) => (
          <input
            key={i}
            ref={(el) => (refsArr.current[i] = el)}
            value={v}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            type="password"
            className="h-12 w-12 rounded-xl border text-center text-[18px] font-semibold outline-none transition-all duration-200 focus:-translate-y-0.5 disabled:opacity-50 sm:h-[52px] sm:w-[52px]"
            style={{
              borderColor: error ? C.red : v ? C.gold : C.line,
              color: C.ink,
              backgroundColor: v ? "#FBF4E2" : "#FFFFFF",
              boxShadow: v ? "0 6px 14px -8px rgba(198,156,63,0.5)" : "none",
            }}
            onFocus={(e) => {
              if (!error) e.currentTarget.style.borderColor = C.gold;
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PinCard({ onSuccess }) {
  const [pinSet, setPinSet] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const newRefs = useRef([]);
  const confirmRefs = useRef([]);

  const complete = newPin.every(Boolean) && confirmPin.every(Boolean);

  const handleSubmit = () => {
    setError(null);
    if (!complete) {
      setError("Enter all 4 digits in both fields.");
      return;
    }
    if (newPin.join("") !== confirmPin.join("")) {
      setError("PINs don't match. Try again.");
      return;
    }
    setStatus("saving");
    setTimeout(() => {
      setStatus("saved");
      setPinSet(true);
      setLastUpdated(new Date());
      setNewPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      onSuccess("Transaction PIN updated");
      setTimeout(() => setStatus("idle"), 1200);
    }, 900);
  };

  return (
    <div
      className="rounded-2xl border bg-white p-6 opacity-0 animate-riseIn transition-all duration-300 sm:p-7"
      style={{
        borderColor: C.line,
        animationDelay: "140ms",
        boxShadow: "0 1px 2px rgba(22,19,13,0.04)",
      }}
    >
      <CardHeader
        icon={KeyRound}
        title="Set your transaction PIN"
        subtitle="Create a 4-digit PIN for secure withdrawals."
        badge={
          <StatusPill ok={pinSet} okLabel="Active" pendingLabel="Not set" />
        }
      />

      <p className="mt-4 text-[12px]" style={{ color: C.textMuted }}>
        {pinSet
          ? `Last updated ${formatWhen(lastUpdated)}`
          : "You'll need this PIN to authorize every withdrawal."}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
        <PinDigitGroup
          label="New PIN"
          values={newPin}
          setValues={setNewPin}
          refsArr={newRefs}
          disabled={status === "saving"}
          error={!!error}
        />
        <PinDigitGroup
          label="Confirm PIN"
          values={confirmPin}
          setValues={setConfirmPin}
          refsArr={confirmRefs}
          disabled={status === "saving"}
          error={!!error}
        />
      </div>

      {error && (
        <div
          className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium opacity-0 animate-riseIn"
          style={{ color: C.red, animationDuration: "0.3s" }}
        >
          <AlertCircle size={13} /> {error}
        </div>
      )}

      <div
        className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: C.line }}
      >
        <p className="text-[12px]" style={{ color: C.textMuted }}>
          Never share your PIN with anyone, including EscrowGo support.
        </p>
        <PrimaryButton
          onClick={handleSubmit}
          loading={status === "saving"}
          icon={status === "saved" ? CheckCircle2 : ShieldCheck}
        >
          {status === "saved" ? "PIN saved" : pinSet ? "Update PIN" : "Set PIN"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggleShow,
  disabled,
  hint,
}) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: C.goldDeep }}
      >
        {label}
      </p>
      <div className="relative mt-2">
        <Lock
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: C.textMuted }}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border pl-9 pr-10 text-[13px] outline-none transition-all duration-200 disabled:opacity-50"
          style={{
            borderColor: C.line,
            color: C.ink,
            backgroundColor: "#FFFFFF",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
          onBlur={(e) => (e.currentTarget.style.borderColor = C.line)}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
          style={{ color: C.textMuted }}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {hint}
    </div>
  );
}

function PasswordCard({ onSuccess }) {
  const [lastChanged, setLastChanged] = useState(null);
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const strength = scorePassword(values.next);
  const complete = values.current && values.next && values.confirm;

  const setField = (key) => (v) => setValues((s) => ({ ...s, [key]: v }));
  const toggleShow = (key) => () => setShow((s) => ({ ...s, [key]: !s[key] }));

  const handleSubmit = () => {
    setError(null);
    if (!complete) {
      setError("Fill in all three fields.");
      return;
    }
    if (values.next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (values.next !== values.confirm) {
      setError("New password and confirmation don't match.");
      return;
    }
    setStatus("saving");
    setTimeout(() => {
      setStatus("saved");
      setLastChanged(new Date());
      setValues({ current: "", next: "", confirm: "" });
      onSuccess("Password updated");
      setTimeout(() => setStatus("idle"), 1200);
    }, 900);
  };

  return (
    <div
      className="mt-5 rounded-2xl border bg-white p-6 opacity-0 animate-riseIn transition-all duration-300 sm:p-7"
      style={{
        borderColor: C.line,
        animationDelay: "220ms",
        boxShadow: "0 1px 2px rgba(22,19,13,0.04)",
      }}
    >
      <CardHeader
        icon={Lock}
        title="Change password"
        subtitle="Enter your current password to set a new one."
        badge={
          <span className="text-[11px]" style={{ color: C.textMuted }}>
            {formatWhen(lastChanged)}
          </span>
        }
      />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PasswordField
          label="Current password"
          placeholder="Enter your current password"
          value={values.current}
          onChange={setField("current")}
          show={show.current}
          onToggleShow={toggleShow("current")}
          disabled={status === "saving"}
        />
        <PasswordField
          label="New password"
          placeholder="Enter a new password"
          value={values.next}
          onChange={setField("next")}
          show={show.next}
          onToggleShow={toggleShow("next")}
          disabled={status === "saving"}
          hint={
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        i < strength.score ? strength.color : C.line,
                    }}
                  />
                ))}
              </div>
              {values.next && (
                <span
                  className="text-[10.5px] font-medium"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </span>
              )}
            </div>
          }
        />
        <PasswordField
          label="Confirm password"
          placeholder="Re-enter your new password"
          value={values.confirm}
          onChange={setField("confirm")}
          show={show.confirm}
          onToggleShow={toggleShow("confirm")}
          disabled={status === "saving"}
        />
      </div>

      {error && (
        <div
          className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium opacity-0 animate-riseIn"
          style={{ color: C.red, animationDuration: "0.3s" }}
        >
          <AlertCircle size={13} /> {error}
        </div>
      )}

      <div
        className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: C.line }}
      >
        <p className="text-[12px]" style={{ color: C.textMuted }}>
          Use at least 8 characters with a mix of letters, numbers and symbols.
        </p>
        <PrimaryButton
          onClick={handleSubmit}
          loading={status === "saving"}
          icon={status === "saved" ? CheckCircle2 : Lock}
        >
          {status === "saved" ? "Password saved" : "Update password"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function ToggleSwitch({ on, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-50"
      style={{ backgroundColor: on ? C.gold : C.line }}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-300"
        style={{
          transform: on ? "translateX(22px)" : "translateX(2px)",
          boxShadow: "0 2px 6px rgba(22,19,13,0.25)",
        }}
      />
    </button>
  );
}

function MethodOption({ icon: Icon, title, subtitle, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 items-start gap-3 rounded-xl border p-4 text-left transition-all duration-300"
      style={{
        borderColor: active ? C.gold : C.line,
        backgroundColor: active ? "#FBF4E2" : "#FFFFFF",
      }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300"
        style={{
          backgroundColor: active ? C.gold : "#F1EBDA",
          color: active ? C.ink : C.textMuted,
        }}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[13px] font-semibold" style={{ color: C.ink }}>
          {title}
        </p>
        <p className="mt-0.5 text-[11.5px]" style={{ color: C.textMuted }}>
          {subtitle}
        </p>
      </div>
    </button>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 opacity-0 animate-riseIn"
      style={{
        backgroundColor: C.ink,
        color: C.cream,
        boxShadow: "0 16px 36px -12px rgba(22,19,13,0.5)",
        animationDuration: "0.4s",
      }}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(198,156,63,0.2)" }}
      >
        <CheckCircle2 size={13} style={{ color: C.gold }} />
      </span>
      <span className="text-[13px] font-medium">{message}</span>
    </div>
  );
}

export default function SecurityContent() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(
    () => () => timeoutRef.current && clearTimeout(timeoutRef.current),
    [],
  );

  return (
    <div>
      <div
        className="opacity-0 animate-riseIn"
        style={{ animationDelay: "60ms" }}
      >
        <h1
          className="font-serif text-[30px] font-semibold tracking-tight"
          style={{ color: C.ink }}
        >
          Security
        </h1>
        <p className="mt-1.5 text-[14px]" style={{ color: C.textMuted }}>
          Protect your account with a transaction PIN, a strong password, and
          two-factor authentication.
        </p>
      </div>

      <div className="mt-7">
        <PinCard onSuccess={showToast} />
        <PasswordCard onSuccess={showToast} />
      </div>

      <Toast message={toast} />
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Spinner } from "@/components/Loader";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
function GoogleIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18">
      <path
        fill="#4285F4"
        d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.82h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.99-4.33 2.99-7.32z"
      />
      <path
        fill="#34A853"
        d="M10 20c2.7 0 4.97-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H1.06v2.59A10 10 0 0 0 10 20z"
      />
      <path
        fill="#FBBC05"
        d="M4.41 11.9a5.99 5.99 0 0 1 0-3.8V5.5H1.06a10 10 0 0 0 0 9l3.35-2.6z"
      />
      <path
        fill="#EA4335"
        d="M10 3.98c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.06 5.5l3.35 2.6C5.2 5.74 7.4 3.98 10 3.98z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      ...form,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Welcome back.");
    router.replace(callbackUrl);
    router.refresh();
  }

  return (
    <main className="egv-main bg-home">
      <div className="egv-shell">
        <div className="egv-card">
          <div className="egv-header">
            <h1 className="egv-title">
              Welcome back to <span className="text-brass">EscrowGo</span>
            </h1>
            <p className="egv-subtitle">Log in to manage your deals.</p>
          </div>

          <form onSubmit={handleSubmit} className="egv-form">
            <Field
              index={0}
              label="Email"
              icon={<MailIcon />}
              type="email"
              disabled={loading}
              required
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="you@example.com"
            />
            <Field
              index={1}
              label="Password"
              icon={<LockIcon />}
              disabled={loading}
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="••••••••"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="egv-eye"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="egv-submit egv-field-in"
              style={{ animationDelay: "220ms" }}
            >
              <span className="egv-submit-sheen" />
              {loading && <Spinner className="h-4 w-4" />}
              <span>Sign in</span>
            </button>

            <div
              className="egv-divider egv-field-in"
              style={{ animationDelay: "260ms" }}
            >
              <span className="egv-divider-line" />
              <span className="egv-divider-text">or</span>
              <span className="egv-divider-line" />
            </div>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              className="egv-google egv-field-in"
              style={{ animationDelay: "300ms" }}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </form>

          <p
            className="egv-foot egv-field-in"
            style={{ animationDelay: "280ms" }}
          >
            Don't have an account?{" "}
            <Link
              href={`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="text-brass-dark font-bold "
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <Styles />
    </main>
  );
}

function Field({ index, label, icon, trailing, value, disabled, onChange, ...rest }) {
  return (
    <div
      className="egv-field egv-field-in"
      style={{ animationDelay: `${index * 70 + 80}ms` }}
    >
      <label className="egv-label">{label}</label>
      <div className="egv-input-wrap">
        <span className="egv-input-icon">{icon}</span>
        <input
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="egv-input"
        />
        {trailing}
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <rect
        x="2.5"
        y="4.5"
        width="15"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3.5 6l6.5 5 6.5-5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <rect
        x="4"
        y="9"
        width="12"
        height="8"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M2 10s2.8-5 8-5 8 5 8 5-2.8 5-8 5-8-5-8-5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path
        d="M2.5 2.5l15 15"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M8.3 4.4A8.6 8.6 0 0 1 10 4.2c5.2 0 8 5 8 5a13.9 13.9 0 0 1-2.7 3.3M5.5 5.9A13.7 13.7 0 0 0 2 9.2s2.8 5 8 5c.9 0 1.8-.15 2.6-.42"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      .egv-divider {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0.35rem 0;
      }
      .egv-divider-line {
        flex: 1;
        height: 1px;
        background: rgba(27, 33, 31, 0.12);
      }
      .egv-divider-text {
        font-size: 0.75rem;
        color: rgba(27, 33, 31, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .egv-google {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        width: 100%;
        border-radius: 0.85rem;
        border: 1px solid rgba(27, 33, 31, 0.14);
        background: #fff;
        color: #1b211f;
        padding: 0.7rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        transition:
          border-color 200ms ease,
          box-shadow 200ms ease,
          transform 150ms ease;
      }
      .egv-google:hover {
        border-color: rgba(27, 33, 31, 0.28);
        box-shadow: 0 6px 16px -8px rgba(14, 59, 57, 0.25);
        transform: translateY(-1px);
      }
      .egv-google:active {
        transform: translateY(0) scale(0.98);
      }
      .egv-main {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 1.25rem;
        overflow: hidden;
      }
      .egv-backdrop {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .egv-guilloche {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        color: #0e3b39;
        opacity: 0.05;
      }
      .egv-glow {
        position: absolute;
        width: 46rem;
        height: 46rem;
        border-radius: 999px;
        filter: blur(90px);
        opacity: 0.22;
      }
      .egv-glow--tr {
        top: -16rem;
        right: -14rem;
        background: radial-gradient(circle, #0e3b39, transparent 70%);
      }
      .egv-glow--bl {
        bottom: -18rem;
        left: -16rem;
        background: radial-gradient(circle, #c9a227, transparent 70%);
        opacity: 0.16;
      }

      .egv-shell {
        position: relative;
        width: 100%;
        max-width: 25rem;
        animation: egv-rise 640ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .egv-card {
        position: relative;
        border-radius: 1.75rem;
        border: 1px solid rgba(14, 59, 57, 0.1);
        background: #ffffff;
        padding: 2.5rem 2rem 2.25rem;
        box-shadow:
          0 1px 2px rgba(14, 59, 57, 0.04),
          0 24px 48px -20px rgba(14, 59, 57, 0.22),
          0 0 0 1px rgba(255, 255, 255, 0.6) inset;
      }
      .egv-card::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          160deg,
          rgba(201, 162, 39, 0.35),
          transparent 30%
        );
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }

      .egv-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 1.75rem;
      }

      .egv-seal {
        position: relative;
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(155deg, #0e3b39, #175450);
        box-shadow: 0 8px 20px -8px rgba(14, 59, 57, 0.55);
      }
      .egv-seal-logo {
        width: 1.9rem;
        height: 1.9rem;
        object-fit: contain;
        filter: brightness(0) invert(1);
      }
      .egv-seal-ring {
        position: absolute;
        inset: -6px;
        border-radius: 999px;
        border: 1.5px solid rgba(201, 162, 39, 0.55);
        border-top-color: transparent;
        border-left-color: transparent;
        animation: egv-spin-in 900ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
      }

      .egv-title {
        margin-top: 1.1rem;
        font-family: var(--font-display, ui-serif, Georgia, serif);
        font-size: 1.45rem;
        font-weight: 600;
        color: #1b211f;
        letter-spacing: -0.01em;
      }
      .egv-brand {
        color: #c9a227;
      }
      .egv-subtitle {
        margin-top: 0.35rem;
        font-size: 0.875rem;
        color: rgba(27, 33, 31, 0.55);
      }

      .egv-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .egv-field-in {
        animation: egv-field-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .egv-label {
        display: block;
        margin-bottom: 0.4rem;
        font-size: 0.8rem;
        font-weight: 500;
        color: rgba(27, 33, 31, 0.65);
      }

      .egv-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .egv-input-icon {
        position: absolute;
        left: 0.85rem;
        width: 1.05rem;
        height: 1.05rem;
        color: rgba(27, 33, 31, 0.35);
        pointer-events: none;
        transition: color 200ms ease;
      }
      .egv-input {
        width: 100%;
        border-radius: 0.85rem;
        border: 1px solid rgba(27, 33, 31, 0.14);
        background: #fff;
        padding: 0.7rem 0.9rem 0.7rem 2.5rem;
        font-size: 0.9rem;
        color: #1b211f;
        outline: none;
        transition:
          border-color 200ms ease,
          box-shadow 200ms ease,
          transform 150ms ease;
      }
      .egv-input::placeholder {
        color: rgba(27, 33, 31, 0.32);
      }
      .egv-input:focus {
        border-color: #c9a227;
        box-shadow: 0 0 0 4px rgba(201, 162, 39, 0.14);
      }
      .egv-input-wrap:focus-within .egv-input-icon {
        color: #c9a227;
      }

      .egv-eye {
        position: absolute;
        right: 0.75rem;
        display: flex;
        color: rgba(27, 33, 31, 0.4);
        transition: color 180ms ease;
      }
      .egv-eye:hover {
        color: #0e3b39;
      }
      .egv-eye svg {
        width: 1.05rem;
        height: 1.05rem;
      }

      .egv-submit {
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        border-radius: 0.85rem;
        background: #ffc109;
        color: #175450;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
        font-weight: 600;
        margin-top: 0.25rem;
        transition:
          background 220ms ease,
          transform 150ms ease,
          box-shadow 220ms ease;
        box-shadow: 0 10px 5px -10px rgba(14, 59, 57, 0.55);
      }
      .egv-submit:hover {
        background: #8f6b07;
        color: #faf6ee;
        transform: translateY(-1px);
        box-shadow: 0 10px 15px -10px rgba(14, 59, 57, 0.6);
      }
      .egv-submit:active {
        transform: translateY(0) scale(0.98);
      }
          .egv-submit:disabled {
        background: #8f6b07;
        color: #faf6ee;
        transform: translateY(-1px);
        box-shadow: 0 10px 15px -10px rgba(14, 59, 57, 0.6);
      }
      .egv-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      .egv-submit-sheen {
        position: absolute;
        top: 0;
        left: -60%;
        width: 40%;
        height: 100%;
        background: linear-gradient(
          120deg,
          transparent,
          rgba(201, 162, 39, 0.35),
          transparent
        );
        transform: skewX(-20deg);
        transition: left 650ms ease;
      }
      .egv-submit:hover .egv-submit-sheen {
        left: 130%;
      }

      .egv-foot {
        margin-top: 1.35rem;
        text-align: center;
        font-size: 0.875rem;
        color: rgba(27, 33, 31, 0.55);
      }
      .egv-foot--sub {
        margin-top: 0.4rem;
        font-size: 0.75rem;
        color: rgba(27, 33, 31, 0.35);
      }
      .egv-link {
        position: relative;
        font-weight: 600;
        text-decoration: none;
      }
      .egv-link::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 1px;
        background: currentColor;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 220ms ease;
      }
      .egv-link:hover::after {
        transform: scaleX(1);
        transform-origin: left;
      }
      .egv-link--strong {
        color: #0e3b39;
      }
      .egv-link--brass {
        color: #a47f14;
        font-weight: 500;
      }

      @keyframes egv-rise {
        from {
          opacity: 0;
          transform: translateY(18px) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes egv-field-rise {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes egv-spin-in {
        from {
          opacity: 0;
          transform: rotate(-90deg) scale(0.8);
        }
        to {
          opacity: 1;
          transform: rotate(270deg) scale(1);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .egv-shell,
        .egv-field-in,
        .egv-seal-ring,
        .egv-submit-sheen {
          animation: none !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}
"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import SealMark from "@/components/Sealmark";
import { Spinner } from "@/components/Loader";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <SealMark size={44} />
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink/55">Log in to manage your deals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none transition focus:border-brass"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none transition focus:border-brass"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-vault py-2.5 text-sm font-semibold text-paper transition hover:bg-vault-light disabled:opacity-60"
          >
            {loading && <Spinner className="h-4 w-4" />}
            Log in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/55">
          New to escrowgo?{" "}
          <Link href="/auth/register" className="font-semibold text-vault hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-ink/35">
          Delivery partner?{" "}
          <Link href="/delivery/register" className="font-medium text-brass-dark hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}

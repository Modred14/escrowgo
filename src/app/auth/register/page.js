"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import SealMark from "@/components/SealMark";
import { Spinner } from "@/components/Loaders";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      const signinRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signinRes?.error) throw new Error(signinRes.error);

      toast.success("Account created. Welcome to escrowgo!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <SealMark size={44} />
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-ink/55">Buy or sell with escrow protection.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6 shadow-card">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
              placeholder="Ada Obi"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
              placeholder="080xxxxxxxx"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
              placeholder="At least 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-vault py-2.5 text-sm font-semibold text-paper transition hover:bg-vault-light disabled:opacity-60"
          >
            {loading && <Spinner className="h-4 w-4" />}
            Create account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/55">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-vault hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-ink/35">
          Want to deliver for escrowgo?{" "}
          <Link href="/delivery/register" className="font-medium text-brass-dark hover:underline">
            Register as a courier
          </Link>
        </p>
      </div>
    </main>
  );
}

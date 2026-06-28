"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import SealMark from "@/components/Sealmark";
import { Spinner } from "@/components/Loader";
import { COVERED_LOCATIONS } from "@/lib/delivery-coverage";

export default function DeliveryRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: COVERED_LOCATIONS[0],
    vehicleType: "Bike",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/delivery/register", {
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

      toast.success("Courier account created.");
      router.push("/delivery/dashboard");
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
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
            Become an EscrowGO courier
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Accept deliveries near you and get paid per drop-off.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6 shadow-card"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              Full name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">
                Base location
              </label>
              <select
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brass"
              >
                {COVERED_LOCATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">
                Vehicle
              </label>
              <select
                value={form.vehicleType}
                onChange={(e) =>
                  setForm({ ...form, vehicleType: e.target.value })
                }
                className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brass"
              >
                <option>Bike</option>
                <option>Car</option>
                <option>Van</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brass"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brass py-2.5 text-sm font-semibold text-ink transition hover:bg-brass-light disabled:opacity-60"
          >
            {loading && <Spinner className="h-4 w-4" />}
            Register as courier
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/55">
          Buying or selling instead?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-vault hover:underline"
          >
            Create a standard account
          </Link>
        </p>
      </div>
    </main>
  );
}

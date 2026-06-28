import { clsx } from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatNaira(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text) {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export function randomToken(length = 24) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export const DEAL_STATUS_LABELS = {
  PENDING_PAYMENT: "Awaiting Payment",
  FUNDS_HELD: "Funds Secured in Escrow",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered — Awaiting Confirmation",
  PAYMENT_RELEASED: "Payment Released",
  REFUNDED: "Refunded to Buyer",
  CANCELLED: "Cancelled",
};

export const DEAL_STATUS_STYLES = {
  PENDING_PAYMENT: "bg-paper-dim text-ink/70 border-ink/10",
  FUNDS_HELD: "bg-brass/15 text-brass-dark border-brass/30",
  OUT_FOR_DELIVERY: "bg-vault/10 text-vault border-vault/30",
  DELIVERED: "bg-vault/10 text-vault border-vault/30",
  PAYMENT_RELEASED: "bg-mint/15 text-mint-dark border-mint/40",
  REFUNDED: "bg-seal/10 text-seal border-seal/30",
  CANCELLED: "bg-ink/5 text-ink/50 border-ink/10",
};

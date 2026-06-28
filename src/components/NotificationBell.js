"use client";

import { useEffect, useRef, useState } from "react";
import { formatDateTime } from "@/lib/utils";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications || []);
    } catch {
      // silent — notifications are non-critical
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((n) => !n.isRead).length;

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications", { method: "PATCH" });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-ink/70 hover:bg-ink/5"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 16v-5a6 6 0 0 0-12 0v5l-1.5 2.5h15L18 16Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-seal px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-ink/10 bg-white shadow-seal">
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <span className="text-sm font-semibold text-ink">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-vault hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink/40">You're all caught up.</p>
            ) : (
              items.map((n) => (
                <div key={n.id} className={`border-b border-ink/5 px-4 py-3 ${!n.isRead ? "bg-brass/5" : ""}`}>
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-xs text-ink/60">{n.message}</p>
                  <p className="mt-1 text-[11px] text-ink/35">{formatDateTime(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
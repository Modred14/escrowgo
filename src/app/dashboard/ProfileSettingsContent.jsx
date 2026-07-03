"use client";
import React, { useState, useRef, useCallback } from "react";
import {
  ImagePlus,
  X,
  Pencil,
  Check,
  User,
  MapPin,
  Mail,
  Phone,
  LogOut,
  ShieldCheck,
  BadgeCheck,
  Camera,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { C } from "./hooks";

function Avatar({ src, name, size = 100 }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";
  return (
    <div
      className="relative overflow-hidden rounded-full ring-4"
      style={{
        width: size,
        height: size,
        ["--tw-ring-color"]: "rgba(198,156,63,0.35)",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Profile photo"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-serif font-semibold"
          style={{
            background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
            color: C.ink,
            fontSize: size * 0.38,
          }}
        >
          {initial}
        </div>
      )}
    </div>
  );
}

function EditableField({
  icon: Icon,
  label,
  value,
  placeholder,
  editable = true,
  locked,
  onSave,
  type = "text",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef(null);

  const startEdit = () => {
    if (!editable) return;
    setDraft(value || "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const commit = () => {
    onSave(draft.trim());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  return (
    <div
      className="group relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300"
      style={{ backgroundColor: "#FBF4E2" }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(198,156,63,0.22)", color: C.goldDeep }}
      >
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className="text-[10.5px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: C.textMuted }}
          >
            {label}
          </p>
          {locked && <BadgeCheck size={12} style={{ color: C.green }} />}
        </div>

        {editing ? (
          <input
            ref={inputRef}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
            className="mt-0.5 w-full border-b bg-transparent text-[14.5px] font-semibold outline-none"
            style={{ color: C.ink, borderColor: C.gold }}
          />
        ) : (
          <p
            className="mt-0.5 truncate text-[14.5px] font-semibold"
            style={{ color: C.ink }}
          >
            {value || (
              <span
                className="font-normal italic"
                style={{ color: C.textMuted }}
              >
                {placeholder}
              </span>
            )}
          </p>
        )}
      </div>

      {editable &&
        (editing ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={commit}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 hover:brightness-95 active:scale-95"
              style={{ backgroundColor: C.gold, color: C.ink }}
            >
              <Check size={13} />
            </button>
            <button
              onClick={cancel}
              className="flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200 hover:bg-white active:scale-95"
              style={{ borderColor: C.line, color: C.textMuted }}
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold opacity-0 transition-all duration-200 group-hover:opacity-100 sm:opacity-100"
            style={{
              borderColor: "rgba(198,156,63,0.5)",
              color: C.goldDeep,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Pencil size={11} /> Edit
          </button>
        ))}
    </div>
  );
}

function LogoutCard() {
  const [confirming, setConfirming] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoggingOut(true);
    signOut({ callbackUrl: "/" });
  };

  return (
    <div>
      <p
        className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: C.textMuted }}
      >
        Log out
      </p>
      <div
        className="flex flex-col gap-4 rounded-xl border p-5 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: "rgba(214,69,69,0.3)",
          backgroundColor: C.redSoft,
        }}
      >
        <div>
          <p className="text-[14px] font-semibold" style={{ color: C.ink }}>
            Sign out of this device
          </p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: C.textMuted }}>
            You'll be signed out of this device. You can sign in again anytime.
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
          style={{
            backgroundColor: C.red,
            boxShadow: "0 10px 22px -10px rgba(214,69,69,0.6)",
          }}
        >
          <LogOut size={14} />
          {loggingOut
            ? "Signing out…"
            : confirming
              ? "Confirm log out"
              : "Log out"}
        </button>
      </div>
      {confirming && !loggingOut && (
        <button
          onClick={() => setConfirming(false)}
          className="mt-2 text-[11.5px] font-medium underline-offset-2 hover:underline"
          style={{ color: C.textMuted }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default function ProfileSettingsContent() {
  const { data: session, status } = useSession();
  const fileInputRef = useRef(null);

  const sessionName = session?.user?.name || "";
  const sessionEmail = session?.user?.email || "";
  const sessionImage = session?.user?.image || null;

  const [photoOverride, setPhotoOverride] = useState(null);
  const [fullName, setFullName] = useState(sessionName);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const nameInitialized = useRef(false);
  if (!nameInitialized.current && sessionName) {
    nameInitialized.current = true;
    if (!fullName) setFullName(sessionName);
  }

  const activePhoto = photoOverride ?? sessionImage;

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoOverride(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const isLoading = status === "loading";

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
          Profile & Settings
        </h1>
        <p className="mt-1.5 text-[14px]" style={{ color: C.textMuted }}>
          Manage how you appear on EscrowGo and control your account access.
        </p>
      </div>

      <div
        className="mt-7 rounded-2xl border p-6 opacity-0 animate-riseIn transition-all duration-300 sm:p-8"
        style={{
          borderColor: "rgba(198,156,63,0.45)",
          boxShadow:
            "0 20px 45px -30px rgba(198,156,63,0.5), 0 1px 2px rgba(22,19,13,0.04)",
          animationDelay: "140ms",
        }}
      >
        {isLoading ? (
          <div className="flex items-center gap-5 justify-center">
            <div className="skeleton h-[100px] w-[100px] rounded-full" />
            <div className="flex flex-col gap-2">
              <div className="skeleton h-9 w-40 rounded-lg" />
              <div className="skeleton h-9 w-28 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-center gap-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <Avatar src={activePhoto} name={fullName} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:brightness-105 active:scale-95"
                style={{
                  backgroundColor: C.gold,
                  color: C.ink,
                  boxShadow: "0 6px 14px -6px rgba(198,156,63,0.7)",
                }}
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${C.goldSoft}, ${C.gold})`,
                  color: C.ink,
                  boxShadow: "0 10px 22px -10px rgba(198,156,63,0.7)",
                }}
              >
                <ImagePlus size={14} /> Upload photo
              </button>
              <button
                onClick={() => setPhotoOverride("")}
                disabled={!activePhoto}
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 hover:bg-[#FBEAEA] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: "rgba(214,69,69,0.4)", color: C.red }}
              >
                <X size={14} /> Remove
              </button>
            </div>
          </div>
        )}

        <div className="mt-7 border-t pt-6" style={{ borderColor: C.line }}>
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: C.textMuted }}
          >
            Profile information
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-[62px] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <EditableField
                icon={User}
                label="Full name"
                value={fullName}
                placeholder="Add your name"
                onSave={setFullName}
              />
              <EditableField
                icon={MapPin}
                label="Location"
                value={location}
                placeholder="Add your location"
                onSave={setLocation}
              />
              <EditableField
                icon={Mail}
                label="E-mail"
                value={sessionEmail}
                placeholder="No e-mail on file"
                editable={false}
                locked={!!sessionEmail}
              />
              <EditableField
                icon={Phone}
                label="Phone number"
                value={phone}
                placeholder="Add your phone number"
                onSave={setPhone}
                type="tel"
              />
            </div>
          )}
        </div>

        <div className="mt-7 border-t pt-6" style={{ borderColor: C.line }}>
          <LogoutCard />
        </div>
      </div>

      <div
        className="mt-4 flex items-center gap-2 opacity-0 animate-riseIn text-[11.5px]"
        style={{ color: C.textMuted, animationDelay: "260ms" }}
      >
        <ShieldCheck size={13} style={{ color: C.gold }} />
        Your information is protected with EscrowGo's secure, encrypted storage.
      </div>
    </div>
  );
}

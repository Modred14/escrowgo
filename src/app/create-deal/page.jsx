"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Info,
  ChevronDown,
  ShieldCheck,
  Truck,
  ArrowRight,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
const GEONAMES_USERNAME = "Modred";

const COUNTRY_CODES = {
  Nigeria: "NG",
  Ghana: "GH",
  Cameroon: "CM",
  Togo: "TG",
  Senegal: "SN",
};

const SUPPORTED_COUNTRIES = Object.entries(COUNTRY_CODES).map(
  ([name, isoCode]) => ({ name, isoCode }),
);

function formatLocation(loc) {
  if (!loc?.city) return "";
  const country = SUPPORTED_COUNTRIES.find(
    (c) => c.isoCode === loc.countryCode,
  )?.name;
  return [loc.city, loc.stateName, country].filter(Boolean).join(", ");
}

function formatNaira(value) {
  const n = Number(value || 0);
  return n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function SectionLabel({ step, children }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-amber-400">
        {step}
      </span>
      <h3 className="text-[13px] font-semibold tracking-wide text-slate-800 uppercase">
        {children}
      </h3>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
  icon: Icon,
  labels,
  disabledOptions,
   disabled,
}) {
  return (
    <div className="relative group">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-500" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 ${
          Icon ? "pl-10" : "pl-4"
        } pr-10 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 ${
          value ? "" : "text-slate-400"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        disabled={disabled}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt}
            value={opt}
            disabled={disabledOptions?.includes(opt)}
            className="text-slate-800"
          >
            {labels ? labels[opt] : opt}
            {disabledOptions?.includes(opt) ? " (unavailable)" : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
function LocationPicker({ label, value, onChange, disabled }) {
  const { countryCode, stateCode, stateName, city } = value;

  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (!countryCode) {
      setStates([]);
      return;
    }
    let cancelled = false;
    setLoadingStates(true);

    fetch(
      `https://secure.geonames.org/searchJSON?country=${countryCode}&featureCode=ADM1&maxRows=100&username=${GEONAMES_USERNAME}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const list = (data.geonames || [])
          .map((g) => ({ name: g.name, adminCode1: g.adminCode1 }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setStates(list);
      })
      .catch(() => !cancelled && setStates([]))
      .finally(() => !cancelled && setLoadingStates(false));

    return () => {
      cancelled = true;
    };
  }, [countryCode]);

 
  useEffect(() => {
    if (!countryCode || !stateCode) {
      setCities([]);
      return;
    }
    let cancelled = false;
    setLoadingCities(true);

    fetch(
      `https://secure.geonames.org/searchJSON?country=${countryCode}&adminCode1=${stateCode}&featureClass=P&maxRows=1000&username=${GEONAMES_USERNAME}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const names = Array.from(
          new Set((data.geonames || []).map((g) => g.name)),
        ).sort((a, b) => a.localeCompare(b));
        setCities(names);
      })
      .catch(() => !cancelled && setCities([]))
      .finally(() => !cancelled && setLoadingCities(false));

    return () => {
      cancelled = true;
    };
  }, [countryCode, stateCode]);

  return (
    <div className="space-y-3">
      <Field label={`${label} — country`}>
        <Select
          value={countryCode}
          onChange={(v) =>
            onChange({ countryCode: v, stateCode: "", stateName: "", city: "" })
          }
          placeholder="Select country"
          options={SUPPORTED_COUNTRIES.map((c) => c.isoCode)}
          labels={Object.fromEntries(
            SUPPORTED_COUNTRIES.map((c) => [c.isoCode, c.name]),
          )}
          icon={MapPin}
           disabled={disabled}
        />
      </Field>

      {countryCode && (
        <Field label={`${label} — state`}>
          <Select
            value={stateCode}
            onChange={(v) => {
              const chosen = states.find((s) => s.adminCode1 === v);
              onChange({
                countryCode,
                stateCode: v,
                stateName: chosen?.name || "",
                city: "",
              });
            }}
             disabled={disabled}
            placeholder={loadingStates ? "Loading states…" : "Select state"}
            options={states.map((s) => s.adminCode1)}
            labels={Object.fromEntries(
              states.map((s) => [s.adminCode1, s.name]),
            )}
            icon={MapPin}
          />
        </Field>
      )}

      {countryCode && stateCode && (
        <Field label={`${label} — city/town`}>
          <Select
            value={city}
            onChange={(v) =>
              onChange({ countryCode, stateCode, stateName, city: v })
            }
            placeholder={
              loadingCities ? "Loading cities…" : "Select city or town"
            }
            options={cities}
            icon={MapPin}
            disabled={disabled}
          />
        </Field>
      )}
    </div>
  );
}

export default function CreateOrderPage() {
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [buyerLocation, setBuyerLocation] = useState({
    countryCode: "",
    stateCode: "",
    stateName: "",
    city: "",
  });
  const [sellerLocation, setSellerLocation] = useState({
    countryCode: "",
    stateCode: "",
    stateName: "",
    city: "",
  });
  const [deliveryOption, setDeliveryOption] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);
  const [agentAvailability, setAgentAvailability] = useState({
    checked: false,
    loading: false,
    eligible: false,
    count: 0,
  });
  const addFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList).slice(0, 3 - images.length);
      const next = files
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => ({ url: URL.createObjectURL(f), name: f.name, file: f }));
      if (next.length) setImages((prev) => [...prev, ...next].slice(0, 3));
    },
    [images.length],
  );
  const dateInputRef = useRef(null);

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      try {
        dateInputRef.current.showPicker();
      } catch (err) {
        dateInputRef.current.focus();
      }
    } else {
      dateInputRef.current?.focus();
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };
  useEffect(() => {
    const buyerCity = buyerLocation.city;
    const sellerCity = sellerLocation.city;

    if (!buyerCity || !sellerCity) {
      setAgentAvailability({
        checked: false,
        loading: false,
        eligible: false,
        count: 0,
      });
      return;
    }

    let cancelled = false;
    setAgentAvailability((prev) => ({ ...prev, loading: true }));

    const params = new URLSearchParams({ buyerCity, sellerCity });
    fetch(`/api/delivery-agents/availability?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const eligible = Boolean(data.eligibleForEscrowGo);
        setAgentAvailability({
          checked: true,
          loading: false,
          eligible,
          count: data.agentCount || 0,
        });
        if (!eligible) {
          setDeliveryOption((current) =>
            current === "ESCROWGO" ? "SELF" : current,
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAgentAvailability({
            checked: true,
            loading: false,
            eligible: false,
            count: 0,
          });
          setDeliveryOption((current) =>
            current === "ESCROWGO" ? "SELF" : current,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [buyerLocation.city, sellerLocation.city]);
const computedExpectedDeliveryDate = (() => {
    if (!expectedDeliveryDate) return null;
    const [year, month, day] = expectedDeliveryDate
      .split("-")
      .map(Number);
    const base = new Date(year, month - 1, day); 
    if (deliveryOption === "ESCROWGO") {
      base.setDate(base.getDate() + 10);
    }
    return base;
  })();
  const sameCountry =
    buyerLocation.countryCode &&
    sellerLocation.countryCode &&
    buyerLocation.countryCode === sellerLocation.countryCode;

  const sameState =
    sameCountry &&
    buyerLocation.stateCode &&
    sellerLocation.stateCode &&
    buyerLocation.stateCode === sellerLocation.stateCode;

  const deliveryFee =
    deliveryOption === "ESCROWGO" && buyerLocation.city && sellerLocation.city
      ? sameState
        ? 2500
        : sameCountry
          ? 5000
          : 20000
      : 0;

  const numericPrice = Number(price) || 0;
  const total = numericPrice + deliveryFee;
const router = useRouter();
  const canSubmit =
    productName.trim() &&
    numericPrice > 0 &&
    buyerLocation.city &&
    sellerLocation.city &&
    deliveryOption &&
    expectedDeliveryDate;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const fd = new FormData();
      fd.append("productName", productName);
      fd.append("price", String(numericPrice));
      fd.append("deliveryOption", deliveryOption);
      fd.append("buyerLocation", JSON.stringify(buyerLocation));
      fd.append("sellerLocation", JSON.stringify(sellerLocation));
      fd.append("expectedDeliveryDate", expectedDeliveryDate);
      images.forEach((img) => {
        if (img.file) fd.append("images", img.file);
      });

      const res = await fetch("/api/create-deal", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Something went wrong. Please try again.",
        );
      }

      router.push(`/orders/${data.dealSlug}`);
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setSubmitError("");
    setImages([]);
    setProductName("");
    setPrice("");
    setBuyerLocation({
      countryCode: "",
      stateCode: "",
      stateName: "",
      city: "",
    });
    setSellerLocation({
      countryCode: "",
      stateCode: "",
      stateName: "",
      city: "",
    });
    setDeliveryOption("");
    setExpectedDeliveryDate("");
  };

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
          .draw-circle {
  stroke-dasharray: 226;
  stroke-dashoffset: 226;
  animation: drawCircle 0.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
.draw-check {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: drawCheck 0.4s ease-out forwards;
  animation-delay: 0.5s;
}
@keyframes drawCircle {
  to { stroke-dashoffset: 0; }
}
@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}
.check-pop {
  animation: checkPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}
@keyframes checkPop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}
.sparkle {
  animation: sparkleTwinkle 1.8s ease-in-out infinite;
}
@keyframes sparkleTwinkle {
  0%, 100% { opacity: 0; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1.2); }
}
        .reveal {
          opacity: 0;
          animation: fadeSlideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .pop-in { animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-120%);
        }
        .btn-shimmer:hover::after { animation: shimmer 1.1s ease; }

        .ticket-notch {
          background-image: radial-gradient(circle 7px at 0 50%, transparent 7px, white 7.5px),
                             radial-gradient(circle 7px at 100% 50%, transparent 7px, white 7.5px);
          background-position: left center, right center;
          background-repeat: no-repeat;
        }
        .perforation {
          background-image: repeating-linear-gradient(to right, #cbd5e1 0, #cbd5e1 6px, transparent 6px, transparent 13px);
          height: 1px;
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .pop-in { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <div>
          <div
            className="reveal mb-8 text-center sm:mb-10"
            style={{ animationDelay: "0ms" }}
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure transaction
            </span>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Create your order
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 sm:text-base">
              Set up a secure escrow order by entering your transaction details
              below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* FORM COLUMN */}
            <div className="space-y-6 lg:col-span-2">
              {/* Courier fee banner */}
              <div
                className="reveal flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                style={{ animationDelay: "60ms" }}
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600">
                  <Info className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Courier fee
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-emerald-800/80">
                    If the seller opts to use EscrowGo's courier service, an
                    additional delivery fee will apply. Shipping charges are
                    calculated automatically based on pickup and delivery
                    locations, so pricing stays transparent before the
                    transaction is finalized.
                  </p>
                </div>
              </div>

              {/* Product picture upload */}
              <div
                className="reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                style={{ animationDelay: "120ms" }}
              >
                <SectionLabel step="01">Product picture</SectionLabel>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!submitting) setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  if (!submitting) addFiles(e.dataTransfer.files);
                  }}
                  onClick={() => !submitting &&  images.length < 3 && inputRef.current?.click()}
                  className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
                    dragActive
                      ? "scale-[1.01] border-amber-400 bg-amber-50"
                      : "border-amber-300/70 bg-amber-50/40 hover:border-amber-400 hover:bg-amber-50"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={submitting}
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-transform duration-300 ${
                      dragActive ? "scale-110 -translate-y-1" : ""
                    }`}
                  >
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-amber-700">
                    Click or drag to upload images of product
                  </p>
                  <p className="mt-1 text-xs text-amber-600/70">
                    PNG, JPG — less than 15MB
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.url}
                        className="pop-in group relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {Array.from({ length: 3 - images.length }).map((_, i) => (
                      <div
                        key={i}
                        className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-300"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-800">
                  <Info className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  Upload up to 3 high-quality images to showcase your product
                </div>
              </div>

              {/* Product information */}
              <div
                className="reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                style={{ animationDelay: "180ms" }}
              >
                <SectionLabel step="02">Product information</SectionLabel>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Product name">
                    <input
                      type="text"
                      value={productName}
                       disabled={submitting}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Enter your product name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    />
                  </Field>
                  <Field label="Price">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                        ₦
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        disabled={submitting}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Enter the price"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Delivery information */}
              <div
                className="reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                style={{ animationDelay: "240ms" }}
              >
                <SectionLabel step="03">Delivery information</SectionLabel>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <LocationPicker
                    label="Seller location"
                    value={sellerLocation}
                     disabled={submitting}
                    onChange={setSellerLocation}
                  />{" "}
                  <LocationPicker
                    label="Buyer location"
                    value={buyerLocation}
                    onChange={setBuyerLocation}
                     disabled={submitting}
                  />
                </div>
              </div>

              {/* Delivery system */}
              <div
                className="reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                style={{ animationDelay: "300ms" }}
              >
                <SectionLabel step="04">Delivery</SectionLabel>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Delivery system">
                    <Select
                      value={deliveryOption}
                      onChange={setDeliveryOption}
                      placeholder="Choose the delivery system"
                      options={["ESCROWGO", "SELF"]}
                      disabledOptions={
                        agentAvailability.eligible ? [] : ["ESCROWGO"]
                      }
                      icon={Truck}
                       disabled={submitting}
                    />
                  </Field>
                  <Field label="Expected delivery date">
                    <div onClick={() => !submitting && openDatePicker()} className={submitting ? "cursor-not-allowed" : "cursor-pointer"}>
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={expectedDeliveryDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setExpectedDeliveryDate(e.target.value)
                        }
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        disabled={submitting}
                      />
                    </div>
                  </Field>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-amber-800">
                  <Info className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    <strong>Note:</strong> If the order isn't collected after
                    the delivery date, the money will be refunded. If you use
                    EscrowGo delivery, we need up to 3 days to find a courier.
                    If none is available, the buyer will be asked to arrange
                    delivery. If a courier is found, delivery may take up to 7
                    more days, so 10 extra days is added to the delivery date.
                  </span>
                </div>

                {agentAvailability.loading && (
                  <p className="pop-in mt-3 text-[13px] text-slate-400">
                    Checking courier availability near you…
                  </p>
                )}

                {!agentAvailability.loading && agentAvailability.checked && (
                  <p
                    className={`pop-in mt-3 flex items-center gap-1.5 text-[13px] ${
                      agentAvailability.eligible
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {agentAvailability.eligible ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {agentAvailability.count} EscrowGo couriers are
                        available on this route — courier delivery unlocked.
                      </>
                    ) : (
                      <>
                        {!deliveryOption && (
                          <>
                            <Info className="h-3.5 w-3.5" />
                            Only {agentAvailability.count} courier
                            {agentAvailability.count === 1 ? "" : "s"} available
                            on this route (3+ needed). You'll need to arrange
                            delivery yourselves for now.
                          </>
                        )}
                      </>
                    )}
                  </p>
                )}
                {deliveryOption && (
                  <p className="pop-in mt-3 text-[13px] text-slate-500">
                    {deliveryOption === "ESCROWGO"
                      ? "EscrowGo will handle pickup and delivery. The fee is calculated automatically below."
                      : "The buyer and seller will coordinate delivery directly. No courier fee applies."}
                  </p>
                )}
              </div>
            </div>

            {/* TICKET / SUMMARY COLUMN */}
            <div className="lg:col-span-1">
              <div
                className="reveal lg:sticky lg:top-8"
                style={{ animationDelay: "150ms" }}
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                  <div className="bg-slate-900 px-5 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                      Escrow ticket
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      Order summary
                    </p>
                  </div>

                  <div className="space-y-3 px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] text-slate-500">
                        Product
                      </span>
                      <span className="max-w-[60%] text-right text-sm font-medium text-slate-800">
                        {productName || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-slate-500">Price</span>
                      <span className="text-sm font-medium text-slate-800">
                        ₦{formatNaira(numericPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-slate-500">
                        Delivery fee
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        {deliveryOption ? `₦${formatNaira(deliveryFee)}` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] text-slate-500">
                      <span>Route</span>
                      <span className="text-right text-slate-600">
                        {formatLocation(sellerLocation) || "Seller"} →{" "}
                        {formatLocation(buyerLocation) || "Buyer"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] text-slate-500">
                      <span>Expected delivery</span>
                      <span className="text-right text-slate-600">
                        {computedExpectedDeliveryDate
                          ? computedExpectedDeliveryDate.toLocaleDateString(
                              "en-NG",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="perforation ticket-notch mx-0" />

                  <div className="px-5 py-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        Held in escrow
                      </span>
                      <span className="text-xl font-semibold text-slate-900 transition-all duration-300">
                        ₦{formatNaira(total)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5">
                      <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <p className="text-[12px] leading-snug text-emerald-800">
                        Funds stay protected until the buyer confirms delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div
            className="reveal mt-8 flex justify-center"
            style={{ animationDelay: "360ms" }}
          >
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className={`btn-shimmer relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-8 py-3.5 text-sm font-semibold shadow-lg shadow-amber-500/20 transition-all duration-300 sm:w-auto sm:min-w-[280px] ${
                canSubmit
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30 active:translate-y-0"
                  : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
              }`}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Generating link...
                </>
              ) : (
                <>
                  Generate payment link
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <p
            className="reveal mt-4 text-center text-[12px] text-slate-400"
            style={{ animationDelay: "420ms" }}
          >
            By generating a payment link, you agree that funds will be held in
            escrow until delivery is confirmed.
          </p>
          {submitError && (
            <p className="pop-in mt-3 text-center text-[12px] font-medium text-red-500">
              {submitError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

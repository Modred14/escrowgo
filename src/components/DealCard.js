import Link from "next/link";
import StatusBadge from "@/components/Statusbadge";
import { formatNaira, formatDate } from "@/lib/utils";

export default function DealCard({ deal, viewerRole }) {
  const image = deal.product?.images?.[0];

  return (
    <Link
      href={`/deal/${deal.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="relative h-36 w-full bg-paper-dim">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={deal.product?.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="m3 16 5-5 4 4 5-6 4 5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={deal.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-display text-base font-semibold text-ink">
          {deal.product?.name}
        </h3>
        <p className="font-mono text-lg font-semibold text-vault">
          {formatNaira(deal.product?.price)}
        </p>
        <div className="mt-1 flex items-center justify-between text-xs text-ink/45">
          <span>
            {viewerRole === "seller"
              ? `Buyer: ${deal.buyer?.name || "Not yet"}`
              : `Seller: ${deal.seller?.name}`}
          </span>
          <span>{formatDate(deal.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

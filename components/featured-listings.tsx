"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { type ApiListing, formatPrice, listingsApi } from "@/lib/api";
import { getListingThumbnailUrl } from "@/lib/listing-visuals";

function StarRating({ rating, count }: Readonly<{ rating: number; count: number }>) {
  return (
    <div className="flex items-center gap-1">
      <span className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`h-3 w-3 ${i < Math.round(rating) ? "text-amber-400" : "text-[#dde0ea]"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </span>
      <span className="text-[11px] text-[#7a8099]">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

function SellerAvatar({ name, avatarUrl }: Readonly<{ name: string; avatarUrl?: string }>) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-5 w-5 shrink-0 rounded-full border border-[#e8eaf2] object-cover"
      />
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef0f8] text-[9px] font-bold text-[#5c6178]">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-[#eceffa] bg-white">
      <div className="aspect-[16/9] bg-[#eef0f8]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-[#eef0f8]" />
        <div className="h-4 w-4/5 rounded bg-[#eef0f8]" />
        <div className="h-3 w-full rounded bg-[#f5f6fa]" />
        <div className="h-3 w-2/3 rounded bg-[#f5f6fa]" />
        <div className="mt-4 flex items-center justify-between">
          <div className="h-3 w-1/4 rounded bg-[#eef0f8]" />
          <div className="h-7 w-16 rounded-lg bg-[#eef0f8]" />
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ listing }: Readonly<{ listing: ApiListing }>) {
  const thumb = getListingThumbnailUrl(listing);
  const sellerName = listing.sellerId?.name?.trim() || "Unknown";
  const pill = listing.categoryLabel ?? listing.category ?? null;
  const desc = listing.shortDescription?.trim() || listing.description?.slice(0, 120);

  return (
    <article className="group/card relative flex flex-col overflow-hidden rounded-xl border border-[#eceefa] bg-white transition-all duration-200 hover:shadow-[0_12px_40px_rgba(23,35,73,0.10)] hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-[#f4f6fb] via-[#eef1f8] to-[#e4e9f2]">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-10 w-10 text-[#c8cfe0]" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Badges overlay */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          {pill ? (
            <span className="rounded-md border border-white/20 bg-black/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {pill}
            </span>
          ) : <span />}
          {listing.verified ? (
            <span className="flex items-center gap-1 rounded-md border border-emerald-200/60 bg-emerald-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-[#0f1222]">
          {listing.title}
        </h3>
        {desc ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#6b728e]">
            {desc}
          </p>
        ) : null}

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {listing.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded border border-[#eceefa] bg-[#f8f9fc] px-1.5 py-0.5 text-[9px] font-medium text-[#7a80a0]">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-3">
          {/* Rating */}
          {listing.averageRating != null && listing.reviewCount != null && listing.reviewCount > 0 ? (
            <div className="mb-2.5">
              <StarRating rating={listing.averageRating} count={listing.reviewCount} />
            </div>
          ) : null}

          {/* Seller + price row */}
          <div className="flex items-center justify-between border-t border-[#f0f2f8] pt-2.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <SellerAvatar name={sellerName} avatarUrl={listing.sellerId?.avatarUrl} />
              <span className="min-w-0 truncate text-[11px] font-medium text-[#4a5068]">
                {sellerName}
              </span>
              {listing.purchaseCount != null && listing.purchaseCount > 0 ? (
                <span className="shrink-0 text-[10px] text-[#a0a7be]">
                  · {listing.purchaseCount} sold
                </span>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-bold tabular-nums text-[#0f1222]">
                {formatPrice(listing.price)}
              </span>
              <Link
                href={`/skills/${listing._id}#skill-purchase-btn`}
                className="relative z-[2] rounded-lg bg-[#2563eb] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                onClick={(e) => e.stopPropagation()}
              >
                Buy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full-card link underneath */}
      <Link
        href={`/skills/${listing._id}`}
        className="absolute inset-0 z-[1] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 focus-visible:ring-inset"
        aria-label={`View ${listing.title}`}
      />
    </article>
  );
}

const FALLBACK_LISTINGS: ApiListing[] = [
  {
    _id: "f1", listingHashId: "f1", title: "Semantic Syntax Refiner",
    description: "High-fidelity intent extraction from nested JSON structures.",
    shortDescription: "High-fidelity intent extraction from nested JSON structures.",
    price: 1900, pricingModel: "one-time", llmCompatibility: ["gpt-4"],
    tags: ["NLP", "JSON", "Extraction"], verified: true, status: "active",
    averageRating: 4.8, reviewCount: 24, purchaseCount: 130,
    sellerId: { _id: "s1", name: "Alex Chen" }, createdAt: "", updatedAt: "",
  },
  {
    _id: "f2", listingHashId: "f2", title: "Prompt Injection Shield",
    description: "Continuously learns defensive prompt patterns.",
    shortDescription: "Continuously learns defensive prompt patterns.",
    price: 2900, pricingModel: "one-time", llmCompatibility: ["claude", "gpt-4"],
    tags: ["Security", "Prompt", "Defense"], verified: true, status: "active",
    averageRating: 4.9, reviewCount: 41, purchaseCount: 280,
    sellerId: { _id: "s2", name: "Priya Sharma" }, createdAt: "", updatedAt: "",
  },
  {
    _id: "f3", listingHashId: "f3", title: "Edge VotingBundle",
    description: "Pre-trained routers for real-time object classification.",
    shortDescription: "Pre-trained routers for real-time object classification.",
    price: 4900, pricingModel: "one-time", llmCompatibility: ["gpt-4o"],
    tags: ["Classification", "Router", "Edge"], verified: false, status: "active",
    averageRating: 4.5, reviewCount: 12, purchaseCount: 67,
    sellerId: { _id: "s3", name: "Marcus Reid" }, createdAt: "", updatedAt: "",
  },
];

export function FeaturedListings() {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi
      .featured(6)
      .then(({ listings: l }) => {
        if (l.length > 0) return l;
        return listingsApi.list({ limit: 6 }).then(({ listings: ll }) => ll);
      })
      .then((l) => setListings(l.length > 0 ? l : FALLBACK_LISTINGS))
      .catch(() => setListings(FALLBACK_LISTINGS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
          <SkeletonCard key={k} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <FeaturedCard key={listing._id} listing={listing} />
      ))}
    </div>
  );
}

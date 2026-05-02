"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { type ApiListing, formatPrice, listingsApi } from "@/lib/api";

function SkeletonCard() {
  return (
    <div className="h-52 animate-pulse border border-[#eceffa] bg-[#f8f9fc]" />
  );
}

const FALLBACK_CARDS = [
  {
    id: "1",
    title: "Semantic Syntax Refiner",
    desc: "High-fidelity intent extraction from nested JSON structures.",
  },
  {
    id: "2",
    title: "Edge VotingBundle",
    desc: "Pre-trained routers for real-time object classification.",
  },
  {
    id: "3",
    title: "Prompt Injection Shield",
    desc: "Continuously learns defensive prompt patterns.",
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
      .then((l) => setListings(l))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
          <SkeletonCard key={k} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {FALLBACK_CARDS.map((s) => (
          <article
            key={s.id}
            className="border border-[#eceffa] p-5 transition-shadow hover:shadow-[0_12px_35px_rgba(23,35,73,0.08)]"
          >
            <div className="mb-7 flex items-center justify-between">
              <span className="text-[11px] tracking-[0.18em] text-[#9ba1b8]">
                PUBLIC
              </span>
              <span className="border border-[#cde0ff] bg-[#f4f8ff] px-2 py-1 text-[9px] font-semibold tracking-[0.18em] text-[#4b7be6]">
                VERIFIED
              </span>
            </div>
            <h3 className="text-xl font-medium tracking-tight">{s.title}</h3>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#68708a]">
              {s.desc}
            </p>
            <Link
              href="/explore"
              className="mt-5 block w-full border border-black bg-black py-2.5 text-center text-xs font-semibold tracking-[0.2em] text-white"
            >
              VIEW IN MARKETPLACE
            </Link>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
          <article
            key={listing._id}
            className="border border-[#eceffa] p-5 transition-shadow hover:shadow-[0_12px_35px_rgba(23,35,73,0.08)]"
          >
            <div className="mb-7 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-[0.14em] text-[#9ba1b8]">
                #{listing.listingHashId}
              </span>
              {listing.verified && (
                <span className="border border-[#cde0ff] bg-[#f4f8ff] px-2 py-1 text-[9px] font-semibold tracking-[0.18em] text-[#4b7be6]">
                  VERIFIED
                </span>
              )}
            </div>
            <h3 className="text-xl font-medium tracking-tight">
              {listing.title}
            </h3>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#68708a]">
              {listing.shortDescription}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-[#eef1f8] pt-4 text-[11px] tracking-[0.14em] text-[#99a0b7]">
              <span>
                {listing.reviewCount == null
                  ? "—"
                  : `${listing.reviewCount} reviews`}
              </span>
              <span className="font-semibold text-[#0f1222]">
                {formatPrice(listing.price)}
              </span>
            </div>
            <Link
              href={`/skills/${listing._id}`}
              className="mt-5 block w-full border border-black bg-black py-2.5 text-center text-xs font-semibold tracking-[0.2em] text-white"
            >
              VIEW IN MARKETPLACE
            </Link>
          </article>
        ))}
      </div>
    );
}

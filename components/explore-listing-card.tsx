"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

import { type ApiListing, formatPrice } from "@/lib/api";
import { getFirstDemoVideo, getListingThumbnailUrl } from "@/lib/listing-visuals";

export type ExploreListingCardProps = Readonly<{
  listing: ApiListing;
  view: "grid" | "list";
  /** Resolved human label for `listing.category` slug (from backend category list). */
  categoryLabel?: string;
}>;

function SellerAvatarSm({
  name,
  avatarUrl,
}: Readonly<{ name: string; avatarUrl?: string }>) {
  const dim = "h-7 w-7 shrink-0 text-[10px]";
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${dim} rounded-full border border-[#e8eaf2] object-cover`}
      />
    );
  }
  return (
    <span
      className={`${dim} flex items-center justify-center rounded-full border border-[#e8eaf2] bg-[#eef0f8] font-semibold text-[#5c6178]`}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function listingOneLiner(listing: ApiListing): string {
  const short = listing.shortDescription?.trim();
  if (short) return short;
  const desc = listing.description?.replaceAll(/\s+/g, " ").trim();
  if (!desc) return "";
  const line = desc.split(/[.!?]\s/)[0] ?? desc;
  return line.length > 140 ? `${line.slice(0, 137)}…` : line;
}

function MediaPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-[radial-gradient(ellipse_at_50%_0%,#f0f4fc_0%,#e4e9f4_55%,#dce2ee_100%)] px-4 py-8 text-center sm:py-10">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d1d9e8] bg-white/90 text-[#8b93a8] shadow-sm"
        aria-hidden
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </span>
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b728e]">
          No preview yet
        </p>
        <p className="max-w-[11rem] text-[11px] leading-relaxed text-[#94a0b8]">
          Demo image or video will appear here when the seller adds one.
        </p>
      </div>
    </div>
  );
}

function CardMedia({
  listing,
  layout = "grid",
}: Readonly<{ listing: ApiListing; layout?: "grid" | "list" }>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = getFirstDemoVideo(listing);
  const thumb = getListingThumbnailUrl(listing);
  const isList = layout === "list";

  const play = useCallback(() => {
    const el = videoRef.current;
    if (!el || !video) return;
    void el.play().catch(() => {
      /* autoplay policies */
    });
  }, [video]);

  const reset = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  const frameClass =
    "relative isolate w-full overflow-hidden ring-1 ring-inset ring-black/[0.04] " +
    (isList
      ? "aspect-[16/10] min-h-[10.5rem] sm:aspect-auto sm:h-full sm:min-h-[11rem]"
      : "aspect-[16/10] min-h-[7rem]");

  return (
    <div
      className={`${frameClass} bg-gradient-to-br from-[#f4f6fb] via-[#eef1f8] to-[#e4e9f2]`}
      onMouseEnter={play}
      onMouseLeave={reset}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            video ? "opacity-100 group-hover/card:opacity-0" : "opacity-100"
          }`}
        />
      ) : null}
      {video ? (
        <video
          ref={videoRef}
          src={video.url}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
          muted
          playsInline
          loop
          preload="metadata"
        >
          <track kind="captions" srcLang="en" label="English" />
        </video>
      ) : null}
      {!thumb && !video ? <MediaPlaceholder /> : null}
      {video ? (
        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm transition-opacity duration-200 group-hover/card:opacity-0">
          Hover to preview
        </span>
      ) : null}
    </div>
  );
}

export function ExploreListingCard({ listing, view, categoryLabel }: ExploreListingCardProps) {
  const sellerName = listing.sellerId?.name?.trim() || "Unknown";
  const handle = `@${sellerName.toLowerCase().replaceAll(/\s+/g, "_")}`;
  const purchases = listing.purchaseCount;
  const pill =
    categoryLabel ?? listing.categoryLabel ?? listing.category ?? undefined;
  const oneLiner = listingOneLiner(listing);

  const metaBlock = (
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {listing.verified ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              Verified
            </span>
          ) : null}
          {pill ? (
            <span className="max-w-full truncate rounded border border-[#e8eaf2] bg-[#f8f9fc] px-2 py-0.5 text-[10px] font-medium capitalize text-[#5c6178]">
              {pill}
            </span>
          ) : null}
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-[#0f1222]">{listing.title}</h2>
        {oneLiner ? (
          <p className="line-clamp-1 text-sm leading-snug text-[#5c6178]" title={oneLiner}>
            {oneLiner}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[#f0f2f8] pt-3">
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <SellerAvatarSm
              name={sellerName}
              avatarUrl={listing.sellerId?.avatarUrl}
            />
            <span className="min-w-0 truncate font-medium text-[#0f1222]" title={handle}>
              {handle}
            </span>
            {purchases != null && purchases > 0 ? (
              <span className="shrink-0 text-xs text-[#9aa0b5]">
                · {purchases.toLocaleString()} installs
              </span>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 text-lg font-semibold tabular-nums text-[#0f1222]">
          {formatPrice(listing.price)}
        </span>
      </div>
    </div>
  );

  if (view === "list") {
    return (
      <Link
        href={`/skills/${listing._id}`}
        className="group/card block w-full overflow-hidden rounded-lg border border-[#eceefa] bg-white outline-none transition-shadow hover:shadow-[0_12px_35px_rgba(23,35,73,0.08)] focus-visible:ring-2 focus-visible:ring-[#2563eb]/40"
      >
        <article className="flex flex-col sm:flex-row sm:items-stretch">
          <div className="shrink-0 border-b border-[#f0f2f8] sm:w-[13.5rem] sm:border-r sm:border-b-0 sm:bg-[#fafbfd]">
            <CardMedia listing={listing} layout="list" />
          </div>
          {metaBlock}
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={`/skills/${listing._id}`}
      className="group/card flex h-full flex-col overflow-hidden rounded-lg border border-[#eceefa] bg-white outline-none transition-shadow hover:shadow-[0_12px_35px_rgba(23,35,73,0.08)] focus-visible:ring-2 focus-visible:ring-[#2563eb]/40"
    >
      <article className="flex h-full flex-col">
        <CardMedia listing={listing} layout="grid" />
        {metaBlock}
      </article>
    </Link>
  );
}

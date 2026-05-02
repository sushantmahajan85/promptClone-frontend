"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { NavAuth } from "@/components/nav-auth";
import { type ApiListing, formatBytes, formatPrice } from "@/lib/api";

type TabId = "skills.md" | "handler.js" | "config.json";

const TABS: TabId[] = ["skills.md", "handler.js", "config.json"];

function SellerAvatar({
  name,
  avatarUrl,
}: Readonly<{ name: string; avatarUrl?: string }>) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-10 w-10 shrink-0 rounded border border-[#e8eaf2] object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#e8eaf2] text-sm font-semibold text-[#0f1222]">
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export function SkillDetailView({
  listing,
}: Readonly<{ listing: ApiListing }>) {
  const [activeTab, setActiveTab] = useState<TabId>("skills.md");

  const manifestFiles = listing.packageManifest?.files ?? [];
  const fileTree =
    manifestFiles.length > 0
      ? manifestFiles.map((f) => f.path)
      : ["skills.md", "handler.js", "config.json"];

  const configJson = JSON.stringify(
    {
      name: listing.title,
      listingHashId: listing.listingHashId,
      pricingModel: listing.pricingModel,
      price: listing.price,
      tags: listing.tags,
      llmCompatibility: listing.llmCompatibility,
      status: listing.status,
    },
    null,
    2,
  );

  const handlerJs = `import { defineHandler } from "@skillkart/runtime";

export default defineHandler({
  name: "${listing.title}",
  async run(ctx) {
    const out = await ctx.model.complete(ctx.input);
    return { ok: true, output: out };
  },
});`;

  const tabBody: Record<TabId, ReactNode> = {
    "skills.md": (
      <div className="space-y-4 text-sm leading-7 text-[#3d4459]">
        {listing.description ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7">
            {listing.description}
          </pre>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-[#0f1222]">
              # Skill Documentation
            </h2>
            <p>
              This skill exposes a stable{" "}
              <code className="font-mono text-xs">SkillKart.Skill</code> contract
              for <strong>{listing.title}</strong>.
            </p>
            <div className="rounded-lg border border-[#d6e4ff] bg-[#f0f6ff] p-4 font-mono text-xs leading-6 text-[#1e3a5f]">
              <pre className="whitespace-pre-wrap">
                {`const skill = new SkillKart.Skill({
  id: "${listing.listingHashId}",
  runtime: "edge-v2",
});
await skill.warm();
export default skill.pipeline;`}
              </pre>
            </div>
          </>
        )}
      </div>
    ),
    "handler.js": (
      <div className="font-mono text-xs leading-6 text-[#1e3a5f]">
        <pre className="whitespace-pre-wrap">{handlerJs}</pre>
      </div>
    ),
    "config.json": (
      <div className="font-mono text-xs leading-6 text-[#1e3a5f]">
        <pre className="whitespace-pre-wrap">{configJson}</pre>
      </div>
    ),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-28 text-[#0f1222]">
      <header className="sticky top-0 z-20 border-b border-[#eceef5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:gap-x-4 md:px-6 lg:flex-nowrap">
          <div className="flex items-center justify-between gap-3">
            <BrandLogo className="shrink-0" />
            <div className="flex shrink-0 items-center gap-3 md:hidden">
              <NavAuth />
            </div>
          </div>
          <nav className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eef0f8] pt-3 text-sm text-[#5c6178] md:flex-1 md:justify-center md:border-0 md:pt-0 md:gap-7">
            <Link
              href="/explore"
              className="border-b-2 border-[#2563eb] pb-0.5 font-medium text-[#0f1222]"
            >
              Explore
            </Link>
            <Link href="/sell" className="hover:text-[#0f1222]">
              Sell
            </Link>
            <button type="button" className="bg-transparent p-0 hover:text-[#0f1222]">
              Docs
            </button>
            <button type="button" className="bg-transparent p-0 hover:text-[#0f1222]">
              Market
            </button>
          </nav>
          <div className="relative min-w-0 w-full md:max-w-md lg:min-w-[240px] lg:flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#8b90a3]">
              &gt;_
            </span>
            <input
              type="search"
              placeholder="Search skills..."
              className="h-9 w-full rounded-lg border border-[#e8eaf2] bg-[#f5f6fa] py-2 pl-10 pr-3 text-sm outline-none placeholder:text-[#9aa0b5]"
            />
          </div>
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <NavAuth />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-6">
        {/* Breadcrumb */}
        <nav
          className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-[#9aa0b5] sm:tracking-[0.14em]"
          aria-label="Breadcrumb"
        >
          <Link
            href="/explore"
            className="text-[#5c6178] transition-colors hover:text-[#0f1222]"
          >
            Explore
          </Link>
          <span className="text-[#c5c9d6]" aria-hidden>
            &gt;
          </span>
          <span aria-current="page" className="break-all text-[#9aa0b5]">
            {listing.listingHashId}
          </span>
        </nav>

        {/* Hero */}
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#5c6178]">
              {listing.description || listing.shortDescription}
            </p>
          </div>
          <div className="w-full shrink-0 border border-[#eceef5] bg-[#fafbff] p-5 sm:p-6 lg:min-w-[240px] lg:w-auto">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9aa0b5]">
              DOWNLOAD
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatPrice(listing.price)}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5c6178]">
              One-time purchase. Download the skill folder and drop it into your
              agent or workflow.
            </p>
            <button
              type="button"
              aria-label="Download skill"
              className="mt-6 flex w-full items-center justify-center gap-2 border border-black bg-black py-3 text-xs font-semibold tracking-[0.15em] text-white"
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download skill
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="mt-12 flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            {listing.llmCompatibility.length > 0 && (
              <div className="border border-[#eceef5] p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ SUPPORTED AGENTS ]
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#5c6178]">
                  This skill is validated for use with the following agent
                  platforms.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {listing.llmCompatibility.map((agent) => (
                    <li key={agent}>
                      <span className="inline-block border border-[#d6e4ff] bg-[#f4f8ff] px-2.5 py-1 font-mono text-[11px] font-medium text-[#1d4ed8]">
                        {agent}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border border-[#eceef5] p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ ORIGIN ]
              </p>
              <div className="mt-4 flex items-center gap-3">
                <SellerAvatar
                  name={listing.sellerId.name}
                  avatarUrl={listing.sellerId.avatarUrl}
                />
                <div>
                  <p className="text-sm font-medium">{listing.sellerId.name}</p>
                  <p className="font-mono text-xs text-[#8b90a3]">
                    @{listing.sellerId.name.toLowerCase().replaceAll(/\s+/g, "_")}
                  </p>
                </div>
              </div>
              {listing.sellerId.bio && (
                <p className="mt-3 text-xs leading-relaxed text-[#5c6178]">
                  {listing.sellerId.bio}
                </p>
              )}
            </div>

            {listing.tags.length > 0 && (
              <div className="border border-[#eceef5] p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ TAGS ]
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-[#e8eaf2] bg-[#f8f9fc] px-2 py-0.5 font-mono text-[10px] tracking-wide text-[#6b728e]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Code viewer */}
          <div className="min-w-0 flex-1 border border-[#eceef5] bg-[#fafbff]">
            <div className="-mx-px flex flex-nowrap gap-0 overflow-x-auto border-b border-[#eceef5] bg-white [-webkit-overflow-scrolling:touch]">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 border-b-2 px-3 py-3 font-mono text-[11px] sm:px-4 sm:text-xs ${
                    activeTab === tab
                      ? "-mb-px border-black font-medium text-[#0f1222]"
                      : "border-transparent text-[#8b90a3] hover:text-[#5c6178]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row">
              {/* File tree */}
              <div className="w-full shrink-0 border-b border-[#eceef5] bg-white p-4 font-mono text-xs text-[#5c6178] md:w-52 md:border-b-0 md:border-r">
                <p className="mb-3 text-[10px] tracking-wide text-[#b4b8c9]">
                  src /
                </p>
                <ul className="space-y-1">
                  {fileTree.map((file) => (
                    <li key={file}>
                      <button
                        type="button"
                        onClick={() => {
                          const tab = TABS.find((t) => file.endsWith(t));
                          if (tab) setActiveTab(tab);
                        }}
                        className={`w-full truncate rounded px-2 py-1 text-left hover:bg-[#f5f6fa] ${
                          activeTab === file || file.endsWith(activeTab)
                            ? "bg-[#eef2ff] text-[#1d4ed8]"
                            : ""
                        }`}
                      >
                        {file}
                      </button>
                    </li>
                  ))}
                </ul>
                {listing.fileSizeBytes && (
                  <p className="mt-4 text-[10px] text-[#b4b8c9]">
                    {formatBytes(listing.fileSizeBytes)} total
                  </p>
                )}
              </div>

              {/* Tab content */}
              <div className="min-h-[280px] flex-1 bg-white p-4 sm:min-h-[320px] sm:p-6">
                {tabBody[activeTab]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1e2a4a] bg-[#0f172a] px-4 py-3 text-white shadow-[0_-8px_30px_rgba(15,23,42,0.35)] md:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.1em] text-[#94a3b8] sm:justify-start sm:gap-x-8 sm:tracking-[0.12em]">
          <span>PRICE: {formatPrice(listing.price)}</span>
          <span>
            REVIEWS:{" "}
            {listing.reviewCount != null ? listing.reviewCount : "—"}
          </span>
          {listing.verified && (
            <span className="text-[#22c55e]">VERIFIED: OK</span>
          )}
        </div>
      </div>

      <footer className="border-t border-[#eceef5] py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 font-mono text-[10px] text-[#9aa0b5] sm:flex-row md:px-6">
          <span>SKILLKART_SYSTEM_V1.0 © 2024</span>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <span>STATUS: OK</span>
            <span>CHANGELOG</span>
            <span>API ACCESS</span>
            <span>TERMS OF SERVICE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

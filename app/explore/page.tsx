"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ExploreListingCard } from "@/components/explore-listing-card";
import { AppNavbar } from "@/components/app-navbar";
import {
  type ApiListing,
  type ListingCategoryOption,
  type ListingsSortBy,
  listingsApi,
} from "@/lib/api";
import { FALLBACK_LISTING_CATEGORIES } from "@/lib/explore-categories";

function IconGrid({ active }: Readonly<{ active: boolean }>) {
  return (
    <span
      className={`grid h-4 w-4 grid-cols-2 gap-0.5 ${active ? "text-[#0f1222]" : "text-[#b4b8c9]"}`}
      aria-hidden
    >
      {(["grid-a", "grid-b", "grid-c", "grid-d"] as const).map((id) => (
        <span key={id} className="rounded-sm bg-current" />
      ))}
    </span>
  );
}

function IconList({ active }: Readonly<{ active: boolean }>) {
  return (
    <span
      className={`flex flex-col gap-0.5 ${active ? "text-[#0f1222]" : "text-[#b4b8c9]"}`}
      aria-hidden
    >
      {(["list-a", "list-b", "list-c"] as const).map((id) => (
        <span key={id} className="h-0.5 w-4 rounded-sm bg-current" />
      ))}
    </span>
  );
}

const SORT_OPTIONS: ReadonlyArray<{ value: ListingsSortBy; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
];

const SKELETON_IDS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f"] as const;

function SkeletonCard({ view }: Readonly<{ view: "grid" | "list" }>) {
  if (view === "list") {
    return (
      <div className="flex animate-pulse flex-col overflow-hidden rounded-lg border border-[#eceefa] bg-white sm:flex-row">
        <div className="aspect-[16/10] shrink-0 bg-[#eef0f8] sm:w-52" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="h-4 w-1/3 rounded bg-[#eef0f8]" />
          <div className="h-5 w-3/4 rounded bg-[#eef0f8]" />
          <div className="h-3 w-full rounded bg-[#f5f6fa]" />
          <div className="h-3 w-5/6 rounded bg-[#f5f6fa]" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-lg border border-[#eceefa] bg-white">
      <div className="aspect-[16/10] bg-[#eef0f8]" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/3 rounded bg-[#eef0f8]" />
        <div className="h-5 w-4/5 rounded bg-[#eef0f8]" />
        <div className="h-3 w-full rounded bg-[#f5f6fa]" />
        <div className="h-3 w-2/3 rounded bg-[#f5f6fa]" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ListingsSortBy>("newest");
  const [categoryOptions, setCategoryOptions] = useState<ListingCategoryOption[]>([
    ...FALLBACK_LISTING_CATEGORIES,
  ]);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    listingsApi
      .listCategories()
      .then(({ categories }) => {
        if (!cancelled && categories.length > 0) setCategoryOptions(categories);
      })
      .catch(() => {
        if (!cancelled) setCategoryOptions([...FALLBACK_LISTING_CATEGORIES]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const labelBySlug = useMemo(
    () => Object.fromEntries(categoryOptions.map((c) => [c.slug, c.label])),
    [categoryOptions],
  );

  useEffect(() => {
    setLoading(true);
    setError("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const run = async () => {
        try {
          const { listings: rows, totalPages: tp } = await listingsApi.list({
            q: search.trim() || undefined,
            page,
            limit: 12,
            sortBy,
            category: categorySlug ?? undefined,
          });
          setListings(rows);
          setTotalPages(tp);
        } catch {
          setError("Could not load listings. Please try again.");
          setListings([]);
          setTotalPages(1);
        } finally {
          setLoading(false);
        }
      };
      void run();
    }, 320);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, page, categorySlug, sortBy]);

  const setSearchAndReset = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const pageNums = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

  const showPagination = !loading && totalPages > 1;

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <AppNavbar activeTab="explore" />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-6">
        <main className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight md:text-3xl">Explore skills</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c6178]">
                Browse by what you want to get done—social posts, SEO, design, code, video, and
                more. Watch quick previews before you buy.
              </p>
            </div>
            <div className="flex gap-1 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded border p-2 ${view === "grid" ? "border-[#0f1222] bg-[#f8f9fc]" : "border-[#e8eaf2]"}`}
                aria-label="Grid view"
              >
                <IconGrid active={view === "grid"} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded border p-2 ${view === "list" ? "border-[#0f1222] bg-[#f8f9fc]" : "border-[#e8eaf2]"}`}
                aria-label="List view"
              >
                <IconList active={view === "list"} />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-medium tracking-wide text-[#9aa0b5] uppercase">
              Categories
            </p>
            <div className="relative mt-3 rounded-2xl border border-[#e8eaf2] bg-[#f8f9fc] p-1.5 sm:p-2">
              <div
                className="pointer-events-none absolute inset-y-2 left-2 z-10 w-6 rounded-l-2xl bg-gradient-to-r from-[#f8f9fc] to-transparent sm:hidden"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-y-2 right-2 z-10 w-6 rounded-r-2xl bg-gradient-to-l from-[#f8f9fc] to-transparent sm:hidden"
                aria-hidden
              />
              <div
                className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCategorySlug(null);
                    setPage(1);
                  }}
                  className={`snap-start shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    categorySlug == null
                      ? "border-[#0f1222] bg-[#0f1222] text-white shadow-sm"
                      : "border-transparent bg-white text-[#374151] shadow-[0_1px_2px_rgba(15,18,34,0.06)] hover:border-[#e2e6ef]"
                  }`}
                >
                  All categories
                </button>
                {categoryOptions.map((cat) => {
                  const active = categorySlug === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        setPage(1);
                        setCategorySlug((prev) => (prev === cat.slug ? null : cat.slug));
                      }}
                      className={`snap-start shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "border-[#0f1222] bg-[#0f1222] text-white shadow-sm"
                          : "border-transparent bg-white text-[#374151] shadow-[0_1px_2px_rgba(15,18,34,0.06)] hover:border-[#e2e6ef]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="relative max-w-2xl flex-1">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center text-[#94a3b8]"
                aria-hidden
              >
                <svg
                  className="h-[18px] w-[18px] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearchAndReset(e.target.value)}
                placeholder="e.g. schedule Instagram posts, audit my website, summarize PDFs…"
                className="h-12 w-full rounded-xl border border-[#e8eaf2] bg-[#f8f9fc] py-2 pl-12 pr-4 text-sm text-[#0f1222] outline-none placeholder:text-[#9aa0b5] focus:border-[#2563eb]/50 focus:bg-white"
                aria-label="Search skills by task or keyword"
              />
            </div>

            <div className="flex shrink-0 flex-col gap-1.5">
              <label htmlFor="explore-sort" className="text-xs font-medium text-[#9aa0b5]">
                Sort by
              </label>
              <select
                id="explore-sort"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as ListingsSortBy);
                  setPage(1);
                }}
                className="h-11 min-w-[12rem] rounded-lg border border-[#e8eaf2] bg-white px-3 text-sm text-[#0f1222] outline-none focus:border-[#2563eb]/50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div
            className={
              view === "grid"
                ? "mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                : "mt-8 flex flex-col gap-4"
            }
          >
            {loading
              ? SKELETON_IDS.map((id) => <SkeletonCard key={id} view={view} />)
              : listings.map((listing) => (
                  <ExploreListingCard
                    key={listing._id}
                    listing={listing}
                    view={view}
                    categoryLabel={
                      listing.category ? labelBySlug[listing.category] : undefined
                    }
                  />
                ))}
          </div>

          {!loading && listings.length === 0 && !error ? (
            <p className="mt-10 text-center text-sm text-[#68708a]">
              No skills match your filters yet. Try another category or search phrase.
            </p>
          ) : null}

          {showPagination ? (
            <nav
              className="mt-12 flex max-w-full items-center justify-center gap-1 overflow-x-auto pb-1 font-mono text-sm [-webkit-overflow-scrolling:touch]"
              aria-label="Pagination"
            >
              <button
                type="button"
                className="px-2 py-1 text-[#8b90a3] disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                ←
              </button>
              {pageNums.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={page === n ? "page" : undefined}
                  className={`min-w-[2.25rem] px-2 py-1 ${page === n ? "bg-black text-white" : "text-[#5c6178] hover:bg-[#f5f6fa]"}`}
                >
                  {String(n).padStart(2, "0")}
                </button>
              ))}
              {totalPages > 5 ? (
                <>
                  <span className="px-1 text-[#b4b8c9]">…</span>
                  <button
                    type="button"
                    onClick={() => setPage(totalPages)}
                    className={`min-w-[2.25rem] px-2 py-1 ${page === totalPages ? "bg-black text-white" : "text-[#5c6178] hover:bg-[#f5f6fa]"}`}
                  >
                    {String(totalPages).padStart(2, "0")}
                  </button>
                </>
              ) : null}
              <button
                type="button"
                className="px-2 py-1 text-[#8b90a3] disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                →
              </button>
            </nav>
          ) : null}
        </main>
      </div>

      <footer className="mt-auto border-t border-[#eceef5] py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 font-mono text-[10px] text-[#9aa0b5] sm:flex-row md:px-6">
          <span>SKILLKART_SYSTEM_V1.0</span>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <span>STATUS: OK</span>
            <span>CHANGELOG</span>
            <span>API_ACCESS</span>
            <span>TERMS_OF_SERVICE</span>
          </div>
          <span>©2024 SkillKart</span>
        </div>
      </footer>
    </div>
  );
}

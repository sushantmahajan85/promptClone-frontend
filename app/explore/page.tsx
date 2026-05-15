"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ExploreListingCard } from "@/components/explore-listing-card";
import { AppNavbar } from "@/components/app-navbar";
import { SiteFooter } from "@/components/site-footer";
import {
  type ApiListing,
  type ListingCategoryOption,
  type ListingsSortBy,
  listingsApi,
  usersApi,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { iconForCategory } from "@/lib/category-icons";
import { FALLBACK_LISTING_CATEGORIES } from "@/lib/explore-categories";

// -- Category metadata ---------------------------------------------------------

type CategoryMeta = {
  emoji: string;
  activeBg: string;
  activeBorder: string;
  hoverBg: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  "content-social":       { emoji: "✍️",  activeBg: "bg-violet-600",  activeBorder: "border-violet-600",  hoverBg: "hover:bg-violet-50  hover:border-violet-200" },
  "seo-growth":           { emoji: "📈",  activeBg: "bg-emerald-600", activeBorder: "border-emerald-600", hoverBg: "hover:bg-emerald-50 hover:border-emerald-200" },
  "design-creative":      { emoji: "🎨",  activeBg: "bg-pink-600",    activeBorder: "border-pink-600",    hoverBg: "hover:bg-pink-50    hover:border-pink-200" },
  "development-code":     { emoji: "💻",  activeBg: "bg-blue-600",    activeBorder: "border-blue-600",    hoverBg: "hover:bg-blue-50    hover:border-blue-200" },
  "video-media":          { emoji: "🎬",  activeBg: "bg-orange-600",  activeBorder: "border-orange-600",  hoverBg: "hover:bg-orange-50  hover:border-orange-200" },
  "research-data":        { emoji: "🔬",  activeBg: "bg-teal-600",    activeBorder: "border-teal-600",    hoverBg: "hover:bg-teal-50    hover:border-teal-200" },
  "business-productivity":{ emoji: "💼",  activeBg: "bg-amber-600",   activeBorder: "border-amber-600",   hoverBg: "hover:bg-amber-50   hover:border-amber-200" },
  "web3-blockchain":      { emoji: "⛓️", activeBg: "bg-indigo-600",  activeBorder: "border-indigo-600",  hoverBg: "hover:bg-indigo-50  hover:border-indigo-200" },
};

const SORT_OPTIONS: ReadonlyArray<{ value: ListingsSortBy; label: string }> = [
  { value: "newest",     label: "Newest first" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "top_rated",  label: "Top rated" },
  { value: "popular",    label: "Most popular" },
];

const SKELETON_IDS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f", "sk-g", "sk-h"] as const;

// -- Sub-components -------------------------------------------------------------

function IconGrid({ active }: Readonly<{ active: boolean }>) {
  return (
    <span className={`grid h-4 w-4 grid-cols-2 gap-0.5 ${active ? "text-[#0f1222]" : "text-[#b4b8c9]"}`} aria-hidden>
      {(["a","b","c","d"] as const).map((id) => (
        <span key={id} className="rounded-sm bg-current" />
      ))}
    </span>
  );
}

function IconList({ active }: Readonly<{ active: boolean }>) {
  return (
    <span className={`flex flex-col gap-0.5 ${active ? "text-[#0f1222]" : "text-[#b4b8c9]"}`} aria-hidden>
      {(["a","b","c"] as const).map((id) => (
        <span key={id} className="h-0.5 w-4 rounded-sm bg-current" />
      ))}
    </span>
  );
}

function SkeletonCard({ view }: Readonly<{ view: "grid" | "list" }>) {
  if (view === "list") {
    return (
      <div className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-[#eceefa] bg-white sm:flex-row">
        <div className="aspect-[16/9] shrink-0 bg-[#eef0f8] sm:w-52" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="h-3 w-1/4 rounded-full bg-[#eef0f8]" />
          <div className="h-4 w-3/4 rounded-full bg-[#eef0f8]" />
          <div className="h-3 w-full rounded-full bg-[#f5f6fa]" />
          <div className="mt-auto h-3 w-1/3 rounded-full bg-[#f5f6fa]" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-[#eceefa] bg-white">
      <div className="aspect-[16/9] bg-[#eef0f8]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded-full bg-[#eef0f8]" />
        <div className="h-4 w-4/5 rounded-full bg-[#eef0f8]" />
        <div className="h-3 w-full rounded-full bg-[#f5f6fa]" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 w-1/4 rounded-full bg-[#f5f6fa]" />
          <div className="h-7 w-14 rounded-lg bg-[#eef0f8]" />
        </div>
      </div>
    </div>
  );
}

function emptyMessage(search: string, category: string | null): string {
  if (search && category) return `No results for "${search}" in this category. Try a different keyword or browse all.`;
  if (search) return `No results for "${search}". Try a different keyword or browse all categories.`;
  return "No skills in this category yet. Check back soon or browse all.";
}

function EmptyState({ search, category }: Readonly<{ search: string; category: string | null }>) {
  return (
    <div className="col-span-full flex flex-col items-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e8eaf2] bg-[#f8f9fc] text-3xl shadow-sm">
        🔍
      </span>
      <h3 className="mt-4 text-base font-semibold text-[#0f1222]">No skills found</h3>
      <p className="mt-1.5 max-w-xs text-sm text-[#6b728e]">
        {emptyMessage(search, category)}
      </p>
    </div>
  );
}

// -- Main page ------------------------------------------------------------------

function ExplorePageInner() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState(() => searchParams.get("q") ?? "");
  const [categorySlug, setCategorySlug] = useState<string | null>(
    () => searchParams.get("category") ?? null,
  );
  const [sortBy, setSortBy]       = useState<ListingsSortBy>("newest");
  const [categoryOptions, setCategoryOptions] = useState<ListingCategoryOption[]>([
    ...FALLBACK_LISTING_CATEGORIES,
  ]);
  const [listings, setListings]   = useState<ApiListing[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [ownedIds, setOwnedIds]   = useState<ReadonlySet<string>>(new Set());
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
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!token) { setOwnedIds(new Set()); return; }
    let cancelled = false;
    usersApi.getMyPurchases(token).then(({ listings: owned }) => {
      if (!cancelled) setOwnedIds(new Set(owned.map((l) => l._id)));
    }).catch(() => { /* silently ignore */ });
    return () => { cancelled = true; };
  }, [token]);

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
          const { listings: rows, totalPages: tp, total: t } = await listingsApi.list({
            q: search.trim() || undefined,
            page,
            limit: 12,
            sortBy,
            category: categorySlug ?? undefined,
          });
          setListings(rows);
          setTotalPages(tp);
          setTotal(t ?? rows.length);
        } catch {
          setError("Could not load listings. Please try again.");
          setListings([]);
          setTotalPages(1);
          setTotal(0);
        } finally {
          setLoading(false);
        }
      };
      void run();
    }, 320);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, page, categorySlug, sortBy]);

  const setSearchAndReset = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const activeCategoryLabel = categorySlug ? (labelBySlug[categorySlug] ?? categorySlug) : null;
  const pageNums = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);
  const showPagination = !loading && totalPages > 1;

  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafc] text-[#0f1222]">
      <AppNavbar activeTab="explore" />

      {/* -- Page header ---------------------------------------------------- */}
      <div className="border-b border-[#eceef5] bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Explore skills
              </h1>
              <p className="mt-1 text-sm text-[#6b728e]">
                Discover and deploy AI capabilities built by expert creators
              </p>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-[#e8eaf2] bg-[#f8f9fc] p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-md p-1.5 transition-colors ${view === "grid" ? "bg-white shadow-sm text-[#0f1222]" : "text-[#9aa0b5] hover:text-[#0f1222]"}`}
                aria-label="Grid view"
              >
                <IconGrid active={view === "grid"} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-md p-1.5 transition-colors ${view === "list" ? "bg-white shadow-sm text-[#0f1222]" : "text-[#9aa0b5] hover:text-[#0f1222]"}`}
                aria-label="List view"
              >
                <IconList active={view === "list"} />
              </button>
            </div>
          </div>

          {/* -- Category tabs ----------------------------------------------- */}
          <div className="relative mt-5">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent sm:hidden"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:hidden"
              aria-hidden
            />
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
              {/* All button */}
              <button
                type="button"
                onClick={() => { setCategorySlug(null); setPage(1); }}
                className={`snap-start inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  categorySlug == null
                    ? "border-[#0f1222] bg-[#0f1222] text-white shadow-sm"
                    : "border-[#e8eaf2] bg-white text-[#374151] hover:border-[#c8ccda] hover:bg-[#f5f6fa]"
                }`}
              >
                <span aria-hidden>✦</span>{" "}
                All skills
              </button>

              {categoryOptions.map((cat) => {
                const meta = CATEGORY_META[cat.slug];
                const active = categorySlug === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => { setPage(1); setCategorySlug((prev) => prev === cat.slug ? null : cat.slug); }}
                    className={`snap-start inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                      active
                        ? `${meta?.activeBg ?? "bg-[#0f1222]"} ${meta?.activeBorder ?? "border-[#0f1222]"} text-white shadow-sm`
                        : `border-[#e8eaf2] bg-white text-[#374151] ${meta?.hoverBg ?? "hover:bg-[#f5f6fa]"} hover:border-[#c8ccda]`
                    }`}
                  >
                    <span aria-hidden>{meta?.emoji ?? iconForCategory(cat.label, cat.slug)}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* -- Content -------------------------------------------------------- */}
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6">
        <main className="min-w-0">

          {/* Search + sort row */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <span
                className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#94a3b8]"
                aria-hidden
              >
                <svg className="h-4.5 w-4.5 h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearchAndReset(e.target.value)}
                placeholder="Search by task, keyword, or tool — e.g. &quot;summarize PDFs&quot;…"
                className="h-11 w-full rounded-xl border border-[#e8eaf2] bg-white py-2 pl-11 pr-4 text-sm text-[#0f1222] shadow-sm outline-none placeholder:text-[#9aa0b5] focus:border-[#2563eb]/50 focus:ring-2 focus:ring-[#2563eb]/10"
                aria-label="Search skills"
              />
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as ListingsSortBy); setPage(1); }}
                className="h-11 rounded-xl border border-[#e8eaf2] bg-white px-3 pr-8 text-sm text-[#0f1222] shadow-sm outline-none focus:border-[#2563eb]/50"
                aria-label="Sort listings"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {loading ? (
              <span className="h-4 w-32 animate-pulse rounded-full bg-[#eef0f8]" />
            ) : (
              <span className="text-sm text-[#6b728e]">
                <span className="font-semibold text-[#0f1222]">{total}</span>
                {" "}{total === 1 ? "skill" : "skills"}
                {activeCategoryLabel ? (
                  <>{" "}in <span className="font-medium text-[#0f1222]">{activeCategoryLabel}</span></>
                ) : null}
                {search ? (
                  <>{" "}for{" "}<span className="font-medium text-[#0f1222]">&ldquo;{search}&rdquo;</span></>
                ) : null}
              </span>
            )}

            {/* Active filter chips */}
            {activeCategoryLabel ? (
              <button
                type="button"
                onClick={() => { setCategorySlug(null); setPage(1); }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  (CATEGORY_META[categorySlug ?? ""]?.activeBg ?? "bg-[#eef0f8]")
                } ${(CATEGORY_META[categorySlug ?? ""]?.activeBorder ?? "border-transparent")} text-white`}
              >
                {CATEGORY_META[categorySlug ?? ""]?.emoji}{" "}{activeCategoryLabel}
                <svg className="h-3 w-3 opacity-70" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
            {search ? (
              <button
                type="button"
                onClick={() => setSearchAndReset("")}
                className="inline-flex items-center gap-1 rounded-full border border-[#e8eaf2] bg-white px-2.5 py-0.5 text-xs font-medium text-[#5c6178] hover:bg-[#f5f6fa]"
              >
                &ldquo;{search}&rdquo;
                <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          ) : null}

          {/* Grid */}
          <div
            className={
              view === "grid"
                ? "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "mt-6 flex flex-col gap-3"
            }
          >
            {loading ? (
              SKELETON_IDS.map((id) => <SkeletonCard key={id} view={view} />)
            ) : null}
            {!loading && listings.length === 0 ? (
              <EmptyState search={search} category={categorySlug} />
            ) : null}
            {!loading && listings.length > 0
              ? listings.map((listing) => (
                  <ExploreListingCard
                    key={listing._id}
                    listing={listing}
                    view={view}
                    categoryLabel={listing.category ? labelBySlug[listing.category] : undefined}
                    ownedIds={ownedIds}
                  />
                ))
              : null
            }
          </div>

          {/* Pagination */}
          {showPagination ? (
            <nav
              className="mt-10 flex items-center justify-center gap-1"
              aria-label="Pagination"
            >
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8eaf2] bg-white text-[#6b728e] transition-colors hover:border-[#c8ccda] hover:text-[#0f1222] disabled:opacity-30"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {pageNums.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={page === n ? "page" : undefined}
                  className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors ${
                    page === n
                      ? "border-[#0f1222] bg-[#0f1222] text-white"
                      : "border-[#e8eaf2] bg-white text-[#5c6178] hover:border-[#c8ccda] hover:text-[#0f1222]"
                  }`}
                >
                  {n}
                </button>
              ))}
              {totalPages > 5 ? (
                <>
                  <span className="px-1 text-[#b4b8c9]">…</span>
                  <button
                    type="button"
                    onClick={() => setPage(totalPages)}
                    className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors ${
                      page === totalPages
                        ? "border-[#0f1222] bg-[#0f1222] text-white"
                        : "border-[#e8eaf2] bg-white text-[#5c6178] hover:border-[#c8ccda]"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              ) : null}
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8eaf2] bg-white text-[#6b728e] transition-colors hover:border-[#c8ccda] hover:text-[#0f1222] disabled:opacity-30"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          ) : null}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExplorePageInner />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SKILLS } from "@/lib/skill-registry";

const CATEGORIES = [
  { id: "neural", label: "Neural Logic", defaultChecked: true },
  { id: "vision", label: "Vision Nodes", defaultChecked: false },
  { id: "audio", label: "Audio Synthesis", defaultChecked: false },
  { id: "llm", label: "LLM Fine-tunes", defaultChecked: false },
];

function IconGrid({ active }: Readonly<{ active: boolean }>) {
  return (
    <span
      className={`grid h-4 w-4 grid-cols-2 gap-0.5 ${active ? "text-[#0f1222]" : "text-[#b4b8c9]"}`}
      aria-hidden
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="rounded-sm bg-current" />
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
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-0.5 w-4 rounded-sm bg-current" />
      ))}
    </span>
  );
}

export default function ExplorePage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultChecked])),
  );
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1.5);

  const filteredSkills = useMemo(() => {
    return SKILLS.filter((s) => {
      const neural = categories.neural;
      const vision = categories.vision;
      const audio = categories.audio;
      const llm = categories.llm;
      const anyCat = neural || vision || audio || llm;
      if (!anyCat) return true;
      const tagStr = s.tags.join(" ").toLowerCase();
      if (neural && (tagStr.includes("neural") || tagStr.includes("logic")))
        return true;
      if (vision && tagStr.includes("vision")) return true;
      if (audio && tagStr.includes("audio")) return true;
      if (llm && tagStr.includes("llm")) return true;
      return false;
    });
  }, [categories]);

  const toggleCategory = (id: string) => {
    setCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFilters = () => {
    setCategories(
      Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultChecked])),
    );
    setPriceMin(0);
    setPriceMax(1.5);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <header className="sticky top-0 z-20 border-b border-[#eceef5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-4 py-3 md:px-6">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight"
          >
            AiSync
          </Link>

          <div className="relative hidden min-w-0 flex-1 md:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#8b90a3]">
              &gt;_
            </span>
            <input
              type="search"
              placeholder="Search skills..."
              className="h-10 w-full rounded-lg border border-[#e8eaf2] bg-[#f5f6fa] py-2 pl-10 pr-4 text-sm text-[#0f1222] outline-none placeholder:text-[#9aa0b5]"
            />
          </div>

          <nav className="ml-auto flex shrink-0 items-center gap-5 text-sm text-[#5c6178] md:gap-7">
            <span className="border-b-2 border-black pb-0.5 font-medium text-black">
              Explore
            </span>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#0f1222]"
            >
              Sell
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#0f1222]"
            >
              Docs
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#0f1222]"
            >
              Market
            </button>
            <button
              type="button"
              className="hidden text-[#5c6178] sm:inline"
              aria-label="Wallet"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
            </button>
            <button
              type="button"
              className="relative hidden text-[#5c6178] sm:inline"
              aria-label="Notifications"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#2563eb]" />
            </button>
            <div
              className="h-8 w-8 shrink-0 rounded-full border border-[#d9dce7] bg-[#e8eaf2]"
              aria-hidden
            />
          </nav>
        </div>
        <div className="border-t border-[#eceef5] px-4 py-2 md:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#8b90a3]">
              &gt;_
            </span>
            <input
              type="search"
              placeholder="Search skills..."
              className="h-10 w-full rounded-lg border border-[#e8eaf2] bg-[#f5f6fa] py-2 pl-10 pr-4 text-sm outline-none"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-8 px-4 py-8 md:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#a3a8bd]">
            [ FILTERS ]
          </p>

          <div className="mt-8">
            <h2 className="text-[11px] font-bold tracking-[0.12em] text-[#0f1222]">
              CATEGORY
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[#3d4459]">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={categories[c.id]}
                      onChange={() => toggleCategory(c.id)}
                      className="h-3.5 w-3.5 rounded-sm border-[#c9cedc] accent-black"
                    />
                    {c.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="text-[11px] font-bold tracking-[0.12em] text-[#0f1222]">
              PRICE RANGE
            </h2>
            <div className="mt-4">
              <div className="relative h-2 rounded-full bg-[#e8eaf2]">
                <div
                  className="absolute h-2 rounded-full bg-[#0f1222]"
                  style={{
                    left: `${(priceMin / 1.5) * 100}%`,
                    width: `${((priceMax - priceMin) / 1.5) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.01}
                  value={priceMin}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPriceMin(Math.min(v, priceMax));
                  }}
                  className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-white"
                />
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.01}
                  value={priceMax}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPriceMax(Math.max(v, priceMin));
                  }}
                  className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-[#8b90a3]">
                <span>{priceMin.toFixed(2)}Ξ</span>
                <span>{priceMax.toFixed(2)}Ξ</span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-[11px] font-bold tracking-[0.12em] text-[#0f1222]">
              MIN RATING
            </h2>
            <div className="mt-3 flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className="h-4 w-4 fill-current"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-[#5c6178]">4.0+</span>
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-10 w-full border border-black bg-black py-2.5 text-xs font-semibold tracking-[0.18em] text-white"
          >
            RESET FILTERS
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
                Marketplace Explorer
              </h1>
              <p className="mt-2 text-sm text-[#68708a]">
                Browse verified high-performance skills for your modular AI
                stack.
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

          <div
            className={
              view === "grid"
                ? "mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                : "mt-8 flex flex-col gap-3"
            }
          >
            {filteredSkills.map((skill) => (
              <Link
                key={skill.routeId}
                href={`/skills/${skill.routeId}`}
                className={`block rounded-sm outline-none transition-shadow hover:shadow-[0_12px_35px_rgba(23,35,73,0.08)] focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 ${view === "list" ? "w-full" : ""}`}
              >
                <article
                  className={`h-full border border-[#eceefa] bg-white p-4 ${view === "list" ? "flex flex-wrap items-start gap-4" : ""}`}
                >
                <div
                  className={`flex items-start justify-between gap-2 ${view === "list" ? "w-full sm:w-auto sm:flex-1" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-black px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-white">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      VERIFIED
                    </span>
                    <span className="font-mono text-[11px] text-[#6b728e]">
                      {skill.displayId}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#9aa0b5]">
                    {skill.size}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  {skill.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#68708a]">
                  {skill.shortDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skill.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-[#e8eaf2] bg-[#f8f9fc] px-2 py-0.5 font-mono text-[10px] tracking-wide text-[#6b728e]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f8] pt-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-6 w-6 shrink-0 rounded-sm"
                      style={{ backgroundColor: skill.avatar }}
                    />
                    <span className="font-mono text-xs text-[#5c6178]">
                      {skill.author}
                    </span>
                  </div>
                  <div className="h-6 w-8 border border-[#d4d8e5]" aria-hidden />
                </div>
                </article>
              </Link>
            ))}
          </div>

          <nav
            className="mt-12 flex items-center justify-center gap-1 font-mono text-sm"
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
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`min-w-[2.25rem] px-2 py-1 ${page === n ? "bg-black text-white" : "text-[#5c6178] hover:bg-[#f5f6fa]"}`}
              >
                {String(n).padStart(2, "0")}
              </button>
            ))}
            <span className="px-1 text-[#b4b8c9]">...</span>
            <button
              type="button"
              onClick={() => setPage(12)}
              className={`min-w-[2.25rem] px-2 py-1 ${page === 12 ? "bg-black text-white" : "text-[#5c6178] hover:bg-[#f5f6fa]"}`}
            >
              12
            </button>
            <button
              type="button"
              className="px-2 py-1 text-[#8b90a3] disabled:opacity-40"
              disabled={page >= 12}
              onClick={() => setPage((p) => Math.min(12, p + 1))}
              aria-label="Next page"
            >
              →
            </button>
          </nav>
        </main>
      </div>

      <footer className="mt-auto border-t border-[#eceef5] py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 font-mono text-[10px] text-[#9aa0b5] sm:flex-row md:px-6">
          <span>AISYNC_SYSTEM_V1.0.42</span>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#5c6178]"
            >
              STATUS: OK
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#5c6178]"
            >
              CHANGELOG
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#5c6178]"
            >
              API_ACCESS
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#5c6178]"
            >
              TERMS_OF_SERVICE
            </button>
          </div>
          <span>©2024 AI_SYNC_CORP</span>
        </div>
      </footer>
    </div>
  );
}

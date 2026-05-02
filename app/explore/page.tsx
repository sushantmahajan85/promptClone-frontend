"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { SKILLS } from "@/lib/skill-registry";

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

function matchesSearch(
  skill: (typeof SKILLS)[number],
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (skill.title.toLowerCase().includes(q)) return true;
  if (skill.shortDescription.toLowerCase().includes(q)) return true;
  return skill.tags.some((t) => t.toLowerCase().includes(q));
}

export default function ExplorePage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredSkills = useMemo(
    () => SKILLS.filter((s) => matchesSearch(s, search)),
    [search],
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <header className="sticky top-0 z-20 border-b border-[#eceef5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:gap-6 md:px-6">
          <BrandLogo className="shrink-0" />

          <nav className="flex min-w-0 flex-1 basis-full flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-[#5c6178] sm:basis-auto sm:justify-end md:gap-7">
            <Link
              href="/explore"
              className="border-b-2 border-black pb-0.5 font-medium text-black"
            >
              Explore
            </Link>
            <Link href="/sell" className="hover:text-[#0f1222]">
              Sell
            </Link>
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
            <div
              className="h-8 w-8 shrink-0 rounded-full border border-[#d9dce7] bg-[#e8eaf2]"
              aria-hidden
            />
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-6">
        <main className="min-w-0">
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

          <div className="relative mt-6 max-w-xl">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#8b90a3]">
              &gt;_
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by skill name, description, or tags…"
              className="h-11 w-full rounded-lg border border-[#e8eaf2] bg-[#f5f6fa] py-2 pl-10 pr-4 text-sm text-[#0f1222] outline-none placeholder:text-[#9aa0b5] focus:border-[#2563eb]/40"
              aria-label="Search skills"
            />
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

          {filteredSkills.length === 0 && (
            <p className="mt-10 text-center text-sm text-[#68708a]">
              No skills match your search. Try a different name, description
              keyword, or tag.
            </p>
          )}

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
          <span>SKILLKART_SYSTEM_V1.0.42</span>
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
          <span>©2024 SkillKart</span>
        </div>
      </footer>
    </div>
  );
}

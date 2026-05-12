import Link from "next/link";

import { FeaturedListings } from "@/components/featured-listings";
import { HomeCategoryGrid } from "@/components/home-category-grid";
import { LandingNavbar } from "@/components/landing-navbar";
import { SiteFooter } from "@/components/site-footer";

const HOW_IT_WORKS_BUYER = [
  {
    step: "01",
    title: "Browse & discover",
    desc: "Search across hundreds of AI skills by category, rating, or use case.",
  },
  {
    step: "02",
    title: "Review & compare",
    desc: "Read the skills.md docs, check reviews, and preview demos before buying.",
  },
  {
    step: "03",
    title: "Buy & deploy",
    desc: "One-time purchase. Download the skill bundle and drop it into your agent.",
  },
];

const TRUST_SIGNALS = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    label: "One-time payment",
    sub: "No subscriptions, ever",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    label: "Instant download",
    sub: "Yours the moment you pay",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: "Seller-verified skills",
    sub: "Reviewed before going live",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    label: "Any LLM, any agent",
    sub: "Drop in and run anywhere",
  },
];

export default function Home() {
  return (
    <main className="bg-white text-[#0f1222]">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#fafbff] pb-16 pt-6 sm:pb-20 sm:pt-8">
        <div
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(15,18,34,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,18,34,0.04)_1px,transparent_1px)] [background-size:56px_56px]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" aria-hidden />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <LandingNavbar />

          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d9dceb] bg-white px-3.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-[#5f6785] shadow-sm sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />{" "}
              AI SKILL MARKETPLACE · OPEN FOR TRADING
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-[4.5rem] md:leading-[1.05]">
              The marketplace for
              <br />
              <span className="bg-gradient-to-r from-[#1d67ff] to-[#6b3ff6] bg-clip-text text-transparent">
                AI skills that work.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#5c6178] sm:text-[15px]">
              Discover battle-tested AI capabilities from expert builders — or package your
              expertise as a skill and start earning passive income.
            </p>

            {/* Search bar */}
            <form
              action="/explore"
              method="GET"
              className="mx-auto mt-8 flex w-full max-w-lg overflow-hidden rounded-xl border border-[#dce0f0] bg-white shadow-sm transition-shadow focus-within:shadow-md focus-within:border-[#2563eb]/40"
            >
              <span className="flex items-center pl-4 text-[#a0a7be]" aria-hidden>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
                </svg>
              </span>
              <input
                type="text"
                name="q"
                placeholder="Search AI skills, e.g. &quot;prompt injection shield&quot;…"
                className="flex-1 bg-transparent py-3 pl-3 pr-2 text-sm text-[#0f1222] placeholder:text-[#aab0c8] outline-none"
              />
              <button
                type="submit"
                className="m-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
              >
                Search
              </button>
            </form>

            {/* CTAs */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-[#7a8099]">
              <span>Popular:</span>
              {["Prompt engineering", "Code review", "SEO writer", "Data extractor"].map((q) => (
                <Link
                  key={q}
                  href={`/explore?q=${encodeURIComponent(q)}`}
                  className="rounded-full border border-[#e4e8f4] bg-white px-2.5 py-0.5 text-[11px] text-[#5c6178] transition-colors hover:border-[#2563eb]/40 hover:text-[#2563eb]"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>

          {/* Trust signals */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST_SIGNALS.map(({ icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl border border-[#eceefa] bg-white px-3 py-4 text-center"
              >
                <span className="text-[#2563eb]">{icon}</span>
                <div>
                  <p className="text-xs font-semibold text-[#0f1222]">{label}</p>
                  <p className="mt-0.5 text-[10px] text-[#8b91a8]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-[#0f1222]">Browse by category</h2>
          <Link href="/explore" className="text-[11px] tracking-[0.12em] text-[#7a8099] hover:text-[#0f1222]">
            SEE ALL →
          </Link>
        </div>
        <HomeCategoryGrid />
      </section>

      {/* ── Featured Skills ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#a3a8bd] sm:text-[11px]">
              MARKETPLACE PICKS
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Featured skills
            </h2>
            <p className="mt-1 text-sm text-[#6b728e]">
              <span className="font-semibold text-[#0f1222]">Hand-picked</span> by our team · updated daily
            </p>
          </div>
          <Link
            href="/explore"
            className="flex w-fit items-center gap-1.5 rounded-lg border border-[#e0e4f2] bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.12em] text-[#4a5068] transition-colors hover:border-[#2563eb]/40 hover:text-[#2563eb]"
          >
            Browse all skills
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <FeaturedListings />
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="border-y border-[#eef0f8] bg-[#fafbff] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#a3a8bd]">HOW IT WORKS</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              From skill to deployed in minutes
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS_BUYER.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e0e4f2] bg-white text-xs font-bold tabular-nums text-[#2563eb] shadow-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-[#0f1222]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#6b728e]">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/explore"
              className="rounded-xl border border-black bg-black px-6 py-2.5 text-xs font-semibold tracking-[0.15em] text-white transition-colors hover:bg-[#1e243d]"
            >
              START BROWSING
            </Link>
            <Link
              href="/sell/upload"
              className="rounded-xl border border-[#d8dcea] px-6 py-2.5 text-xs font-semibold tracking-[0.15em] text-[#1e243d] transition-colors hover:border-[#0f1222]"
            >
              LIST A SKILL
            </Link>
          </div>
        </div>
      </section>

      {/* ── Seller CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="overflow-hidden rounded-2xl bg-[#0f1222] px-8 py-12 sm:px-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#6b77a4]">FOR BUILDERS & CREATORS</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Turn your AI expertise
                <br />
                into passive income
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#9aa3c2]">
                Package your best prompts, agents, and workflows as a skill folder — one{" "}
                <span className="font-mono text-[13px] text-white">skills.md</span>{" "}file plus
                your logic. Publish once, earn on every install.
              </p>
              <ul className="mt-6 space-y-2.5">
                {[
                  "Keep 80% of every sale",
                  "One-time setup, recurring revenue",
                  "Built-in docs, versioning, and reviews",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#c1c8e4]">
                    <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/sell/upload"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3 text-xs font-semibold tracking-[0.15em] text-white transition-colors hover:bg-[#1d4ed8]"
              >
                START SELLING
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Mini file tree */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="mb-4 font-mono text-[11px] tracking-[0.12em] text-[#6b77a4]">
                {'>'} my-skill/ — example listing
              </p>
              <div className="space-y-2.5 font-mono text-sm text-[#c1c8e4]">
                <p>
                  ├─ <span className="rounded bg-[#2563eb]/20 px-2 py-0.5 text-[#7eb3ff]">skills.md</span>
                  <span className="ml-3 text-[#4a5580] text-xs">← docs &amp; contract</span>
                </p>
                <p>├─ handler.js <span className="ml-3 text-[#4a5580] text-xs">← logic</span></p>
                <p>└─ config.json <span className="ml-3 text-[#4a5580] text-xs">← settings</span></p>
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                  <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Skill verified &amp; live</p>
                  <p className="text-[10px] text-[#6b77a4]">Ready to earn on every install</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

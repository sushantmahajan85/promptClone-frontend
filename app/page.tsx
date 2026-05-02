import { BrandLogo } from "@/components/brand-logo";
import { FeaturedListings } from "@/components/featured-listings";
import Link from "next/link";

export default function Home() {

  return (
    <main className="bg-white text-[#0f1222]">
      <section className="relative overflow-hidden pt-6 pb-16 sm:pt-8 sm:pb-20">
        <div
          className="pointer-events-none absolute inset-0 -z-0 bg-white [background-image:linear-gradient(to_right,rgba(15,18,34,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,18,34,0.04)_1px,transparent_1px)] [background-size:56px_56px]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <header className="mb-16 flex flex-col gap-4 sm:mb-24">
            <div className="flex items-center justify-between gap-3">
              <BrandLogo
                textClassName="text-lg font-semibold sm:text-xl"
                iconSize={32}
                className="min-w-0"
              />
              <div
                className="h-8 w-8 shrink-0 rounded-full border border-[#d9dce7]"
                aria-hidden
              />
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#eef0f8] pt-4 text-sm text-[#7a7f93] sm:border-0 sm:pt-0">
              <Link href="/explore" className="hover:text-[#0f1222]">
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
            </nav>
          </header>

          <div className="mx-auto max-w-3xl text-center">
          <p className="mx-auto mb-6 inline-block max-w-full border border-[#d9dceb] px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-[#5f6785] sm:mb-8 sm:text-[11px] sm:tracking-[0.24em]">
            AI SKILL MARKETPLACE
          </p>
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl md:text-7xl">
            Buy and sell
            <br />
            <span className="text-[#1d67ff]">AI skills.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-[#5c6178]">
            SkillKart is where creators package small, portable AI skills—usually
            a folder with <span className="font-mono text-[13px]">skills.md</span>{" "}
            plus a couple of files—and buyers discover, purchase, and drop them
            into their agents and workflows.
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/explore"
              className="border border-black bg-black px-6 py-3 text-center text-xs font-semibold tracking-[0.15em] text-white sm:px-7 sm:tracking-[0.2em]"
            >
              BROWSE SKILLS
            </Link>
            <Link
              href="/sell"
              className="border border-[#d8dcea] px-6 py-3 text-center text-xs font-semibold tracking-[0.15em] text-[#1e243d] sm:px-7 sm:tracking-[0.2em]"
            >
              LIST A SKILL
            </Link>
          </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#a3a8bd] sm:text-[11px] sm:tracking-[0.26em]">
              MARKETPLACE PICKS
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:mt-3 sm:text-4xl">
              Featured skills
            </h2>
          </div>
          <Link
            className="shrink-0 text-[10px] tracking-[0.14em] text-[#79809a] hover:text-[#0f1222] sm:text-[11px] sm:tracking-[0.16em]"
            href="/explore"
          >
            SEARCH ALL SKILLS
          </Link>
        </div>

        <FeaturedListings />
      </section>

      <section className="border-y border-[#eef0f8] bg-[#fafbff]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:gap-12 sm:px-6 sm:py-20 md:grid-cols-2">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#a1a7be] sm:text-[11px] sm:tracking-[0.24em]">
              WHAT YOU SHIP
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              A tiny folder buyers can trust
            </h2>
            <p className="mt-6 text-sm leading-7 text-[#616984]">
              An AI skill on SkillKart is not a giant repo—it is a small bundle
              you can reason about. Creators write{" "}
              <span className="font-mono text-[13px]">skills.md</span> so the
              name, behavior, and inputs are clear; a couple of companion files
              carry the logic and settings. That keeps listings easy to review,
              search, buy, and plug into agents or internal tools.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[#25304d]">
              <li>
                <span className="font-mono text-[13px]">skills.md</span> — human
                documentation and contract for the skill
              </li>
              <li>One or two implementation files (e.g. handler, prompts)</li>
              <li>Optional config so runtimes know how to load the skill</li>
              <li>Same shape for every listing: simple to list, buy, and run</li>
            </ul>
          </div>

          <div className="min-w-0 border border-[#e7eaf6] bg-white p-4 sm:p-6">
            <p className="mb-4 text-[11px] tracking-[0.15em] text-[#9aa2ba] sm:text-xs sm:tracking-[0.2em]">
              {'>'} my-skill/ (example listing)
            </p>
            <div className="space-y-2 overflow-x-auto font-mono text-xs text-[#2f3856] sm:text-sm">
              <p>
                ├─ <span className="bg-[#f0f6ff] px-2 py-0.5">skills.md</span>
              </p>
              <p>├─ handler.js</p>
              <p>└─ config.json</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
          Create, search, buy, or sell
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-[#616984]">
          Package your expertise as a skill folder, publish it to the
          marketplace, and reach teams who are searching for ready-made AI
          capabilities—or explore listings, compare docs in{" "}
          <span className="font-mono text-[13px]">skills.md</span>, and buy what
          fits your stack.
        </p>
        <div className="mx-auto mt-10 flex max-w-lg flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/explore"
            className="flex h-11 items-center justify-center border border-black bg-black px-7 text-xs font-semibold tracking-[0.2em] text-white"
          >
            EXPLORE MARKETPLACE
          </Link>
          <Link
            href="/sell"
            className="flex h-11 items-center justify-center border border-[#d8dcea] px-7 text-xs font-semibold tracking-[0.15em] text-[#1e243d] sm:tracking-[0.2em]"
          >
            START SELLING
          </Link>
        </div>
      </section>
    </main>
  );
}

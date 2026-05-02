"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import type { SkillRecord } from "@/lib/skill-registry";

type TabId = "skills.md" | "handler.js" | "config.json";

const TABS: TabId[] = ["skills.md", "handler.js", "config.json"];

function ProgressBar({ value }: Readonly<{ value: number }>) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eceef5]">
      <div
        className="h-full rounded-full bg-[#2563eb]"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function SkillDetailView({ skill }: Readonly<{ skill: SkillRecord }>) {
  const [activeTab, setActiveTab] = useState<TabId>("skills.md");

  const locPct = Math.min(100, (skill.telemetry.linesOfCode / 4000) * 100);
  const tokenPct = Number.parseFloat(skill.telemetry.tokenEfficiency) || 0;
  const latencyPct = Math.max(5, 100 - skill.telemetry.latencyPeakMs * 2);

  const tabBody: Record<TabId, ReactNode> = {
    "skills.md": (
      <div className="space-y-6 text-sm leading-7 text-[#3d4459]">
        <h2 className="text-lg font-semibold text-[#0f1222]">
          # Skill Documentation
        </h2>
        <p>
          This logic block exposes a stable <code className="font-mono text-xs">AISync.Skill</code>{" "}
          contract for <strong>{skill.title}</strong>. Use it to chain prompts,
          validate tool outputs, and preserve latency budgets in production.
        </p>
        <div className="rounded-lg border border-[#d6e4ff] bg-[#f0f6ff] p-4 font-mono text-xs leading-6 text-[#1e3a5f]">
          <pre className="whitespace-pre-wrap">
            {`const skill = new AISync.Skill({
  id: "${skill.catalogId}",
  version: "${skill.version}",
  runtime: "edge-v2",
});
await skill.warm();
export default skill.pipeline;`}
          </pre>
        </div>
        <h3 className="pt-2 text-base font-semibold text-[#0f1222]">
          ## Deployment Specs
        </h3>
        <p className="text-[#5c6178]">
          Requires manifest v2, signed kernel bundle, and telemetry sink URL.
          Default cold start target under {skill.telemetry.latencyPeakMs + 12}ms
          on standard tier.
        </p>
      </div>
    ),
    "handler.js": (
      <div className="font-mono text-xs leading-6 text-[#1e3a5f]">
        <pre className="whitespace-pre-wrap">
          {`import { defineHandler } from "@aisync/runtime";

export default defineHandler({
  name: "${skill.title}",
  async run(ctx) {
    ctx.telemetry.mark("handler_start");
    const out = await ctx.model.complete(ctx.input);
    ctx.telemetry.mark("handler_end");
    return { ok: true, output: out };
  },
});`}
        </pre>
      </div>
    ),
    "config.json": (
      <div className="font-mono text-xs leading-6 text-[#1e3a5f]">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(
            {
              name: skill.title,
              catalogId: skill.catalogId,
              version: skill.version,
              tags: skill.tags,
              pricing: { license: skill.priceMonthly },
            },
            null,
            2,
          )}
        </pre>
      </div>
    ),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-28 text-[#0f1222]">
      <header className="sticky top-0 z-20 border-b border-[#eceef5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-4 py-3 md:px-6">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight"
          >
            AlSync
          </Link>
          <nav className="order-3 flex w-full items-center gap-6 text-sm text-[#5c6178] md:order-none md:w-auto md:gap-7">
            <Link
              href="/explore"
              className="border-b-2 border-[#2563eb] pb-0.5 font-medium text-[#0f1222]"
            >
              Explore
            </Link>
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
          </nav>
          <div className="relative ml-auto min-w-0 flex-1 md:max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#8b90a3]">
              &gt;_
            </span>
            <input
              type="search"
              placeholder="Search skills..."
              className="h-9 w-full rounded-lg border border-[#e8eaf2] bg-[#f5f6fa] py-2 pl-10 pr-3 text-sm outline-none placeholder:text-[#9aa0b5]"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              className="text-[#5c6178]"
              aria-label="Terminal"
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
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              type="button"
              className="relative text-[#5c6178]"
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
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-6">
        <p className="font-mono text-[10px] tracking-[0.14em] text-[#9aa0b5]">
          MARKET &gt; {skill.categoryPack} &gt; [SKILL_ID: {skill.catalogId}]
        </p>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {skill.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#5c6178]">
              {skill.longDescription}
            </p>
          </div>
          <div className="shrink-0 border border-[#eceef5] bg-[#fafbff] p-6 lg:min-w-[240px]">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9aa0b5]">
              CURRENT LICENSE
            </p>
            <p className="mt-2 text-2xl font-semibold">{skill.priceMonthly}</p>
            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 border border-black bg-black py-3 text-xs font-semibold tracking-[0.15em] text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 2s3 6 3 10a3 3 0 11-6 0c0-4 3-10 3-10z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14h4M8 18l2-2m4 0l2 2"
                />
              </svg>
              DEPLOY SKILL
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-8 lg:flex-row">
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <div className="border border-[#eceef5] p-4">
              <div className="flex items-start justify-between">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ STATUS ]
                </p>
                <span className="rounded border border-[#bbf7d0] bg-[#ecfdf3] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
                  OK
                </span>
              </div>
              <ul className="mt-4 space-y-2 font-mono text-xs text-[#3d4459]">
                <li>Ver: {skill.version}</li>
                <li>Last Sync: {skill.lastSync}</li>
                <li className="flex items-center gap-1">
                  Auth:{" "}
                  <svg
                    className="h-3.5 w-3.5 text-[#2563eb]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
              </ul>
            </div>

            <div className="border border-[#eceef5] p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ TELEMETRY ]
              </p>
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <div className="mb-1 flex justify-between text-[#5c6178]">
                    <span>Lines of Code</span>
                    <span className="font-mono">
                      {skill.telemetry.linesOfCode.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar value={locPct} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[#5c6178]">
                    <span>Token Efficiency</span>
                    <span className="font-mono">
                      {skill.telemetry.tokenEfficiency}%
                    </span>
                  </div>
                  <ProgressBar value={tokenPct} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[#5c6178]">
                    <span>Latency Peak</span>
                    <span className="font-mono">
                      {skill.telemetry.latencyPeakMs}ms
                    </span>
                  </div>
                  <ProgressBar value={latencyPct} />
                </div>
              </div>
            </div>

            <div className="border border-[#eceef5] p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ ORIGIN ]
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span
                  className="h-10 w-10 shrink-0 rounded border border-[#e8eaf2]"
                  style={{ backgroundColor: skill.avatar }}
                />
                <div>
                  <p className="text-sm font-medium">{skill.authorDisplay}</p>
                  <p className="font-mono text-xs text-[#8b90a3]">
                    {skill.wallet}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 border border-[#eceef5] bg-[#fafbff]">
            <div className="flex flex-wrap border-b border-[#eceef5] bg-white">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-4 py-3 font-mono text-xs ${
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
              <div className="w-full shrink-0 border-b border-[#eceef5] bg-white p-4 font-mono text-xs text-[#5c6178] md:w-52 md:border-b-0 md:border-r">
                <p className="mb-3 text-[10px] tracking-wide text-[#b4b8c9]">
                  src /
                </p>
                <ul className="space-y-1">
                  {TABS.map((file) => (
                    <li key={file}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(file)}
                        className={`w-full rounded px-2 py-1 text-left hover:bg-[#f5f6fa] ${
                          activeTab === file
                            ? "bg-[#eef2ff] text-[#1d4ed8]"
                            : ""
                        }`}
                      >
                        {file}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveTab("skills.md")}
                      className="w-full rounded px-2 py-1 text-left font-mono text-xs text-[#5c6178] hover:bg-[#f5f6fa]"
                    >
                      run.sh
                    </button>
                  </li>
                </ul>
                <p className="mb-3 mt-4 text-[10px] tracking-wide text-[#b4b8c9]">
                  tests /
                </p>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1 text-left font-mono text-xs text-[#5c6178] hover:bg-[#f5f6fa]"
                >
                  mock_data.json
                </button>
              </div>
              <div className="min-h-[320px] flex-1 bg-white p-6">
                {tabBody[activeTab]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1e2a4a] bg-[#0f172a] px-4 py-3 text-white shadow-[0_-8px_30px_rgba(15,23,42,0.35)] md:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] tracking-[0.12em] text-[#94a3b8]">
            <span>COMPUTE COST: {skill.computePerReq}</span>
            <span>GLOBAL INSTALLS: {skill.globalInstalls}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="border border-white/40 bg-transparent px-4 py-2 text-xs font-semibold tracking-wide text-white hover:bg-white/10"
            >
              Fork Logic
            </button>
            <button
              type="button"
              className="bg-[#2563eb] px-4 py-2 text-xs font-semibold tracking-wide text-white hover:bg-[#1d4ed8]"
            >
              Buy License [OK]
            </button>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#eceef5] py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 font-mono text-[10px] text-[#9aa0b5] sm:flex-row md:px-6">
          <span>AISYNC_SYSTEM_V1.0.42 © 2024</span>
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
              API ACCESS
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#5c6178]"
            >
              TERMS OF SERVICE
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

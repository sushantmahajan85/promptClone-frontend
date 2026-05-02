"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import type { SkillRecord } from "@/lib/skill-registry";

type TabId = "skills.md" | "handler.js" | "config.json";

const TABS: TabId[] = ["skills.md", "handler.js", "config.json"];

export function SkillDetailView({ skill }: Readonly<{ skill: SkillRecord }>) {
  const [activeTab, setActiveTab] = useState<TabId>("skills.md");

  const tabBody: Record<TabId, ReactNode> = {
    "skills.md": (
      <div className="space-y-6 text-sm leading-7 text-[#3d4459]">
        <h2 className="text-lg font-semibold text-[#0f1222]">
          # Skill Documentation
        </h2>
        <p>
          This logic block exposes a stable <code className="font-mono text-xs">SkillKart.Skill</code>{" "}
          contract for <strong>{skill.title}</strong>. Use it to chain prompts,
          validate tool outputs, and preserve latency budgets in production.
        </p>
        <div className="rounded-lg border border-[#d6e4ff] bg-[#f0f6ff] p-4 font-mono text-xs leading-6 text-[#1e3a5f]">
          <pre className="whitespace-pre-wrap">
            {`const skill = new SkillKart.Skill({
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
          Typical cold-start targets apply on the standard runtime tier.
        </p>
      </div>
    ),
    "handler.js": (
      <div className="font-mono text-xs leading-6 text-[#1e3a5f]">
        <pre className="whitespace-pre-wrap">
          {`import { defineHandler } from "@skillkart/runtime";

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
              supportedAgents: skill.supportedAgents,
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
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 md:flex-row md:flex-wrap md:items-center md:gap-x-4 md:px-6 lg:flex-nowrap">
          <div className="flex items-center justify-between gap-3">
            <BrandLogo className="shrink-0" />
            <div className="flex shrink-0 items-center gap-3 md:hidden">
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
              <div
                className="h-8 w-8 shrink-0 rounded-full border border-[#d9dce7] bg-[#e8eaf2]"
                aria-hidden
              />
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
            <div
              className="h-8 w-8 shrink-0 rounded-full border border-[#d9dce7] bg-[#e8eaf2]"
              aria-hidden
            />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-6">
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
            {skill.catalogId}
          </span>
        </nav>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {skill.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#5c6178]">
              {skill.longDescription}
            </p>
          </div>
          <div className="w-full shrink-0 border border-[#eceef5] bg-[#fafbff] p-5 sm:p-6 lg:min-w-[240px] lg:w-auto">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9aa0b5]">
              DEPLOYMENT
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5c6178]">
              Push this module to your connected runtime when you are ready.
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

        <div className="mt-12 flex flex-col gap-8 lg:flex-row">
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <div className="border border-[#eceef5] p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ SUPPORTED AGENTS ]
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#5c6178]">
                This skill is validated for use with the following agent
                platforms.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {skill.supportedAgents.map((agent) => (
                  <li key={agent}>
                    <span className="inline-block border border-[#d6e4ff] bg-[#f4f8ff] px-2.5 py-1 font-mono text-[11px] font-medium text-[#1d4ed8]">
                      {agent}
                    </span>
                  </li>
                ))}
              </ul>
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
                    {skill.author}
                  </p>
                </div>
              </div>
            </div>
          </aside>

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
              <div className="min-h-[280px] flex-1 bg-white p-4 sm:min-h-[320px] sm:p-6">
                {tabBody[activeTab]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1e2a4a] bg-[#0f172a] px-4 py-3 text-white shadow-[0_-8px_30px_rgba(15,23,42,0.35)] md:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.1em] text-[#94a3b8] sm:justify-start sm:gap-x-8 sm:tracking-[0.12em]">
          <span>COMPUTE COST: {skill.computePerReq}</span>
          <span>GLOBAL INSTALLS: {skill.globalInstalls}</span>
        </div>
      </div>

      <footer className="border-t border-[#eceef5] py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 font-mono text-[10px] text-[#9aa0b5] sm:flex-row md:px-6">
          <span>SKILLKART_SYSTEM_V1.0.42 © 2024</span>
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

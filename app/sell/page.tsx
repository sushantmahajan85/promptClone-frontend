"use client";

import { BrandLogo } from "@/components/brand-logo";
import { NavAuth } from "@/components/nav-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { listingsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const STEPS = [
  { id: 1, label: "DETAILS" },
  { id: 2, label: "REVIEW" },
] as const;

const AGENT_OPTIONS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Microsoft Copilot",
  "Perplexity",
  "Cursor Agent",
  "GitHub Copilot Agent",
  "Meta AI",
  "Grok",
  "Mistral Le Chat",
] as const;

function stepCircleClasses(active: boolean, done: boolean): string {
  if (active) return "bg-black text-white";
  if (done) return "bg-[#e8eaf2] text-[#0f1222]";
  return "bg-[#f3f4f6] text-[#9ca3af]";
}

export default function SellPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const uploadFieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [skillName, setSkillName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [supportedAgents, setSupportedAgents] = useState<string[]>([]);
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const agentPickerRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishedId, setPublishedId] = useState("");

  const previewTitle = skillName.trim() || "Vision Parser Pro";
  const priceCents = Math.round(parseFloat(priceInput || "0") * 100);

  const onBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const addTag = useCallback(() => {
    const normalized = tagsInput.trim().replaceAll(/\s+/g, " ");
    if (!normalized) return;
    const exists = tags.some(
      (tag) => tag.toLowerCase() === normalized.toLowerCase(),
    );
    if (!exists) {
      setTags((prev) => [...prev, normalized]);
    }
    setTagsInput("");
  }, [tags, tagsInput]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  const addSupportedAgent = useCallback((agent: string) => {
    setSupportedAgents((prev) =>
      prev.includes(agent) ? prev : [...prev, agent],
    );
  }, []);

  const removeSupportedAgent = useCallback((agent: string) => {
    setSupportedAgents((prev) => prev.filter((a) => a !== agent));
  }, []);

  const handleFilePicked = useCallback((file: File | undefined | null) => {
    if (file) setSelectedFile(file);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setPublishError("");
    setPublishing(true);
    try {
      const { listing } = await listingsApi.create(token, {
        title: skillName.trim() || "Untitled Skill",
        shortDescription: shortDescription.trim(),
        price: priceCents,
        pricingModel: "one-time",
        llmCompatibility: supportedAgents,
        tags,
        status: "draft",
      });
      if (selectedFile) {
        await listingsApi.upload(token, listing._id, selectedFile);
      }
      await listingsApi.update(token, listing._id, { status: "pending-review" });
      setPublishedId(listing.listingHashId);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }, [
    token,
    router,
    skillName,
    shortDescription,
    priceCents,
    supportedAgents,
    tags,
    selectedFile,
  ]);

  useEffect(() => {
    if (!agentMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = agentPickerRef.current;
      if (el && !el.contains(e.target as Node)) {
        setAgentMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [agentMenuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <header className="sticky top-0 z-20 border-b border-[#eceef5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:justify-between md:px-6">
          <BrandLogo className="shrink-0" />
          <nav className="order-3 flex w-full min-w-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#eef0f8] pt-3 text-sm text-[#5c6178] md:order-none md:w-auto md:flex-1 md:justify-center md:border-0 md:pt-0 md:gap-8">
            <Link href="/explore" className="hover:text-[#0f1222]">
              Explore
            </Link>
            <span className="border-b-2 border-[#2563eb] pb-0.5 font-medium text-[#0f1222]">
              Sell
            </span>
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
          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            <NavAuth />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:py-10 md:px-6">
        <p className="break-all font-mono text-[11px] tracking-wide text-[#2563eb] sm:text-xs">
          [ TRANSACTION: 0X82_UPLOAD ]
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          Upload New Skill
        </h1>
        <p className="mt-2 text-sm text-[#5c6178]">
          Convert your local logic into a portable AI skill primitive.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10 sm:gap-6 md:gap-10">
          {STEPS.map((s) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${stepCircleClasses(active, done)}`}
                >
                  {String(s.id).padStart(2, "0")}
                </span>
                <span
                  className={`font-mono text-xs tracking-[0.14em] ${
                    active ? "font-semibold text-[#0f1222]" : "text-[#9ca3af]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0 border border-[#e5e7eb] bg-[#fafafa] p-4 sm:p-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ METADATA ]
              </p>
              <label className="mt-4 block">
                <span className="text-[10px] font-bold tracking-[0.12em] text-[#6b7280]">
                  SKILL NAME
                </span>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. vision_parser_pro_"
                  className="mt-2 w-full border border-[#e5e7eb] bg-white px-3 py-2.5 font-mono text-sm text-[#0f1222] outline-none placeholder:text-[#b4b8c9] focus:border-[#2563eb]/50"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[10px] font-bold tracking-[0.12em] text-[#6b7280]">
                  SHORT DESCRIPTION
                </span>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One-line summary of what this skill does"
                  className="mt-2 w-full border border-[#e5e7eb] bg-white px-3 py-2.5 font-mono text-sm text-[#0f1222] outline-none placeholder:text-[#b4b8c9] focus:border-[#2563eb]/50"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[10px] font-bold tracking-[0.12em] text-[#6b7280]">
                  PRICE (USD)
                </span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#9aa0b5]">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-[#e5e7eb] bg-white py-2.5 pl-7 pr-3 font-mono text-sm text-[#0f1222] outline-none placeholder:text-[#b4b8c9] focus:border-[#2563eb]/50"
                  />
                </div>
              </label>
              <label className="mt-4 block">
                <span className="text-[10px] font-bold tracking-[0.12em] text-[#6b7280]">
                  TAGS
                </span>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                  className="mt-2 w-full border border-[#e5e7eb] bg-white px-3 py-2.5 font-mono text-sm text-[#0f1222] outline-none placeholder:text-[#b4b8c9] focus:border-[#2563eb]/50"
                />
                <p className="mt-1 text-[11px] text-[#9aa0b5]">
                  Press Enter to add each tag.
                </p>
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="inline-flex items-center gap-1 border border-[#d6e4ff] bg-[#f4f8ff] px-2.5 py-1 font-mono text-[11px] text-[#1d4ed8]"
                        aria-label={`Remove tag ${tag}`}
                      >
                        {tag}
                        <span aria-hidden>×</span>
                      </button>
                    ))}
                  </div>
                )}
              </label>
              <div className="mt-4">
                <span
                  id={`${uploadFieldId}-agents-label`}
                  className="text-[10px] font-bold tracking-[0.12em] text-[#6b7280]"
                >
                  SUPPORTED AGENTS
                </span>
                <div ref={agentPickerRef} className="relative mt-2">
                  <div className="flex min-h-[2.75rem] w-full items-stretch border border-[#e5e7eb] bg-white focus-within:border-[#2563eb]/50">
                    <button
                      type="button"
                      id={`${uploadFieldId}-agents-trigger`}
                      aria-labelledby={`${uploadFieldId}-agents-label ${uploadFieldId}-agents-trigger`}
                      aria-haspopup="menu"
                      aria-controls={`${uploadFieldId}-agents-menu`}
                      aria-expanded={agentMenuOpen}
                      onClick={() => setAgentMenuOpen((open) => !open)}
                      className="min-w-0 flex-1 px-3 py-2.5 text-left font-mono text-sm outline-none"
                    >
                      <span className="text-[#b4b8c9]">
                        Select agents from the list
                      </span>
                    </button>
                    {supportedAgents.length > 0 ? (
                      <button
                        type="button"
                        className="shrink-0 border-l border-[#e5e7eb] px-2.5 font-mono text-base leading-none text-[#9aa0b5] hover:bg-[#f9fafb] hover:text-[#0f1222]"
                        aria-label="Clear all agents"
                        onClick={() => {
                          setSupportedAgents([]);
                          setAgentMenuOpen(false);
                        }}
                      >
                        ×
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="shrink-0 border-l border-[#e5e7eb] px-2.5 text-[#9aa0b5] hover:bg-[#f9fafb]"
                      aria-label={agentMenuOpen ? "Close agents list" : "Open agents list"}
                      onClick={() => setAgentMenuOpen((open) => !open)}
                    >
                      <svg
                        className={`mx-auto h-4 w-4 transition-transform ${agentMenuOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                  {agentMenuOpen ? (
                    <div
                      id={`${uploadFieldId}-agents-menu`}
                      role="menu"
                      aria-label="Supported agents"
                      className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto border border-[#e5e7eb] bg-white py-1 shadow-[0_10px_40px_rgba(15,18,34,0.12)]"
                    >
                      {AGENT_OPTIONS.map((agent) => {
                        const alreadyAdded =
                          supportedAgents.includes(agent);
                        return (
                          <button
                            key={agent}
                            type="button"
                            role="menuitem"
                            disabled={alreadyAdded}
                            aria-current={
                              alreadyAdded ? "true" : undefined
                            }
                            className={`w-full px-3 py-2.5 text-left font-mono text-sm ${
                              alreadyAdded
                                ? "cursor-not-allowed bg-[#fafafa] text-[#b4b8c9]"
                                : "text-[#0f1222] hover:bg-[#f5f6fa]"
                            }`}
                            onClick={() => {
                              if (alreadyAdded) return;
                              addSupportedAgent(agent);
                            }}
                          >
                            {alreadyAdded ? `${agent} (added)` : agent}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                {supportedAgents.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {supportedAgents.map((agent) => (
                      <button
                        key={agent}
                        type="button"
                        onClick={() => removeSupportedAgent(agent)}
                        className="inline-flex items-center gap-1 border border-[#d6e4ff] bg-[#f4f8ff] px-2.5 py-1 font-mono text-[11px] text-[#1d4ed8]"
                        aria-label={`Remove agent ${agent}`}
                      >
                        {agent}
                        <span aria-hidden>×</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <p className="mt-1 text-[11px] text-[#9aa0b5]">
                  Open the list and click agents to add them. Selected agents
                  appear below—click × on a chip to remove.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ ARTIFACTS ]
                </p>
                <span className="font-mono text-[10px] text-[#9aa0b5]">
                  MAX_SIZE: 50MB
                </span>
              </div>
              <input
                id={uploadFieldId}
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".zip,.md,application/zip"
                onChange={(e) => handleFilePicked(e.target.files?.[0])}
              />
              <section
                aria-label="Skill artifact drop zone"
                className={`mt-4 border-2 border-dashed transition-colors ${
                  dragOver
                    ? "border-[#2563eb] bg-[#eff6ff]"
                    : "border-[#d1d5db] bg-white"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFilePicked(e.dataTransfer.files?.[0]);
                }}
              >
                <label
                  htmlFor={uploadFieldId}
                  className="flex cursor-pointer flex-col items-center justify-center px-6 py-12"
                >
                  <svg
                    className="h-10 w-10 text-[#9ca3af]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.25}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <p className="mt-4 text-sm font-medium text-[#374151]">
                    Drop your skill folder here
                  </p>
                  <p className="mt-1 max-w-sm text-center text-xs leading-relaxed text-[#6b7280]">
                    Drag &amp; drop the .zip or folder containing your logic,
                    config, and manifest.
                  </p>
                  {selectedFile && (
                    <p className="mt-3 font-mono text-[11px] text-[#16a34a]">
                      ✓ {selectedFile.name}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onBrowseClick();
                    }}
                    className="mt-6 border border-black bg-black px-5 py-2.5 text-xs font-semibold tracking-[0.12em] text-white"
                  >
                    BROWSE LOCAL
                  </button>
                </label>
              </section>
            </div>

            <div className="mt-6 flex flex-col gap-2 border border-[#e5e7eb] bg-white px-3 py-3 text-xs text-[#4b5563] sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-4">
              <svg
                className="h-4 w-4 shrink-0 text-[#16a34a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-mono font-semibold tracking-wide text-[#0f1222]">
                SKILLS.MD DETECTED
              </span>
              <span className="text-[#9ca3af]">|</span>
              <span className="font-mono text-[11px] text-[#6b7280]">
                PARSING DOCUMENTATION MANIFEST...
              </span>
              <span className="font-mono text-[11px] text-[#9ca3af] sm:ml-auto">
                8.2 KB
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5">
                <span className="font-mono text-[11px] tracking-wide text-[#6b7280]">
                  PREVIEW: SKILLS.MD
                </span>
                <div className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                </div>
              </div>
              <div className="max-h-[340px] overflow-y-auto p-5 font-mono text-xs leading-relaxed text-[#374151]">
                <h2 className="text-base font-semibold text-[#111827]">
                  # {previewTitle}
                </h2>
                <blockquote className="mt-3 border-l-2 border-[#2563eb] pl-3 text-[#6b7280]">
                  &gt; A high-performance skill for extracting structured data
                  from multimodal inputs with schema-safe outputs.
                </blockquote>
                <h3 className="mt-6 font-semibold text-[#111827]">## Inputs</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[#4b5563]">
                  <li>
                    <code className="rounded bg-[#f3f4f6] px-1">raw_payload</code>{" "}
                    — JSON or binary frame
                  </li>
                  <li>
                    <code className="rounded bg-[#f3f4f6] px-1">schema_id</code>{" "}
                    — registry reference
                  </li>
                </ul>
                <h3 className="mt-6 font-semibold text-[#111827]">## Usage</h3>
                <pre className="mt-3 overflow-x-auto rounded-md border border-[#e5e7eb] bg-[#f8fafc] p-3 text-[11px] text-[#1e3a5f]">
                  {`import { loadSkill } from "@skillkart/sdk";

const skill = await loadSkill("${previewTitle.toLowerCase().replaceAll(/\s+/g, "_")}");
const out = await skill.run({ raw_payload, schema_id });`}
                </pre>
              </div>
              <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 font-mono text-[10px] text-[#9ca3af]">
                <span className="flex items-center gap-2" aria-hidden>
                  <span className="text-[#6b7280]">&lt;&gt;</span>
                  <span className="text-[#6b7280]">{"{}"}</span>
                </span>
                <span className="tracking-wide text-[#16a34a]">
                  DOCS_AUTO_VALIDATED: OK
                </span>
              </div>
            </div>
          </div>
        </div>
        )}

        {step === 1 && (
          <div className="mt-8 flex justify-stretch sm:justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full border border-black bg-black px-6 py-3 text-sm font-semibold tracking-wide text-white hover:bg-[#1a1d2e] sm:w-auto sm:px-8"
            >
              NEXT: REVIEW →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-10 max-w-2xl border border-[#e5e7eb] bg-[#fafafa] p-5 sm:mt-12 sm:p-8">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
              [ REVIEW ]
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Confirm before publish
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5c6178]">
              Your skill stays private until you publish. Double-check the
              metadata and artifact summary below.
            </p>
            {publishedId ? (
              <div className="mt-8 border border-[#d1fae5] bg-[#ecfdf5] p-6 text-center">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#16a34a]">
                  [ PUBLISHED ]
                </p>
                <p className="mt-2 text-lg font-semibold text-[#0f1222]">
                  Skill submitted for review
                </p>
                <p className="mt-2 text-sm text-[#5c6178]">
                  Your listing{" "}
                  <span className="font-mono text-[#0f1222]">
                    #{publishedId}
                  </span>{" "}
                  is now pending review. It will become visible once approved.
                </p>
                <Link
                  href="/explore"
                  className="mt-6 inline-block border border-black bg-black px-6 py-2.5 text-sm font-semibold text-white"
                >
                  Back to Marketplace
                </Link>
              </div>
            ) : (
              <>
                <dl className="mt-8 space-y-4 border-t border-[#e5e7eb] pt-6 text-sm">
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      SKILL NAME
                    </dt>
                    <dd className="mt-1 font-mono text-[#0f1222]">
                      {skillName.trim() || "— (not set)"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      SHORT DESCRIPTION
                    </dt>
                    <dd className="mt-1 text-[#3d4459]">
                      {shortDescription.trim() || "— (not set)"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      PRICE
                    </dt>
                    <dd className="mt-1 font-mono text-[#0f1222]">
                      {priceInput ? `$${parseFloat(priceInput).toFixed(2)}` : "— (not set)"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      FILE
                    </dt>
                    <dd className="mt-1 font-mono text-[#3d4459]">
                      {selectedFile ? selectedFile.name : "— (no file selected)"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      TAGS
                    </dt>
                    <dd className="mt-1 text-[#3d4459]">
                      {tags.length > 0 ? tags.join(", ") : "— (not set)"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      SUPPORTED AGENTS
                    </dt>
                    <dd className="mt-1 text-[#3d4459]">
                      {supportedAgents.length > 0
                        ? supportedAgents.join(", ")
                        : "— (not set)"}
                    </dd>
                  </div>
                </dl>

                {publishError && (
                  <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                    {publishError}
                  </p>
                )}

                {!authLoading && !user && (
                  <p className="mt-4 border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    You must{" "}
                    <Link href="/auth/login" className="font-medium underline">
                      sign in
                    </Link>{" "}
                    to publish a skill.
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full border border-[#e5e7eb] bg-white px-6 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] sm:w-auto"
                  >
                    ← Back to details
                  </button>
                  <button
                    type="button"
                    disabled={publishing || (!authLoading && !user)}
                    onClick={handlePublish}
                    className="w-full border border-black bg-black px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
                  >
                    {publishing ? "Publishing…" : "Publish to registry"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-[#eceef5] py-4">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-4 font-mono text-[10px] uppercase tracking-wide text-[#9aa0b5] sm:flex-row md:px-6">
          <span>SKILLKART_SYSTEM_V1.0.42</span>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#6b7280]"
            >
              STATUS: OK
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#6b7280]"
            >
              CHANGELOG
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#6b7280]"
            >
              API ACCESS
            </button>
            <button
              type="button"
              className="bg-transparent p-0 hover:text-[#6b7280]"
            >
              TERMS OF SERVICE
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

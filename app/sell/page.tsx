"use client";

import { AppNavbar } from "@/components/app-navbar";
import { zipSync } from "fflate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { type ListingCategoryOption, listingsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { FALLBACK_LISTING_CATEGORIES } from "@/lib/explore-categories";

const STEPS = [
  { id: 1, label: "DETAILS" },
  { id: 2, label: "DEMO" },
  { id: 3, label: "REVIEW" },
] as const;

/** Max size per demo media file (images + walkthrough video). */
const DEMO_MEDIA_MAX_BYTES = 10 * 1024 * 1024;

function isMp4DemoVideo(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp4")) return true;
  return file.type === "video/mp4";
}

function isLikelyVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|mkv|avi|m4v|wmv)$/i.test(file.name);
}

function validateDemoMediaFile(file: File): string | null {
  if (file.size > DEMO_MEDIA_MAX_BYTES) {
    return `${file.name} exceeds the 10MB limit for demo media.`;
  }
  if (file.type.startsWith("image/")) return null;
  if (isLikelyVideoFile(file)) {
    return isMp4DemoVideo(file)
      ? null
      : `${file.name}: only MP4 video is allowed for walkthroughs (not ${file.type || "this format"}).`;
  }
  return `${file.name}: use images or an MP4 video for demo media.`;
}

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

function uploadCategoryChipClass(selected: boolean, disabled: boolean): string {
  const base =
    "rounded-full border px-3 py-1.5 text-left text-[11px] font-medium transition-colors ";
  if (selected) return `${base}border-black bg-black text-white`;
  if (disabled) {
    return `${base}cursor-not-allowed border-[#eceef5] bg-[#f9fafb] text-[#c5c9d6]`;
  }
  return `${base}border-[#e5e7eb] bg-white text-[#374151] hover:border-[#cbd5e1]`;
}

export function UploadSkillPage() {
  const { token, user, loading: authLoading } = useAuth();
  const uploadFieldId = useId();
  const demoMediaFieldId = useId();
  const previewImageFieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const demoMediaInputRef = useRef<HTMLInputElement>(null);
  const previewImageInputRef = useRef<HTMLInputElement>(null);
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
  const [folderName, setFolderName] = useState("");
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [skillsMdContent, setSkillsMdContent] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [demoMediaFiles, setDemoMediaFiles] = useState<File[]>([]);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ListingCategoryOption[]>([
    ...FALLBACK_LISTING_CATEGORIES,
  ]);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishedId, setPublishedId] = useState("");

  const previewTitle = skillName.trim() || "Vision Parser Pro";
  const priceCents = Math.round(parseFloat(priceInput || "0") * 100);

  const onBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onBrowseDemoMediaClick = useCallback(() => {
    demoMediaInputRef.current?.click();
  }, []);

  const onBrowsePreviewImageClick = useCallback(() => {
    previewImageInputRef.current?.click();
  }, []);

  const toggleCategorySlug = useCallback((slug: string) => {
    setCategorySlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) return prev;
      return [...prev, slug];
    });
  }, []);

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

  const buildZip = useCallback(async (files: File[], rootName: string): Promise<File> => {
    const entries: Record<string, Uint8Array> = {};
    await Promise.all(
      files.map(async (f) => {
        const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath;
        // Use relative path if present, otherwise place directly under root folder
        const entryPath = rel ? rel : `${rootName}/${f.name}`;
        const buf = await f.arrayBuffer();
        entries[entryPath] = new Uint8Array(buf);
      }),
    );
    const zipped = zipSync(entries, { level: 6 });
    // Copy into a fresh Uint8Array backed by a plain ArrayBuffer (avoids
    // SharedArrayBuffer type mismatch with BlobPart in strict TypeScript).
    const safe = new Uint8Array(zipped.length);
    safe.set(zipped);
    const blob = new Blob([safe], { type: "application/zip" });
    return new File([blob], `${rootName}.zip`, { type: "application/zip" });
  }, []);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const firstFile = files[0] as File & { webkitRelativePath?: string };
    const relativePath = firstFile.webkitRelativePath ?? "";
    const displayName = relativePath ? relativePath.split("/")[0] : firstFile.name;
    setFolderName(displayName);
    setFolderFiles(files);

    const skillsMd = files.find((f) => {
      const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath ?? f.name;
      const filename = rel.split("/").pop() ?? rel;
      return filename.toLowerCase() === "skill.md";
    });

    if (skillsMd) {
      const text = await skillsMd.text();
      setSkillsMdContent(text);
    } else {
      setSkillsMdContent(null);
    }

    // If a pre-built zip exists in the selection use it directly;
    // otherwise we'll build one on publish from the raw file list.
    const existingZip = files.find((f) => f.name.toLowerCase().endsWith(".zip"));
    setUploadFile(existingZip ?? null);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!token) {
      globalThis.open("/auth/login", "_blank", "noopener,noreferrer");
      return;
    }
    if (categorySlugs.length === 0) {
      setPublishError("Select at least one category before publishing.");
      return;
    }
    if (!previewImageFile) {
      setPublishError("Add a preview image for the explore listing before publishing.");
      return;
    }
    if (demoMediaFiles.length === 0) {
      setPublishError("Attach at least one demo image or MP4 video before publishing.");
      return;
    }

    setPublishError("");
    setPublishing(true);
    try {
      const { listing } = await listingsApi.create(token, {
        title: skillName.trim() || "Untitled Skill",
        description: shortDescription.trim(),
        shortDescription: shortDescription.trim() || undefined,
        price: priceCents,
        pricingModel: "one-time",
        llmCompatibility: supportedAgents,
        tags,
        status: "draft",
        categories: categorySlugs.length > 0 ? categorySlugs : undefined,
      });

      // Determine the file to upload:
      // 1. Use a pre-selected zip if present
      // 2. Otherwise compress all folder files into a zip first
      let fileToUpload: File | null = uploadFile;
      if (!fileToUpload && folderFiles.length > 0) {
        fileToUpload = await buildZip(folderFiles, folderName || "skill");
      }

      if (fileToUpload) {
        await listingsApi.upload(token, listing._id, fileToUpload, previewImageFile, demoMediaFiles);
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
    skillName,
    shortDescription,
    priceCents,
    supportedAgents,
    tags,
    uploadFile,
    folderFiles,
    folderName,
    buildZip,
    demoMediaFiles,
    previewImageFile,
    categorySlugs,
  ]);

  useEffect(() => {
    const input = fileInputRef.current;
    if (input) {
      input.setAttribute("webkitdirectory", "");
      input.setAttribute("multiple", "");
    }
  }, []);

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

  const removeDemoMediaFile = useCallback((name: string) => {
    setDemoMediaFiles((prev) => prev.filter((file) => file.name !== name));
  }, []);

  const demoMediaPreviews = useMemo(
    () =>
      demoMediaFiles.map((file) => ({
        key: `${file.name}-${file.size}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    [demoMediaFiles],
  );

  useEffect(() => {
    return () => {
      demoMediaPreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [demoMediaPreviews]);

  const previewImageObjectUrl = useMemo(
    () => (previewImageFile ? URL.createObjectURL(previewImageFile) : null),
    [previewImageFile],
  );

  useEffect(() => {
    if (!previewImageObjectUrl) return;
    return () => URL.revokeObjectURL(previewImageObjectUrl);
  }, [previewImageObjectUrl]);

  const categoryLabelBySlug = useMemo(
    () => Object.fromEntries(categoryOptions.map((c) => [c.slug, c.label])),
    [categoryOptions],
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
        <AppNavbar activeTab="sell" maxWidthClass="max-w-[1200px]" />
        <main className="mx-auto flex w-full max-w-[900px] flex-1 items-center justify-center px-4 py-8 md:px-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <AppNavbar activeTab="sell" maxWidthClass="max-w-[1200px]" />

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
        <p className="mt-3 text-xs text-[#7a8097]">
          Route updated: this upload flow is now available at{" "}
          <span className="font-mono">/sell/upload</span>.
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

              <div className="mt-6 border-t border-[#e5e7eb] pt-6">
                <span className="text-[10px] font-bold tracking-[0.12em] text-[#6b7280]">
                  CATEGORIES
                </span>
                <p className="mt-1 text-[11px] leading-relaxed text-[#9aa0b5]">
                  Same taxonomy as Explore. Pick one primary category, or up to two if your skill
                  clearly spans two areas.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => {
                    const selected = categorySlugs.includes(cat.slug);
                    const disabled = !selected && categorySlugs.length >= 2;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleCategorySlug(cat.slug)}
                        className={uploadCategoryChipClass(selected, disabled)}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-[#9aa0b5]">
                  Selected: {categorySlugs.length}/2 ·{" "}
                  {categorySlugs.length === 0 ? "choose at least one to continue" : "OK"}
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
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    void processFiles(e.target.files);
                  }
                }}
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
                  if (e.dataTransfer.files.length > 0) {
                    void processFiles(e.dataTransfer.files);
                  }
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
                    Drag &amp; drop a folder containing your logic, config, and manifest.
                  </p>
                  {folderName && (
                    <p className="mt-3 font-mono text-[11px] text-[#16a34a]">
                      ✓ {folderName}
                      {folderFiles.length > 1 && (
                        <span className="ml-2 text-[#9aa0b5]">
                          ({folderFiles.length} files)
                        </span>
                      )}
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
                    BROWSE FOLDER
                  </button>
                </label>
              </section>
            </div>

            {skillsMdContent !== null && (
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
                  SKILL.MD DETECTED
                </span>
                <span className="text-[#9ca3af]">|</span>
                <span className="font-mono text-[11px] text-[#6b7280]">
                  PARSING DOCUMENTATION MANIFEST...
                </span>
                <span className="font-mono text-[11px] text-[#9ca3af] sm:ml-auto">
                  {(skillsMdContent.length / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5">
                <span className="font-mono text-[11px] tracking-wide text-[#6b7280]">
                  PREVIEW: SKILL.MD
                </span>
                <div className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#eab308]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                </div>
              </div>
              <div className="max-h-[340px] overflow-y-auto p-5 font-mono text-xs leading-relaxed text-[#374151]">
                {skillsMdContent !== null ? (
                  <pre className="whitespace-pre-wrap break-words text-[#374151]">
                    {skillsMdContent}
                  </pre>
                ) : (
                  <>
                    <h2 className="text-base font-semibold text-[#111827]">
                      # {previewTitle}
                    </h2>
                    <blockquote className="mt-3 border-l-2 border-[#2563eb] pl-3 text-[#6b7280]">
                      &gt; Select a folder containing a skills.md to preview its
                      documentation here.
                    </blockquote>
                    <h3 className="mt-6 font-semibold text-[#111827]">
                      ## Getting started
                    </h3>
                    <p className="mt-2 text-[#4b5563]">
                      Click{" "}
                      <span className="rounded bg-[#f3f4f6] px-1">
                        BROWSE FOLDER
                      </span>{" "}
                      or drag your skill folder into the drop zone.                       A{" "}
                      <span className="rounded bg-[#f3f4f6] px-1">
                        SKILL.md
                      </span>{" "}
                      file will be automatically detected and previewed here.
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 font-mono text-[10px] text-[#9ca3af]">
                <span className="flex items-center gap-2" aria-hidden>
                  <span className="text-[#6b7280]">&lt;&gt;</span>
                  <span className="text-[#6b7280]">{"{}"}</span>
                </span>
                <span className={`tracking-wide ${skillsMdContent !== null ? "text-[#16a34a]" : "text-[#9ca3af]"}`}>
                  {skillsMdContent !== null ? "DOCS_AUTO_VALIDATED: OK" : "AWAITING FOLDER..."}
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
              onClick={() => {
                if (!folderName && !uploadFile) {
                  setPublishError(
                    "Upload a skill zip or folder before continuing.",
                  );
                  return;
                }
                if (categorySlugs.length === 0) {
                  setPublishError("Select at least one category.");
                  return;
                }
                setPublishError("");
                setStep(2);
              }}
              className="w-full border border-black bg-black px-6 py-3 text-sm font-semibold tracking-wide text-white hover:bg-[#1a1d2e] sm:w-auto sm:px-8"
            >
              NEXT: DEMO MEDIA →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto mt-10 w-full max-w-2xl border border-[#e5e7eb] bg-[#fafafa] p-5 sm:mt-12 sm:p-8">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
              [ EXPLORE PREVIEW IMAGE ]
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Listing card image
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5c6178]">
              This image is shown on the Explore page as your skill&apos;s thumbnail—the first
              thing buyers see next to your title. Use a clear screenshot or branded graphic (not
              your walkthrough gallery).
            </p>
            <input
              id={previewImageFieldId}
              ref={previewImageInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !file.type.startsWith("image/")) return;
                setPreviewImageFile(file);
                e.currentTarget.value = "";
              }}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBrowsePreviewImageClick}
                className="border border-black bg-black px-4 py-2 text-[11px] font-semibold tracking-[0.12em] text-white"
              >
                CHOOSE PREVIEW IMAGE
              </button>
              {previewImageFile ? (
                <button
                  type="button"
                  onClick={() => setPreviewImageFile(null)}
                  className="text-xs font-medium text-[#6b7280] underline hover:text-[#111827]"
                >
                  Remove
                </button>
              ) : null}
            </div>
            {previewImageObjectUrl ? (
              <div className="mt-4 overflow-hidden border border-[#e5e7eb] bg-white">
                <img
                  src={previewImageObjectUrl}
                  alt="Explore listing preview"
                  className="aspect-[16/10] w-full max-h-56 object-cover"
                />
                <p className="truncate border-t border-[#e5e7eb] px-3 py-2 font-mono text-[11px] text-[#6b7280]">
                  {previewImageFile?.name}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-xs text-[#9aa0b5]">No preview image selected yet.</p>
            )}

            <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5] mt-10">
              [ DEMO MEDIA ]
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Add setup walkthrough media
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5c6178]">
              Attach at least one image or MP4 video that explains how to set up and use your skill.
              Each file must be 10MB or smaller.
            </p>
            <input
              id={demoMediaFieldId}
              ref={demoMediaInputRef}
              type="file"
              multiple
              accept="image/*,video/mp4,.mp4"
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length === 0) return;
                const next: File[] = [];
                const problems: string[] = [];
                for (const file of files) {
                  const err = validateDemoMediaFile(file);
                  if (err) problems.push(err);
                  else next.push(file);
                }
                if (problems.length > 0) {
                  const base = problems.slice(0, 3).join(" ");
                  setPublishError(
                    problems.length > 3 ? `${base} (+${problems.length - 3} more)` : base,
                  );
                } else {
                  setPublishError("");
                }
                if (next.length > 0) {
                  setDemoMediaFiles((prev) => [...prev, ...next]);
                }
                e.currentTarget.value = "";
              }}
            />
            <div className="mt-6 border border-dashed border-[#d1d5db] bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#4b5563]">
                  Upload walkthrough screenshots, GIFs, or MP4 videos (max 10MB each).
                </p>
                <button
                  type="button"
                  onClick={onBrowseDemoMediaClick}
                  className="border border-black bg-black px-4 py-2 text-[11px] font-semibold tracking-[0.12em] text-white"
                >
                  ADD MEDIA
                </button>
              </div>
              {demoMediaFiles.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {demoMediaPreviews.map((item) => (
                    <li
                      key={item.key}
                      className="border border-[#e5e7eb] bg-[#fafafa] p-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="truncate text-[#374151]">
                          {item.file.name}{" "}
                          <span className="text-[#9aa0b5]">
                            ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDemoMediaFile(item.file.name)}
                          className="shrink-0 text-[#6b7280] hover:text-[#111827]"
                          aria-label={`Remove ${item.file.name}`}
                        >
                          Remove
                        </button>
                      </div>

                      {item.file.type.startsWith("image/") && (
                        <img
                          src={item.previewUrl}
                          alt={`Preview for ${item.file.name}`}
                          className="mt-3 h-44 w-full border border-[#e5e7eb] object-cover"
                        />
                      )}

                      {item.file.type.startsWith("video/") && (
                        <video
                          controls
                          preload="metadata"
                          className="mt-3 h-44 w-full border border-[#e5e7eb] bg-black object-cover"
                        >
                          <source src={item.previewUrl} type={item.file.type} />
                          <track kind="captions" srcLang="en" label="English captions" />
                          Your browser does not support this video tag.
                        </video>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-xs text-[#9aa0b5]">
                  No demo media attached yet.
                </p>
              )}
            </div>
            {publishError && (
              <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                {publishError}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setPublishError("");
                  setStep(1);
                }}
                className="w-full border border-[#e5e7eb] bg-white px-6 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] sm:w-auto"
              >
                ← Back to details
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!previewImageFile) {
                    setPublishError("Add a preview image for the Explore listing before continuing.");
                    return;
                  }
                  if (demoMediaFiles.length === 0) {
                    setPublishError(
                      "Attach at least one demo image or MP4 video before continuing.",
                    );
                    return;
                  }
                  for (const f of demoMediaFiles) {
                    const err = validateDemoMediaFile(f);
                    if (err) {
                      setPublishError(err);
                      return;
                    }
                  }
                  setPublishError("");
                  setStep(3);
                }}
                className="w-full border border-black bg-black px-6 py-2.5 text-sm font-semibold text-white sm:w-auto"
              >
                NEXT: REVIEW →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto mt-10 w-full max-w-2xl border border-[#e5e7eb] bg-[#fafafa] p-5 sm:mt-12 sm:p-8">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
              [ REVIEW ]
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Confirm before publish
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5c6178]">
              Your skill stays private until you publish. Confirm everything from steps 1 and 2
              below.
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
                <p className="mt-8 border-t border-[#e5e7eb] pt-6 font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ STEP 1 — DETAILS &amp; ARTIFACT ]
                </p>
                <dl className="mt-4 space-y-4 text-sm">
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
                      CATEGORIES
                    </dt>
                    <dd className="mt-1 text-[#3d4459]">
                      {categorySlugs.length > 0
                        ? categorySlugs
                            .map((slug) => categoryLabelBySlug[slug] ?? slug)
                            .join(" · ")
                        : "— (not set)"}
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
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      FOLDER / ARTIFACT
                    </dt>
                    <dd className="mt-1 font-mono text-[#3d4459]">
                      {uploadFile
                        ? `ZIP: ${uploadFile.name}`
                        : folderName || "— (no folder selected)"}
                      {!uploadFile && folderFiles.length > 1 ? (
                        <span className="ml-2 text-[#9aa0b5]">
                          ({folderFiles.length} files)
                        </span>
                      ) : null}
                    </dd>
                  </div>
                </dl>

                <p className="mt-10 font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ STEP 2 — MEDIA ]
                </p>
                <dl className="mt-4 space-y-4 border-b border-[#e5e7eb] pb-6 text-sm">
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      EXPLORE PREVIEW IMAGE
                    </dt>
                    <dd className="mt-1 text-[#3d4459]">
                      {previewImageFile?.name ?? "— (not set)"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                      DEMO MEDIA
                    </dt>
                    <dd className="mt-1 text-[#3d4459]">
                      {demoMediaFiles.length > 0
                        ? `${demoMediaFiles.length} file(s): ${demoMediaFiles.map((f) => f.name).join(", ")}`
                        : "— (required)"}
                    </dd>
                  </div>
                </dl>

                {previewImageObjectUrl ? (
                  <div className="mt-6 border border-[#e5e7eb] bg-white p-4">
                    <p className="font-mono text-[10px] tracking-[0.16em] text-[#9aa0b5]">
                      [ PREVIEW IMAGE ]
                    </p>
                    <img
                      src={previewImageObjectUrl}
                      alt="Review: explore thumbnail"
                      className="mt-3 aspect-[16/10] w-full max-h-52 border border-[#e5e7eb] object-cover"
                    />
                  </div>
                ) : null}

                {demoMediaPreviews.length > 0 ? (
                  <div className="mt-6 border border-[#e5e7eb] bg-white p-4">
                    <p className="font-mono text-[10px] tracking-[0.16em] text-[#9aa0b5]">
                      [ DEMO MEDIA PREVIEW ]
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {demoMediaPreviews.map((item) => (
                        <div
                          key={`review-${item.key}`}
                          className="overflow-hidden border border-[#e5e7eb] bg-[#fafafa]"
                        >
                          {item.file.type.startsWith("image/") ? (
                            <img
                              src={item.previewUrl}
                              alt={`Review preview for ${item.file.name}`}
                              className="h-40 w-full object-cover"
                            />
                          ) : item.file.type.startsWith("video/") ? (
                            <video
                              controls
                              preload="metadata"
                              className="h-40 w-full bg-black object-cover"
                            >
                              <source src={item.previewUrl} type={item.file.type} />
                              <track kind="captions" srcLang="en" label="English captions" />
                              Your browser does not support this video tag.
                            </video>
                          ) : (
                            <div className="flex h-40 items-center justify-center px-3 text-xs text-[#6b7280]">
                              Preview unavailable for this file type.
                            </div>
                          )}
                          <p className="truncate border-t border-[#e5e7eb] px-2 py-2 text-[11px] text-[#4b5563]">
                            {item.file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {publishError && (
                  <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                    {publishError}
                  </p>
                )}

                {!authLoading && !user && (
                  <p className="mt-4 border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    You must{" "}
                    <Link
                      href="/auth/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline"
                    >
                      sign in
                    </Link>{" "}
                    to publish a skill.
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full border border-[#e5e7eb] bg-white px-6 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] sm:w-auto"
                  >
                    ← Back to demo media
                  </button>
                  <button
                    type="button"
                    disabled={publishing || (!authLoading && !user)}
                    onClick={handlePublish}
                    className="w-full border border-black bg-black px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
                  >
                    {publishing
                      ? folderFiles.length > 0 && !uploadFile
                        ? "Compressing…"
                        : "Publishing…"
                      : "Publish to registry"}
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

export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sell/upload");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
    </div>
  );
}

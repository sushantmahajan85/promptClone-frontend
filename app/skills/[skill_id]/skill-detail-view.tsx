"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { AppNavbar } from "@/components/app-navbar";
import { type ApiListing, formatBytes, formatPrice, listingsApi, paymentsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function SellerAvatar({
  name,
  avatarUrl,
}: Readonly<{ name: string; avatarUrl?: string }>) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-10 w-10 shrink-0 rounded border border-[#e8eaf2] object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#e8eaf2] text-sm font-semibold text-[#0f1222]">
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

const TEXT_EXTENSIONS =
  /\.(md|js|ts|tsx|jsx|json|py|txt|yaml|yml|sh|css|html|xml|toml|env|cfg|ini|rs|go|java|rb|php|swift|kt|c|cpp|h)$/i;

const isTextFile = (path: string) => TEXT_EXTENSIONS.test(path);
const isImageFile = (path: string) =>
  /\.(png|jpe?g|webp|gif|svg|ico)$/i.test(path);

export function SkillDetailView({
  listing: initialListing,
}: Readonly<{ listing: ApiListing }>) {
  const [listing, setListing] = useState<ApiListing>(initialListing);
  const [accessChecked, setAccessChecked] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const { token, user, loading: authLoading } = useAuth();

  // Dynamic file viewer state — seeded from manifest on first render
  const firstManifestFile =
    (initialListing.packageManifest?.files ?? []).filter((f) =>
      TEXT_EXTENSIONS.test(f.path)
    )[0]?.path ??
    (initialListing.packageManifest?.files ?? [])[0]?.path ??
    "";
  const [activeFile, setActiveFile] = useState<string>(firstManifestFile);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [fetchingFile, setFetchingFile] = useState<string | null>(null);

  const refreshListing = useCallback(() => {
    if (!token) return;
    listingsApi
      .get(initialListing._id, token)
      .then(({ listing: full }) => setListing(full))
      .catch(() => {/* keep current */});
  }, [token, initialListing._id]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setAccessChecked(true);
      return;
    }
    listingsApi
      .get(initialListing._id, token)
      .then(({ listing: full }) => {
        setListing(full);
        // Seed activeFile from the full manifest if we had no initial file
        const files = full.packageManifest?.files ?? [];
        if (files.length > 0) {
          const first =
            files.find((f) => TEXT_EXTENSIONS.test(f.path))?.path ??
            files[0].path;
          setActiveFile((prev) => (prev ? prev : first));
        }
      })
      .catch(() => {/* keep initial listing */})
      .finally(() => setAccessChecked(true));
  }, [token, authLoading, initialListing._id]);

  const fetchFileContent = useCallback(async (path: string, url: string) => {
    if (fileContents[path] !== undefined) return;
    setFetchingFile(path);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setFileContents((prev) => ({ ...prev, [path]: text }));
    } catch {
      setFileContents((prev) => ({ ...prev, [path]: `// Could not load ${path}` }));
    } finally {
      setFetchingFile(null);
    }
  }, [fileContents]);

  const handleFileSelect = useCallback((path: string) => {
    setActiveFile(path);
    const manifestFiles = listing.packageManifest?.files ?? [];
    const file = manifestFiles.find((f) => f.path === path);
    if (file && isTextFile(path)) {
      void fetchFileContent(path, file.url);
    }
  }, [listing.packageManifest?.files, fetchFileContent]);

  const handleBuyNowClick = () => {
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    setBuyError("");
    confirmDialogRef.current?.showModal();
  };

  const handleConfirmPurchase = async () => {
    if (!token) return;
    setBuying(true);
    setBuyError("");
    try {
      await paymentsApi.buy(token, listing._id);
      confirmDialogRef.current?.close();
      refreshListing();
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : "Purchase failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  const handleDownload = () => {
    const url = listing.packageZipUrl ?? listing.fileUrl;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  // API omits fileUrl for users without access.
  const hasAccess = accessChecked && !!listing.fileUrl;
  const isSeller = !!(user && listing.sellerId._id === user._id);

  // ─── Media derivations ────────────────────────────────────────────────────
  const manifestFiles = listing.packageManifest?.files ?? [];
  const demoMedia = listing.demoMedia ?? [];

  // Hero video: prefer explicitly uploaded demo video, then manifest video
  const demoVideos = demoMedia.filter((m) =>
    m.resourceType === "video" || /\.(mp4|webm|mov|m4v)$/i.test(m.name),
  );
  const manifestVideos = manifestFiles.filter((f) =>
    f.resourceType === "video" || /\.(mp4|webm|mov|m4v)$/i.test(f.path),
  );
  const primaryHeroVideo = demoVideos[0] ?? manifestVideos[0] ?? null;

  const demoImages = demoMedia.filter((m) =>
    m.resourceType === "image" || /\.(png|jpe?g|webp|gif|svg)$/i.test(m.name),
  );
  const manifestImages = manifestFiles.filter((f) =>
    f.resourceType === "image" || /\.(png|jpe?g|webp|gif|svg)$/i.test(f.path),
  );

  // ─── Dynamic file viewer ──────────────────────────────────────────────────
  // Build tab list from manifest text files (up to 5). No fake defaults.
  const manifestTextFiles = manifestFiles.filter((f) => isTextFile(f.path));
  const displayTabs = manifestTextFiles.slice(0, 5).map((f) => f.path);
  const fileTree = manifestFiles.map((f) => f.path);
  const hasPackage = manifestFiles.length > 0;

  // Resolve content for the active file
  const activeManifestFile = manifestFiles.find((f) => f.path === activeFile);

  let activeContent: string | null = null;
  if (fileContents[activeFile] !== undefined) {
    activeContent = fileContents[activeFile];
  }

  const hasNoMedia =
    !listing.coverImageUrl &&
    demoImages.length === 0 &&
    (demoVideos.length === 0 || (demoVideos.length === 1 && !!primaryHeroVideo)) &&
    manifestImages.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-white pb-28 text-[#0f1222]">
      {/* Confirm purchase dialog — NOTE: no display/flex classes on <dialog> itself
          to avoid Tailwind overriding the browser's native display:none when closed */}
      <dialog
        ref={confirmDialogRef}
        className="z-50 border-0 bg-transparent p-0 shadow-none backdrop:bg-black/45"
        style={{ maxWidth: "none", width: "100%", margin: 0, position: "fixed", inset: 0, minHeight: "100dvh" }}
        aria-labelledby="confirm-purchase-title"
        onCancel={(e) => { if (buying) e.preventDefault(); }}
        onClose={() => setBuyError("")}
      >
        <div className="flex min-h-[100dvh] w-full items-center justify-center p-4">
          <div className="relative w-full max-w-md border border-[#e5e7eb] bg-white p-5 shadow-[0_20px_50px_rgba(15,18,34,0.18)] sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">[ CONFIRM PURCHASE ]</p>
            <h2 id="confirm-purchase-title" className="mt-2 text-lg font-semibold tracking-tight text-[#0f1222]">
              {listing.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5c6178]">
              You are about to purchase this skill for a one-time payment of{" "}
              <span className="font-semibold text-[#0f1222]">{formatPrice(listing.price)}</span>.
              A transaction record will be created immediately.
            </p>
            {buyError && (
              <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {buyError}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={buying}
                onClick={() => { if (!buying) confirmDialogRef.current?.close(); }}
                className="w-full border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={buying}
                onClick={() => void handleConfirmPurchase()}
                className="w-full border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1d2e] disabled:opacity-60 sm:w-auto"
              >
                {buying ? "Processing…" : `Confirm — ${formatPrice(listing.price)}`}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <AppNavbar activeTab="explore" />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 md:px-6">
        {/* Breadcrumb */}
        <nav
          className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-[#9aa0b5] sm:tracking-[0.14em]"
          aria-label="Breadcrumb"
        >
          <Link href="/explore" className="text-[#5c6178] transition-colors hover:text-[#0f1222]">
            Explore
          </Link>
          <span className="text-[#c5c9d6]" aria-hidden>&gt;</span>
          <span
            aria-current="page"
            className="max-w-[min(100%,42rem)] truncate text-[#5c6178]"
            title={listing.title}
          >
            {listing.title}
          </span>
        </nav>

        {/* Hero video — first uploaded demo video (or first manifest video) */}
        {primaryHeroVideo ? (
          <section className="mt-6 overflow-hidden rounded-xl border border-[#1e293b] bg-black shadow-[0_20px_50px_rgba(15,18,34,0.18)]">
            <div className="relative aspect-video max-h-[min(72vh,820px)] w-full bg-[#0b0f1a]">
              <video
                className="h-full w-full object-contain"
                controls
                autoPlay
                muted
                playsInline
                loop
                preload="metadata"
              >
                <source
                  src={primaryHeroVideo.url}
                  type={
                    primaryHeroVideo.resourceType === "video"
                      ? "video/mp4"
                      : primaryHeroVideo.resourceType || "video/mp4"
                  }
                />
                <track kind="captions" srcLang="en" label="English captions" />
              </video>
            </div>
            <p className="border-t border-white/10 bg-[#0f1222] px-4 py-2.5 text-xs text-white/85">
              <span className="font-semibold text-white">Preview</span>
              <span className="text-white/60"> — see what this skill does before you buy.</span>
            </p>
          </section>
        ) : null}

        {/* Hero */}
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#5c6178]">
              {listing.description || listing.shortDescription}
            </p>
          </div>
          <div className="w-full shrink-0 border border-[#eceef5] bg-[#fafbff] p-5 sm:p-6 lg:min-w-[240px] lg:w-auto">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9aa0b5]">
              {hasAccess ? "DOWNLOAD" : isSeller ? "YOUR SKILL" : "BUY"}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatPrice(listing.price)}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5c6178]">
              {hasAccess
                ? "You have access. Download the skill folder and drop it into your agent or workflow."
                : isSeller
                ? "This is your listing. Buyers can download the full skill package after purchase."
                : "One-time purchase. After checkout you can download the full skill package."}
            </p>
            <button
              id="skill-purchase-btn"
              type="button"
              aria-label={hasAccess ? "Download skill" : `Buy Now for ${formatPrice(listing.price)}`}
              onClick={hasAccess ? handleDownload : isSeller ? undefined : handleBuyNowClick}
              disabled={isSeller && !hasAccess}
              className="mt-6 flex w-full items-center justify-center gap-2 border border-black bg-black py-3 text-xs font-semibold tracking-[0.15em] text-white hover:bg-[#1a1d2e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasAccess ? (
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              ) : (
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
              )}
              {hasAccess ? "Download skill" : isSeller ? "Your listing" : "Buy Now"}
            </button>
          </div>
        </div>

        {/* Demo Walkthrough — uses demoMedia uploaded by seller + cover image */}
        <section className="mt-8 border border-[#eceef5] bg-[#fafbff] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ DEMO WALKTHROUGH ]
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[#0f1222]">
                Setup and usage preview
              </h2>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Cover image */}
            {listing.coverImageUrl && (
              <article className="overflow-hidden border border-[#e5e7eb] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.coverImageUrl}
                  alt={`${listing.title} cover`}
                  className="h-52 w-full object-cover"
                />
                <p className="border-t border-[#e5e7eb] px-3 py-2 text-xs text-[#6b7280]">
                  Cover preview
                </p>
              </article>
            )}

            {/* Remaining demo videos (first was used as hero) */}
            {demoVideos.slice(1).map((media) => (
              <article key={media.url} className="overflow-hidden border border-[#e5e7eb] bg-white">
                <video controls preload="metadata" className="h-52 w-full bg-black object-contain">
                  <source src={media.url} type="video/mp4" />
                  <track kind="captions" srcLang="en" label="English captions" />
                  Your browser does not support this video tag.
                </video>
                <p className="border-t border-[#e5e7eb] px-3 py-2 text-xs text-[#6b7280]">
                  {media.name || "Demo video"}
                </p>
              </article>
            ))}

            {/* Demo images uploaded by seller */}
            {demoImages.map((media) => (
              <article key={media.url} className="overflow-hidden border border-[#e5e7eb] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url}
                  alt={media.name || `${listing.title} demo`}
                  className="h-52 w-full object-cover"
                />
                <p className="border-t border-[#e5e7eb] px-3 py-2 text-xs text-[#6b7280]">
                  {media.name || "Demo screenshot"}
                </p>
              </article>
            ))}

            {/* Fallback: images from zip manifest */}
            {demoImages.length === 0 &&
              manifestImages.map((file) => (
                <article key={file.path} className="overflow-hidden border border-[#e5e7eb] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.url}
                    alt={`${listing.title} demo ${file.path}`}
                    className="h-52 w-full object-cover"
                  />
                  <p className="border-t border-[#e5e7eb] px-3 py-2 text-xs text-[#6b7280]">
                    {file.path}
                  </p>
                </article>
              ))}
          </div>

          {hasNoMedia && (
            <p className="mt-4 border border-dashed border-[#d1d5db] bg-white px-4 py-4 text-sm text-[#6b7280]">
              Demo media will appear here once the seller uploads setup screenshots or walkthrough videos.
            </p>
          )}
        </section>

        {/* Body */}
        <div className="mt-12 flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <div className="border border-[#eceef5] p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ PACKAGE DETAILS ]
              </p>
              <dl className="mt-3 space-y-3 text-xs">
                <div>
                  <dt className="text-[#9aa0b5]">Listing reference</dt>
                  <dd className="break-all font-mono text-[#374151]">{listing.listingHashId}</dd>
                </div>
                {listing.fileSizeBytes ? (
                  <div>
                    <dt className="text-[#9aa0b5]">Download size</dt>
                    <dd className="text-[#374151]">{formatBytes(listing.fileSizeBytes)}</dd>
                  </div>
                ) : null}
                {(listing.categories ?? []).length > 0 && (
                  <div>
                    <dt className="text-[#9aa0b5]">Categories</dt>
                    <dd className="text-[#374151]">{listing.categories?.join(", ")}</dd>
                  </div>
                )}
              </dl>
            </div>

            {listing.llmCompatibility.length > 0 && (
              <div className="border border-[#eceef5] p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ SUPPORTED AGENTS ]
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#5c6178]">
                  This skill is validated for use with the following agent platforms.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {listing.llmCompatibility.map((agent) => (
                    <li key={agent}>
                      <span className="inline-block border border-[#d6e4ff] bg-[#f4f8ff] px-2.5 py-1 font-mono text-[11px] font-medium text-[#1d4ed8]">
                        {agent}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border border-[#eceef5] p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ ORIGIN ]
              </p>
              <div className="mt-4 flex items-center gap-3">
                <SellerAvatar name={listing.sellerId.name} avatarUrl={listing.sellerId.avatarUrl} />
                <div>
                  <p className="text-sm font-medium">{listing.sellerId.name}</p>
                  <p className="font-mono text-xs text-[#8b90a3]">
                    @{listing.sellerId.name.toLowerCase().replaceAll(/\s+/g, "_")}
                  </p>
                </div>
              </div>
              {listing.sellerId.bio && (
                <p className="mt-3 text-xs leading-relaxed text-[#5c6178]">{listing.sellerId.bio}</p>
              )}
            </div>

            {listing.tags.length > 0 && (
              <div className="border border-[#eceef5] p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">[ TAGS ]</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.tags.map((t) => (
                    <span
                      key={t}
                      className="border border-[#e8eaf2] bg-[#f8f9fc] px-2 py-0.5 font-mono text-[10px] tracking-wide text-[#6b728e]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Dynamic code viewer */}
          <div className="min-w-0 flex-1 border border-[#eceef5] bg-[#fafbff]">
            {!hasPackage ? (
              /* No package uploaded yet */
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 p-6 text-center">
                <p className="font-mono text-[11px] tracking-[0.14em] text-[#9aa0b5]">
                  NO PACKAGE UPLOADED
                </p>
                <p className="max-w-xs text-xs text-[#6b7280]">
                  {isSeller
                    ? "Upload a skill zip or folder on the sell page to populate the file viewer."
                    : "The seller has not uploaded the skill package yet."}
                </p>
              </div>
            ) : (
              <>
                {/* Tabs — dynamic from manifest text files only */}
                {displayTabs.length > 0 && (
                  <div className="-mx-px flex flex-nowrap gap-0 overflow-x-auto border-b border-[#eceef5] bg-white [-webkit-overflow-scrolling:touch]">
                    {displayTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleFileSelect(tab)}
                        className={`shrink-0 border-b-2 px-3 py-3 font-mono text-[11px] sm:px-4 sm:text-xs ${
                          activeFile === tab
                            ? "-mb-px border-black font-medium text-[#0f1222]"
                            : "border-transparent text-[#8b90a3] hover:text-[#5c6178]"
                        }`}
                      >
                        {tab.split("/").pop()}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-col md:flex-row">
                  {/* File tree */}
                  <div className="w-full shrink-0 border-b border-[#eceef5] bg-white p-4 font-mono text-xs text-[#5c6178] md:w-52 md:border-b-0 md:border-r">
                    <p className="mb-3 text-[10px] tracking-wide text-[#b4b8c9]">
                      src / <span className="text-[#c5c9d6]">({fileTree.length} files)</span>
                    </p>
                    <ul className="space-y-1">
                      {fileTree.map((file) => (
                        <li key={file}>
                          <button
                            type="button"
                            onClick={() => handleFileSelect(file)}
                            className={`w-full truncate rounded px-2 py-1 text-left hover:bg-[#f5f6fa] ${
                              activeFile === file ? "bg-[#eef2ff] text-[#1d4ed8]" : ""
                            }`}
                            title={file}
                          >
                            {file.split("/").pop()}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {listing.fileSizeBytes ? (
                      <p className="mt-4 text-[10px] text-[#b4b8c9]">
                        {formatBytes(listing.fileSizeBytes)} total
                      </p>
                    ) : null}
                  </div>

                  {/* File content */}
                  <div className="relative min-h-[280px] flex-1 bg-white sm:min-h-[320px]">
                    <div
                      className={`h-full p-4 sm:p-6 ${hasAccess ? "" : "pointer-events-none select-none blur-sm"}`}
                      aria-hidden={!hasAccess}
                    >
                      {fetchingFile === activeFile ? (
                        <div className="flex h-full min-h-[200px] items-center justify-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
                        </div>
                      ) : activeManifestFile && isImageFile(activeFile) ? (
                        <div className="flex flex-col items-start gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={activeManifestFile.url}
                            alt={activeFile}
                            className="max-h-[400px] max-w-full border border-[#e5e7eb] object-contain"
                          />
                          <p className="text-xs text-[#9aa0b5]">{activeFile}</p>
                        </div>
                      ) : activeContent !== null ? (
                        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[#1e3a5f]">
                          {activeContent}
                        </pre>
                      ) : activeManifestFile?.url ? (
                        <p className="text-xs text-[#9aa0b5]">
                          Preview not available for this file type.{" "}
                          <a href={activeManifestFile.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#0f1222]">
                            Open file
                          </a>
                        </p>
                      ) : (
                        <p className="text-xs text-[#9aa0b5]">
                          {activeFile
                            ? `Select a file from the tree to preview its contents.`
                            : "Select a file to preview."}
                        </p>
                      )}
                    </div>

                    {/* Access check loading */}
                    {!hasAccess && !accessChecked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
                      </div>
                    )}

                    {/* Locked overlay — only for non-sellers who haven't purchased */}
                    {!hasAccess && accessChecked && !isSeller && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/60 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white px-8 py-7 shadow-[0_8px_32px_rgba(15,18,34,0.10)]">
                          <svg className="h-10 w-10 text-[#0f1222]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[#0f1222]">
                            CONTENT LOCKED
                          </p>
                          <p className="max-w-[200px] text-center text-xs leading-relaxed text-[#6b7280]">
                            Purchase this skill to read all files and documentation.
                          </p>
                          <button
                            type="button"
                            className="mt-1 w-full border border-black bg-black px-6 py-2.5 text-xs font-semibold tracking-[0.14em] text-white hover:bg-[#1a1d2e]"
                            onClick={handleBuyNowClick}
                          >
                            PURCHASE — {formatPrice(listing.price)}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Seller: file uploaded but no download access */}
                    {!hasAccess && accessChecked && isSeller && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80">
                        <p className="font-mono text-[11px] tracking-[0.14em] text-[#9aa0b5]">
                          UPLOAD PENDING
                        </p>
                        <p className="max-w-[220px] text-center text-xs text-[#6b7280]">
                          File paths are visible but download links are not yet active.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1e2a4a] bg-[#0f172a] px-4 py-3 text-white shadow-[0_-8px_30px_rgba(15,23,42,0.35)] md:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.1em] text-[#94a3b8] sm:justify-start sm:gap-x-8 sm:tracking-[0.12em]">
          <span>PRICE: {formatPrice(listing.price)}</span>
          <span>REVIEWS: {listing.reviewCount ?? "—"}</span>
          {listing.purchaseCount ? <span>SALES: {listing.purchaseCount}</span> : null}
          {listing.verified && <span className="text-[#22c55e]">VERIFIED: OK</span>}
        </div>
      </div>

      <footer className="border-t border-[#eceef5] py-4">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 font-mono text-[10px] text-[#9aa0b5] sm:flex-row md:px-6">
          <span>SKILLKART_SYSTEM_V1.0 © 2024</span>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <span>STATUS: OK</span>
            <span>CHANGELOG</span>
            <span>API ACCESS</span>
            <span>TERMS OF SERVICE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

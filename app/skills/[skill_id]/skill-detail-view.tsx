"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AppNavbar } from "@/components/app-navbar";
import { OpenInCoworkButton } from "@/components/OpenInCoworkButton";
import { type ApiListing, formatBytes, formatPrice, listingsApi, paymentsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
        className="h-10 w-10 shrink-0 rounded-full border border-[#e8eaf2] object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8eaf2] text-sm font-semibold text-[#0f1222]">
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

const TEXT_EXTENSIONS =
  /\.(md|js|ts|tsx|jsx|json|py|txt|yaml|yml|sh|css|html|xml|toml|env|cfg|ini|rs|go|java|rb|php|swift|kt|c|cpp|h)$/i;

const isTextFile = (path: string) => TEXT_EXTENSIONS.test(path);
const isImageFile = (path: string) =>
  /\.(png|jpe?g|webp|gif|svg|ico)$/i.test(path);
const isMarkdownFile = (path: string) => /\.md$/i.test(path);

export function SkillDetailView({
  listing: initialListing,
}: Readonly<{ listing: ApiListing }>) {
  const [listing, setListing] = useState<ApiListing>(initialListing);
  const [accessChecked, setAccessChecked] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const { token, user, loading: authLoading } = useAuth();

  const firstManifestFile =
    (initialListing.packageManifest?.files ?? []).filter((f) =>
      TEXT_EXTENSIONS.test(f.path),
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

  // Auto-fetch content for the active file whenever it changes
  useEffect(() => {
    if (!activeFile) return;
    const manifestFiles = listing.packageManifest?.files ?? [];
    const file = manifestFiles.find((f) => f.path === activeFile);
    if (!file?.url) return;
    if (!isTextFile(activeFile)) return;
    if (fileContents[activeFile] !== undefined) return;
    void fetchFileContent(activeFile, file.url);
  }, [activeFile, listing.packageManifest?.files, fileContents, fetchFileContent]);

  const handleFileSelect = useCallback((path: string) => {
    setActiveFile(path);
  }, []);

  const handleBuyNowClick = () => {
    if (!token) {
      globalThis.location.href = "/auth/login";
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
      const checkout = await paymentsApi.createCheckout(token, listing._id);
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error("Failed to load Razorpay checkout.");
      }
      const rz = new window.Razorpay({
        key: checkout.key_id,
        amount: checkout.amount,
        currency: checkout.currency,
        order_id: checkout.order_id,
        name: "SkillKart",
        description: listing.title,
        handler: async (response: Record<string, unknown>) => {
          try {
            await paymentsApi.verifyPayment(token, {
              razorpay_payment_id: String(response.razorpay_payment_id ?? ""),
              razorpay_order_id: String(response.razorpay_order_id ?? ""),
              razorpay_signature: String(response.razorpay_signature ?? ""),
            });
            refreshListing();
          } catch (err) {
            setBuyError(err instanceof Error ? err.message : "Payment verification failed.");
            confirmDialogRef.current?.showModal();
          } finally {
            setBuying(false);
          }
        },
        modal: {
          ondismiss: () => setBuying(false),
        },
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
        },
      });
      confirmDialogRef.current?.close();
      rz.open();
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : "Purchase failed. Please try again.");
      confirmDialogRef.current?.showModal();
      setBuying(false);
    }
  };

  const handleDownload = () => {
    const url = listing.packageZipUrl ?? listing.fileUrl;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasAccess = accessChecked && !!listing.fileUrl;
  const isSeller = !!(user && listing.sellerId._id === user._id);
  const hasPurchased = hasAccess && !isSeller;
  const hasClaudeSupport = listing.llmCompatibility.some(
    (agent) => agent.trim().toLowerCase() === "claude",
  );

  const manifestFiles = listing.packageManifest?.files ?? [];
  const demoMedia = listing.demoMedia ?? [];
  const connectors: string[] = (listing as ApiListing & { connectors?: string[] }).connectors ?? [];

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

  const manifestTextFiles = manifestFiles.filter((f) => isTextFile(f.path));
  const skillPromptManifestFile = manifestFiles.find((f) => /(^|\/)skills?\.md$/i.test(f.path));
  const displayTabs = manifestTextFiles.slice(0, 5).map((f) => f.path);
  const fileTree = manifestFiles.map((f) => f.path);
  const hasPackage = manifestFiles.length > 0;

  const activeManifestFile = manifestFiles.find((f) => f.path === activeFile);

  const activeContent: string | null =
    fileContents[activeFile] !== undefined ? fileContents[activeFile] : null;

  useEffect(() => {
    if (!hasPurchased || !hasClaudeSupport || !skillPromptManifestFile) return;
    if (fileContents[skillPromptManifestFile.path] !== undefined) return;
    void fetchFileContent(skillPromptManifestFile.path, skillPromptManifestFile.url);
  }, [hasPurchased, hasClaudeSupport, skillPromptManifestFile, fileContents, fetchFileContent]);

  const coworkSkillPrompt = useMemo(() => {
    const promptFromSkillFile = skillPromptManifestFile
      ? fileContents[skillPromptManifestFile.path]
      : undefined;
    if (promptFromSkillFile && !promptFromSkillFile.startsWith("// Could not load")) {
      return promptFromSkillFile;
    }
    const body = listing.description?.trim() || listing.shortDescription?.trim() || "";
    const lines = [`# ${listing.title}`];
    if (body) lines.push("", body);
    return lines.join("\n");
  }, [
    fileContents,
    listing.title,
    listing.description,
    listing.shortDescription,
    skillPromptManifestFile,
  ]);

  const allDemoImages = demoImages.length > 0 ? demoImages : manifestImages;
  const hasMedia =
    !!listing.coverImageUrl ||
    demoImages.length > 0 ||
    demoVideos.length > 0 ||
    manifestImages.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24 text-[#0f1222]">
      {/* Confirm purchase dialog */}
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
                className="w-full cursor-pointer border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1d2e] disabled:opacity-60 sm:w-auto"
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

        {/* ── TOP HERO: title+meta left, CTA right ── */}
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

          {/* ── LEFT: title, seller, description, badges ── */}
          <div className="min-w-0 flex-1">

            {/* Title + meta row */}
            <div className="flex flex-col gap-3">
              {(listing.categories ?? []).length > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9aa0b5]">
                  {listing.categories?.join(" · ")}
                </p>
              )}
              <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                {listing.title}
              </h1>

              {/* Seller inline */}
              <div className="flex items-center gap-2.5">
                <SellerAvatar name={listing.sellerId.name} avatarUrl={listing.sellerId.avatarUrl} />
                <div>
                  <p className="text-sm font-medium text-[#0f1222]">{listing.sellerId.name}</p>
                  {listing.sellerId.bio && (
                    <p className="text-xs text-[#8b90a3]">{listing.sellerId.bio}</p>
                  )}
                </div>
                {listing.verified && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">
                    <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                      <path d="M10 3L5 8.5 2 5.5l-1 1L5 10.5l6-7-1-0.5z" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              {/* Stats row */}
              {(listing.reviewCount ?? 0) > 0 || listing.purchaseCount ? (
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6b7280]">
                  {(listing.reviewCount ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 text-[#f59e0b]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {(listing.averageRating ?? 0).toFixed(1)} ({listing.reviewCount} reviews)
                    </span>
                  )}
                  {listing.purchaseCount ? (
                    <span>{listing.purchaseCount} purchases</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Description */}
            <div className="mt-5 text-sm leading-7 text-[#374151]">
              {listing.description || listing.shortDescription}
            </div>

            {/* LLM + connectors badges */}
            {(listing.llmCompatibility.length > 0 || connectors.length > 0) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {listing.llmCompatibility.map((agent) => (
                  <span
                    key={agent}
                    className="inline-flex items-center gap-1 rounded-full border border-[#d6e4ff] bg-[#f4f8ff] px-2.5 py-1 font-mono text-[11px] font-medium text-[#1d4ed8]"
                  >
                    <svg className="h-2.5 w-2.5" viewBox="0 0 8 8" fill="currentColor" aria-hidden><circle cx="4" cy="4" r="3" /></svg>
                    {agent}
                  </span>
                ))}
                {connectors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full border border-[#d1fae5] bg-[#f0fdf4] px-2.5 py-1 font-mono text-[11px] font-medium text-[#047857]"
                    title="MCP connector required"
                  >
                    <svg className="h-2.5 w-2.5" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M1 4h6M4 1v6" /></svg>
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {listing.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {listing.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-[#e8eaf2] bg-[#f8f9fc] px-2 py-0.5 font-mono text-[10px] tracking-wide text-[#6b728e]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: CTA card (top-right, opposite title) ── */}
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
            <div className="rounded-xl border border-[#eceef5] bg-[#fafbff] p-5 shadow-sm">
              <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[#9aa0b5]">
                {hasAccess ? "DOWNLOAD" : isSeller ? "YOUR SKILL" : "GET THIS SKILL"}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0f1222]">
                {formatPrice(listing.price)}
              </p>
              <p className="mt-1 text-xs text-[#9aa0b5]">one-time purchase · instant download</p>
              <p className="mt-3 text-sm leading-6 text-[#5c6178]">
                {hasAccess
                  ? "You have access. Download the skill folder and drop it into your agent or workflow."
                  : isSeller
                  ? "This is your listing. Buyers can download the full skill package after purchase."
                  : "After checkout you get the full skill package — no subscriptions, ever."}
              </p>
              <button
                id="skill-purchase-btn"
                type="button"
                aria-label={hasAccess ? "Download skill" : `Buy Now for ${formatPrice(listing.price)}`}
                onClick={hasAccess ? handleDownload : isSeller ? undefined : handleBuyNowClick}
                disabled={isSeller && !hasAccess}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-black bg-black py-3 text-sm font-semibold text-white hover:bg-[#1a1d2e] disabled:cursor-not-allowed disabled:opacity-60"
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
              {hasPurchased && hasClaudeSupport ? (
                <div className="mt-3">
                  <OpenInCoworkButton skillName={listing.title} skillPrompt={coworkSkillPrompt} />
                </div>
              ) : null}
              <ul className="mt-4 space-y-1.5 text-xs text-[#6b7280]">
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-[#22c55e]" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M13.6 3.4a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06L6 9.94l6.47-6.54a.75.75 0 011.13 0z"/></svg>
                  One-time payment, no subscriptions
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-[#22c55e]" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M13.6 3.4a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06L6 9.94l6.47-6.54a.75.75 0 011.13 0z"/></svg>
                  Instant download after purchase
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-[#22c55e]" viewBox="0 0 16 16" fill="currentColor" aria-hidden><path d="M13.6 3.4a.75.75 0 010 1.06l-7 7a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06L6 9.94l6.47-6.54a.75.75 0 011.13 0z"/></svg>
                  Skill works or we refund
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* ── MEDIA: cover image + demo video side by side ── */}
        {(listing.coverImageUrl || primaryHeroVideo) && (
          <div className={`mt-8 grid gap-4 ${listing.coverImageUrl && primaryHeroVideo ? "md:grid-cols-2" : ""}`}>
            {/* Cover image */}
            {listing.coverImageUrl && (
              <div className="overflow-hidden rounded-xl border border-[#e5e7eb] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.coverImageUrl}
                  alt={`${listing.title} cover`}
                  className="h-full w-full object-cover"
                  style={{ maxHeight: "420px", minHeight: "220px" }}
                />
              </div>
            )}
            {/* Primary demo video */}
            {primaryHeroVideo && (
              <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-black shadow-[0_8px_30px_rgba(15,18,34,0.14)]">
                <div className="relative aspect-video w-full bg-[#0b0f1a]">
                  <video
                    className="h-full w-full object-contain"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  >
                    <source
                      src={primaryHeroVideo.url}
                      type={primaryHeroVideo.resourceType === "video" ? "video/mp4" : primaryHeroVideo.resourceType || "video/mp4"}
                    />
                    <track kind="captions" srcLang="en" label="English captions" />
                  </video>
                </div>
                <p className="border-t border-white/10 bg-[#0f1222] px-4 py-2 text-xs text-white/60">
                  <span className="font-semibold text-white">Demo</span>
                  {" — "}see this skill in action before you buy.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional demo videos */}
        {demoVideos.slice(1).map((media) => (
          <div key={media.url} className="mt-4 overflow-hidden rounded-xl border border-[#1e293b] bg-black">
            <video controls preload="metadata" className="aspect-video w-full bg-black object-contain">
              <source src={media.url} type="video/mp4" />
              <track kind="captions" srcLang="en" label="English captions" />
            </video>
            {media.name && (
              <p className="border-t border-white/10 bg-[#0f1222] px-4 py-2.5 text-xs text-white/70">{media.name}</p>
            )}
          </div>
        ))}

        {/* Screenshot gallery */}
        {allDemoImages.length > 0 && (
          <div className="mt-6">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">[ SCREENSHOTS ]</p>
            <div className={`mt-3 grid gap-3 ${allDemoImages.length === 1 ? "" : "sm:grid-cols-2"}`}>
              {allDemoImages.map((media) => (
                <div key={"url" in media ? media.url : media.path} className="overflow-hidden rounded-lg border border-[#e5e7eb]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.url}
                    alt={"name" in media ? (media.name || listing.title) : media.path}
                    className="w-full object-cover"
                    style={{ maxHeight: "320px" }}
                  />
                  {"name" in media && media.name && (
                    <p className="border-t border-[#e5e7eb] bg-[#fafafa] px-3 py-1.5 text-xs text-[#6b7280]">{media.name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasMedia && (
          <div className="mt-8 rounded-xl border border-dashed border-[#d1d5db] bg-[#fafafa] px-6 py-8 text-center text-sm text-[#9aa0b5]">
            No preview media uploaded yet.
          </div>
        )}

        {/* ── BOTTOM SECTION: file viewer + sidebar details ── */}
        <div className="mt-10 flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">
          <div className="min-w-0 flex-1">
            {/* ── File viewer ── */}
            <div className="mt-10 overflow-hidden rounded-xl border border-[#eceef5] bg-[#fafbff]">
              <div className="border-b border-[#eceef5] bg-white px-4 py-3">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ SKILL PACKAGE ]
                </p>
              </div>

              {!hasPackage ? (
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 p-6 text-center">
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
                  {/* Tabs */}
                  {displayTabs.length > 0 && (
                    <div className="-mx-px flex flex-nowrap gap-0 overflow-x-auto border-b border-[#eceef5] bg-white [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                    <div className="relative min-h-[280px] flex-1 bg-white sm:min-h-[360px]">
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
                        ) : activeContent !== null && isMarkdownFile(activeFile) ? (
                          <div className="prose prose-sm max-w-none
                            prose-headings:font-semibold prose-headings:text-[#111827] prose-headings:mt-5 prose-headings:mb-2
                            prose-h1:text-xl prose-h2:text-base prose-h3:text-sm
                            prose-p:text-[#374151] prose-p:my-2
                            prose-a:text-[#2563eb] prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-[#111827] prose-strong:font-semibold
                            prose-code:bg-[#f3f4f6] prose-code:text-[#e11d48] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-[#1e1e2e] prose-pre:text-[#cdd6f4] prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-xs
                            prose-blockquote:border-l-4 prose-blockquote:border-[#2563eb] prose-blockquote:pl-4 prose-blockquote:text-[#6b7280] prose-blockquote:not-italic prose-blockquote:my-3
                            prose-ul:my-2 prose-ul:pl-5 prose-li:my-0.5 prose-ol:my-2 prose-ol:pl-5
                            prose-hr:border-[#e5e7eb] prose-hr:my-4
                          ">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {activeContent}
                            </ReactMarkdown>
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
                            {activeFile ? "Loading…" : "Select a file to preview."}
                          </p>
                        )}
                      </div>

                      {/* Access check loading */}
                      {!hasAccess && !accessChecked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
                        </div>
                      )}

                      {/* Locked overlay */}
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
                              className="mt-1 w-full cursor-pointer border border-black bg-black px-6 py-2.5 text-xs font-semibold tracking-[0.14em] text-white hover:bg-[#1a1d2e]"
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

          {/* ── RIGHT: details sidebar (bottom section) ── */}
          <aside className="flex w-full shrink-0 flex-col gap-4 xl:sticky xl:top-6 xl:w-80">

            {/* Package details */}
            <div className="rounded-xl border border-[#eceef5] bg-white p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ PACKAGE DETAILS ]
              </p>
              <dl className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-[#9aa0b5]">Ref</dt>
                  <dd className="break-all font-mono text-right text-[#374151]">{listing.listingHashId}</dd>
                </div>
                {listing.fileSizeBytes ? (
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-[#9aa0b5]">Size</dt>
                    <dd className="text-[#374151]">{formatBytes(listing.fileSizeBytes)}</dd>
                  </div>
                ) : null}
                {(listing.categories ?? []).length > 0 && (
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-[#9aa0b5]">Category</dt>
                    <dd className="text-right capitalize text-[#374151]">{listing.categories?.join(", ")}</dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-[#9aa0b5]">Pricing</dt>
                  <dd className="text-[#374151]">One-time</dd>
                </div>
              </dl>
            </div>

            {/* Supported agents */}
            {listing.llmCompatibility.length > 0 && (
              <div className="rounded-xl border border-[#eceef5] bg-white p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                  [ SUPPORTED AGENTS ]
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {listing.llmCompatibility.map((agent) => (
                    <li key={agent}>
                      <span className="inline-block rounded-full border border-[#d6e4ff] bg-[#f4f8ff] px-2.5 py-1 font-mono text-[11px] font-medium text-[#1d4ed8]">
                        {agent}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Connectors / MCP */}
            {connectors.length > 0 && (
              <div className="rounded-xl border border-[#d1fae5] bg-[#f0fdf4] p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#047857]">
                  [ MCP CONNECTORS REQUIRED ]
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#065f46]">
                  This skill requires the following MCP connectors to be set up in your agent.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {connectors.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-xs font-medium text-[#047857]">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M8 3l5 5-5 5" />
                      </svg>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Seller info */}
            <div className="rounded-xl border border-[#eceef5] bg-white p-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
                [ SELLER ]
              </p>
              <div className="mt-3 flex items-center gap-3">
                <SellerAvatar name={listing.sellerId.name} avatarUrl={listing.sellerId.avatarUrl} />
                <div>
                  <p className="text-sm font-medium text-[#0f1222]">{listing.sellerId.name}</p>
                  <p className="font-mono text-xs text-[#8b90a3]">
                    @{listing.sellerId.name.toLowerCase().replaceAll(/\s+/g, "_")}
                  </p>
                </div>
              </div>
              {listing.sellerId.bio && (
                <p className="mt-3 text-xs leading-relaxed text-[#5c6178]">{listing.sellerId.bio}</p>
              )}
            </div>
          </aside>
        </div>{/* end bottom section */}
      </div>{/* end page container */}

      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1e2a4a] bg-[#0f172a] px-4 py-3 text-white shadow-[0_-8px_30px_rgba(15,23,42,0.35)] md:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 font-mono text-[10px] tracking-[0.1em] text-[#94a3b8]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>PRICE: {formatPrice(listing.price)}</span>
            <span>REVIEWS: {listing.reviewCount ?? "—"}</span>
            {listing.purchaseCount ? <span>SALES: {listing.purchaseCount}</span> : null}
            {listing.verified && <span className="text-[#22c55e]">✓ VERIFIED</span>}
          </div>
          <button
            type="button"
            onClick={hasAccess ? handleDownload : isSeller ? undefined : handleBuyNowClick}
            disabled={isSeller && !hasAccess}
            className="hidden shrink-0 cursor-pointer rounded border border-white/20 bg-white/10 px-5 py-1.5 text-[10px] font-semibold text-white hover:bg-white/20 disabled:opacity-40 sm:block"
          >
            {hasAccess ? "Download" : isSeller ? "Your listing" : `Buy Now — ${formatPrice(listing.price)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

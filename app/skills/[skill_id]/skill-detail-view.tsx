"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  if (typeof globalThis.window === "undefined") return false;
  if (globalThis.window.Razorpay) return true;
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
  size = "md",
}: Readonly<{ name: string; avatarUrl?: string; size?: "sm" | "md" }>) {
  const cls = size === "sm"
    ? "h-6 w-6 text-[10px]"
    : "h-9 w-9 text-sm";
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${cls} shrink-0 rounded-full border border-[#e8eaf2] object-cover`}
      />
    );
  }
  return (
    <div className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-[#e8eaf2] font-semibold text-[#0f1222]`}>
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

const TEXT_EXTENSIONS =
  /\.(md|js|ts|tsx|jsx|json|py|txt|yaml|yml|sh|css|html|xml|toml|env|cfg|ini|rs|go|java|rb|php|swift|kt|c|cpp|h)$/i;

function fileIcon(path: string) {
  if (/\.md$/i.test(path))             return { bg: "bg-[#eff6ff]", emoji: "📄" };
  if (/\.(mp3|wav|ogg|flac)$/i.test(path)) return { bg: "bg-[#f0fdf4]", emoji: "🎵" };
  if (/\.(mp4|webm|mov)$/i.test(path)) return { bg: "bg-[#fdf4ff]", emoji: "🎬" };
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(path)) return { bg: "bg-[#fff7ed]", emoji: "🖼️" };
  if (/\.(zip|tar|gz)$/i.test(path))   return { bg: "bg-[#faf5ff]", emoji: "📦" };
  if (/\.(json|yaml|yml|toml)$/i.test(path)) return { bg: "bg-[#fefce8]", emoji: "⚙️" };
  if (/\.(py|js|ts|tsx|jsx|rs|go)$/i.test(path)) return { bg: "bg-[#f0fdf4]", emoji: "💻" };
  return { bg: "bg-[#f8fafc]", emoji: "📁" };
}

export function SkillDetailView({
  listing: initialListing,
}: Readonly<{ listing: ApiListing }>) {
  const [listing, setListing] = useState<ApiListing>(initialListing);
  const [accessChecked, setAccessChecked] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const { token, user, loading: authLoading } = useAuth();

  const [fileContents, setFileContents] = useState<Record<string, string>>({});

  const refreshListing = useCallback(() => {
    if (!token) return;
    listingsApi
      .get(initialListing._id, token)
      .then(({ listing: full }) => setListing(full))
      .catch(() => {/* keep current */});
  }, [token, initialListing._id]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setAccessChecked(true); return; }
    listingsApi
      .get(initialListing._id, token)
      .then(({ listing: full }) => {
        setListing(full);
      })
      .catch(() => {/* keep initial listing */})
      .finally(() => setAccessChecked(true));
  }, [token, authLoading, initialListing._id]);

  const fetchFileContent = useCallback(async (path: string, url: string) => {
    if (fileContents[path] !== undefined) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setFileContents((prev) => ({ ...prev, [path]: text }));
    } catch {
      setFileContents((prev) => ({ ...prev, [path]: `// Could not load ${path}` }));
    }
  }, [fileContents]);

  const handleBuyNowClick = () => {
    if (!token) { globalThis.location.href = "/auth/login"; return; }
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
      if (!razorpayLoaded || !window.Razorpay) throw new Error("Failed to load Razorpay checkout.");
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
        modal: { ondismiss: () => setBuying(false) },
        prefill: { name: user?.name ?? "", email: user?.email ?? "" },
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
    (a) => a.trim().toLowerCase() === "claude",
  );

  const manifestFiles = listing.packageManifest?.files ?? [];
  const demoMedia = listing.demoMedia ?? [];
  const connectors: string[] = (listing as ApiListing & { connectors?: string[] }).connectors ?? [];

  const demoVideos = demoMedia.filter(
    (m) => m.resourceType === "video" || /\.(mp4|webm|mov|m4v)$/i.test(m.name),
  );
  const primaryHeroVideo =
    demoVideos[0] ??
    manifestFiles.find((f) => f.resourceType === "video" || /\.(mp4|webm|mov|m4v)$/i.test(f.path)) ??
    null;

  const demoImages = demoMedia.filter(
    (m) => m.resourceType === "image" || /\.(png|jpe?g|webp|gif|svg)$/i.test(m.name),
  );
  const manifestImages = manifestFiles.filter(
    (f) => f.resourceType === "image" || /\.(png|jpe?g|webp|gif|svg)$/i.test(f.path),
  );
  const allDemoImages = demoImages.length > 0 ? demoImages : manifestImages;

  const skillPromptManifestFile = manifestFiles.find((f) => /(^|\/)skills?\.md$/i.test(f.path));
  const hasPackage = manifestFiles.length > 0;

  useEffect(() => {
    if (!hasPurchased || !hasClaudeSupport || !skillPromptManifestFile) return;
    if (fileContents[skillPromptManifestFile.path] !== undefined) return;
    void fetchFileContent(skillPromptManifestFile.path, skillPromptManifestFile.url);
  }, [hasPurchased, hasClaudeSupport, skillPromptManifestFile, fileContents, fetchFileContent]);

  const coworkSkillPrompt = useMemo(() => {
    const fromFile = skillPromptManifestFile ? fileContents[skillPromptManifestFile.path] : undefined;
    if (fromFile && !fromFile.startsWith("// Could not load")) return fromFile;
    const body = listing.description?.trim() ?? listing.shortDescription?.trim() ?? "";
    return [`# ${listing.title}`, ...(body ? ["", body] : [])].join("\n");
  }, [fileContents, listing.title, listing.description, listing.shortDescription, skillPromptManifestFile]);


  return (
    <div className="flex min-h-screen flex-col bg-white pb-24 text-[#0f1222]">

      {/* -- Confirm purchase dialog -- */}
      <dialog
        ref={confirmDialogRef}
        className="z-50 border-0 bg-transparent p-0 shadow-none backdrop:bg-black/40"
        style={{ maxWidth: "none", width: "100%", margin: 0, position: "fixed", inset: 0, minHeight: "100dvh" }}
        aria-labelledby="confirm-purchase-title"
        onCancel={(e) => { if (buying) e.preventDefault(); }}
        onClose={() => setBuyError("")}
      >
        <div className="flex min-h-[100dvh] w-full items-center justify-center p-4">
          <div className="w-full max-w-[380px] rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_20px_60px_rgba(15,18,34,0.16)]">
            <h2 id="confirm-purchase-title" className="text-lg font-semibold text-[#0f1222]">
              Confirm Purchase
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5c6178]">
              You are about to purchase{" "}
              <span className="font-medium text-[#0f1222]">{listing.title}</span> for a one-time payment.
            </p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-[#0f1222]">
              {formatPrice(listing.price)}
            </p>
            {buyError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {buyError}
              </p>
            )}
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                disabled={buying}
                onClick={() => { if (!buying) confirmDialogRef.current?.close(); }}
                className="flex-1 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={buying}
                onClick={() => void handleConfirmPurchase()}
                className="flex-[2] cursor-pointer rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1d2e] disabled:opacity-60"
              >
                {buying ? "Processing…" : `Confirm — ${formatPrice(listing.price)}`}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <AppNavbar activeTab="explore" />

      {/* -- Breadcrumb -- */}
      <div className="border-b border-[#e8eaf2] bg-[#f5f6fa] px-4 py-2.5 md:px-8">
        <nav
          className="mx-auto flex max-w-[1200px] items-center gap-x-1 font-mono text-[12px] text-[#9aa0b5]"
          aria-label="Breadcrumb"
        >
          <span className="text-[#b4b8c9]">~/</span>
          <Link href="/explore" className="text-[#5c6178] transition-colors hover:text-[#0f1222]">
            explore
          </Link>
          <span className="text-[#c8ccd8]" aria-hidden>/</span>
          <span aria-current="page" className="max-w-[36rem] truncate text-[#374151]" title={listing.title}>
            {listing.title}
          </span>
        </nav>
      </div>

      {/* -- HERO GRID -- */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-7 md:px-8">
        <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[1fr_380px]">

          {/* ════ LEFT COLUMN ════ */}
          <div className="min-w-0">

            {/* 1 · Video hero */}
            {primaryHeroVideo && (
              <div className="overflow-hidden rounded-xl border border-[#dde0ea] bg-black shadow-[0_2px_12px_rgba(15,18,34,0.12)] lg:max-w-[50vw]">
                {/* macOS window chrome */}
                <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1b23] px-3.5 py-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_0_0.5px_rgba(0,0,0,0.25)]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_0_0.5px_rgba(0,0,0,0.25)]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_0_0.5px_rgba(0,0,0,0.25)]" />
                  <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-white/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_4px_#22c55e]" />
                    live_demo.mp4
                  </span>
                </div>
                <video
                  className="block w-full"
                  style={{ maxHeight: "80vh" }}
                  controls muted playsInline preload="metadata"
                  poster={listing.coverImageUrl ?? undefined}
                >
                  <source
                    src={primaryHeroVideo.url}
                    type={
                      "resourceType" in primaryHeroVideo && primaryHeroVideo.resourceType === "video"
                        ? "video/mp4"
                        : "video/mp4"
                    }
                  />
                  <track kind="captions" srcLang="en" label="English captions" />
                </video>
              </div>
            )}

            {/* Cover image fallback (when no video) */}
            {!primaryHeroVideo && listing.coverImageUrl && (
              <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] shadow-sm lg:max-w-[50vw]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.coverImageUrl}
                  alt={`${listing.title} cover`}
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}

            {/* Extra demo videos */}
            {demoVideos.slice(1).map((media) => (
              <div key={media.url} className="mt-4 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-black lg:max-w-[50vw]">
                <video controls preload="metadata" className="block w-full" style={{ maxHeight: "80vh" }}>
                  <source src={media.url} type="video/mp4" />
                  <track kind="captions" srcLang="en" label="English captions" />
                </video>
                {media.name && (
                  <p className="border-t border-[#e5e7eb] bg-[#fafafa] px-4 py-2 text-xs text-[#6b7280]">{media.name}</p>
                )}
              </div>
            ))}

            {/* 2 · About this skill */}
            <div className="mt-9">
              <p className="font-mono text-[11px] text-[#6b7280]">
                <span className="text-[#22c55e]">// </span>about_this_skill
              </p>
              <p className="mt-3.5 max-w-[600px] text-[15px] leading-[1.75] text-[#5c6178]">
                {listing.description || listing.shortDescription}
              </p>
              {((listing.reviewCount ?? 0) > 0 || !!listing.purchaseCount) && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#6b7280]">
                  {(listing.reviewCount ?? 0) > 0 && (
                    <span className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-[#f59e0b]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {(listing.averageRating ?? 0).toFixed(1)} · {listing.reviewCount} reviews
                    </span>
                  )}
                  {listing.purchaseCount ? <span>{listing.purchaseCount} purchases</span> : null}
                </div>
              )}
            </div>

            {/* Screenshot gallery */}
            {allDemoImages.length > 0 && (
              <div className="mt-9">
                <p className="font-mono text-[11px] text-[#6b7280]">
                  <span className="text-[#22c55e]">// </span>screenshots
                </p>
                <div className={`mt-3.5 grid gap-3 ${allDemoImages.length === 1 ? "" : "sm:grid-cols-2"}`}>
                  {allDemoImages.map((media) => (
                    <div key={media.url} className="overflow-hidden rounded-xl border border-[#e5e7eb]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media.url}
                        alt={"name" in media ? (media.name || listing.title) : ("path" in media ? media.path : listing.title)}
                        className="w-full object-cover"
                        style={{ maxHeight: "280px" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 · What's included */}
            {hasPackage && (
              <div className="mt-9">
                <p className="font-mono text-[11px] text-[#6b7280]">
                  <span className="text-[#22c55e]">// </span>whats_included
                </p>
                <div className="mt-3.5 flex flex-col gap-2">
                  {manifestFiles.map((f) => {
                    const icon = fileIcon(f.path);
                    return (
                      <div key={f.path} className="flex items-center gap-3 rounded-xl border border-[#eceef5] bg-white px-4 py-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[15px] ${icon.bg}`}>
                          {icon.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#0f1222]">{f.path.split("/").pop()}</p>
                          <p className="truncate text-xs text-[#9aa0b5]">{f.path}</p>
                        </div>
                        <span className="shrink-0 text-xs text-[#9aa0b5]">
                          {f.bytes ? formatBytes(f.bytes) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {listing.fileSizeBytes ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#eceef5] bg-white px-3 py-2 text-xs text-[#6b7280]">
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {formatBytes(listing.fileSizeBytes)} total download
                  </div>
                ) : null}
              </div>
            )}

            {/* 4 · Agents & Connectors — side-by-side grid */}
            {(listing.llmCompatibility.length > 0 || connectors.length > 0) && (
              <div className={`mt-9 grid gap-5 ${listing.llmCompatibility.length > 0 && connectors.length > 0 ? "sm:grid-cols-2" : ""}`}>
                {listing.llmCompatibility.length > 0 && (
                  <div className="rounded-xl border border-[#e2e4ef] bg-[#f8f9fc] p-5">
                    <p className="font-mono text-[11px] text-[#6b7280]">
                      <span className="text-[#22c55e]">// </span>supported_agents
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {listing.llmCompatibility.map((agent) => (
                        <span
                          key={agent}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-[#f8f9fc] px-3 py-1.5 text-xs font-medium text-[#374151]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {connectors.length > 0 && (
                  <div className="rounded-xl border border-[#e2e4ef] bg-[#f8f9fc] p-5">
                    <p className="font-mono text-[11px] text-[#6b7280]">
                      <span className="text-[#22c55e]">// </span>mcp_connectors
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {connectors.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#d1fae5] bg-[#f0fdf4] px-3 py-1.5 text-xs font-medium text-[#047857]"
                        >
                          <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                          </svg>
                          {c}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-[#9aa0b5]">
                      These MCP connectors must be configured in your agent environment.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 5 · Skill Package — file list */}
            {hasPackage && (
              <div className="mt-9">
                <p className="font-mono text-[11px] text-[#6b7280]">
                  <span className="text-[#22c55e]">// </span>skill_package
                </p>
                {/* terminal-style file list */}
                <div className="mt-3.5 overflow-hidden rounded-xl border border-[#dde0ea] bg-[#f8f9fc]">
                  <div className="flex items-center gap-2 border-b border-[#e2e4ef] bg-[#f0f2f8] px-4 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    <span className="ml-3 font-mono text-[10px] text-[#9aa0b5]">ls -la ./skill/</span>
                  </div>
                  <div className="divide-y divide-[#e8eaf2]">
                    {manifestFiles.map((f) => {
                      const icon = fileIcon(f.path);
                      const fileName = f.path.split("/").pop() ?? f.path;
                      return (
                        <div key={f.path} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="text-[13px]">{icon.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-[12px] font-medium text-[#1e2a3a]">{fileName}</span>
                            {f.path.includes("/") && (
                              <span className="ml-2 font-mono text-[10px] text-[#b4b8c9]">{f.path}</span>
                            )}
                          </div>
                          <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#9aa0b5]">
                            {f.bytes ? formatBytes(f.bytes) : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {listing.fileSizeBytes && (
                    <div className="flex items-center gap-2 border-t border-[#e2e4ef] bg-[#f0f2f8] px-4 py-2">
                      <svg className="h-3 w-3 shrink-0 text-[#9aa0b5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="font-mono text-[10px] text-[#9aa0b5]">{formatBytes(listing.fileSizeBytes)} total</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>{/* /left column */}

          {/* ════ RIGHT COLUMN: sticky purchase card ════ */}
          <aside className="lg:sticky lg:top-5">
            <div className="overflow-hidden rounded-xl border border-[#dde0ea] bg-white shadow-[0_4px_24px_rgba(15,18,34,0.09)]">
              {/* macOS window title bar */}
              <div className="flex items-center gap-2 border-b border-[#e8eaf2] bg-[#f5f6fa] px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]" />
                <span className="mx-auto font-mono text-[11px] text-[#9aa0b5]">skill.purchase</span>
              </div>

              {/* Cover image at top of card */}
              {listing.coverImageUrl && (
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={listing.coverImageUrl}
                    alt={`${listing.title} cover`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                  {(listing.categories ?? []).length > 0 && (
                    <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/50 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm">
                      {listing.categories?.join(" · ")}
                    </span>
                  )}
                </div>
              )}

              <div className="p-5">
                {/* Title + seller */}
                <h1 className="text-[17px] font-semibold leading-snug tracking-tight text-[#0f1222]">
                  {listing.title}
                </h1>
                <div className="mt-2.5 flex items-center gap-2 text-sm text-[#6b7280]">
                  <SellerAvatar name={listing.sellerId.name} avatarUrl={listing.sellerId.avatarUrl} size="sm" />
                  <span>
                    by{" "}
                    <span className="font-medium text-[#0f1222]">{listing.sellerId.name}</span>
                  </span>
                  {listing.verified && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-mono text-[30px] font-bold leading-none tracking-tight text-[#0f1222]">
                    {formatPrice(listing.price)}
                  </span>
                  <span className="font-mono text-xs text-[#9aa0b5]">USD</span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-[#9aa0b5]">one_time · instant_download</p>

                {/* CTA button */}
                <button
                  id="skill-purchase-btn"
                  type="button"
                  aria-label={hasAccess ? "Download skill" : `Buy for ${formatPrice(listing.price)}`}
                  onClick={hasAccess ? handleDownload : isSeller ? undefined : handleBuyNowClick}
                  disabled={isSeller && !hasAccess}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0f1222] py-3.5 font-mono text-[13px] font-semibold tracking-wide text-white transition-all hover:-translate-y-px hover:bg-[#1a1d2e] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="text-[#22c55e]">$</span>
                  {hasAccess
                    ? "download --skill"
                    : isSeller
                    ? "your_listing"
                    : `get_skill --price=${formatPrice(listing.price)}`}
                </button>

                {hasPurchased && hasClaudeSupport && (
                  <div className="mt-2.5">
                    <OpenInCoworkButton skillName={listing.title} skillPrompt={coworkSkillPrompt} />
                  </div>
                )}

                {/* Guarantees */}
                <ul className="mt-4 space-y-1.5">
                  {[
                    "one_time_payment — no subscriptions",
                    "instant_download after purchase",
                    "works_or_refund — guaranteed",
                  ].map((g) => (
                    <li key={g} className="flex items-center gap-2 font-mono text-[11px] text-[#6b7280]">
                      <span className="text-[#22c55e]">✓</span>
                      {g}
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="my-5 border-t border-dashed border-[#e2e4ef]" />

                {/* Meta grid 2×2 */}
                <dl className="grid grid-cols-2 gap-y-3.5">
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#b4b8c9]">ref</dt>
                    <dd className="mt-0.5 font-mono text-xs font-medium text-[#374151]">{listing.listingHashId}</dd>
                  </div>
                  {listing.fileSizeBytes ? (
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#b4b8c9]">size</dt>
                      <dd className="mt-0.5 font-mono text-xs font-medium text-[#374151]">{formatBytes(listing.fileSizeBytes)}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#b4b8c9]">pricing</dt>
                    <dd className="mt-0.5 font-mono text-xs font-medium text-[#374151]">one_time</dd>
                  </div>
                  {hasPackage && (
                    <div>
                      <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#b4b8c9]">files</dt>
                      <dd className="mt-0.5 font-mono text-xs font-medium text-[#374151]">{manifestFiles.length}</dd>
                    </div>
                  )}
                </dl>

                {/* Tags */}
                {listing.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {listing.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-[#e2e4ef] bg-[#f5f6fa] px-2 py-0.5 font-mono text-[10px] text-[#5c6380]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* -- Bottom status bar -- */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#1e2a4a] bg-[#0f172a] px-4 py-3 text-white shadow-[0_-8px_30px_rgba(15,23,42,0.35)] md:px-8">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 font-mono text-[10px] tracking-[0.1em] text-[#94a3b8]">
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
            className="hidden shrink-0 cursor-pointer rounded-lg border border-white/20 bg-white/10 px-5 py-1.5 font-mono text-[11px] font-semibold text-white hover:bg-white/20 disabled:opacity-40 sm:block"
          >
            <span className="text-[#22c55e]">$ </span>
            {hasAccess ? "download" : isSeller ? "your_listing" : `buy --now ${formatPrice(listing.price)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

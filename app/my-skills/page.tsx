"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AppNavbar } from "@/components/app-navbar";
import { type ApiListing, formatBytes, formatPrice, listingsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function MySkillsPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasedSkills, setPurchasedSkills] = useState<ApiListing[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");

    listingsApi
      .list({ page: 1, limit: 24, sortBy: "newest" })
      .then(async ({ listings }) => {
        const checks = await Promise.all(
          listings.map(async (listing) => {
            try {
              const { listing: detailed } = await listingsApi.get(listing._id, token);
              const isAccessible = Boolean(detailed.fileUrl);
              const isOwned = detailed.sellerId?._id === user?._id;
              return isAccessible && !isOwned ? detailed : null;
            } catch {
              return null;
            }
          }),
        );

        if (!mounted) return;
        setPurchasedSkills(checks.filter((item): item is ApiListing => item !== null));
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load your skills.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, token, user?._id]);

  const hasSkills = useMemo(() => purchasedSkills.length > 0, [purchasedSkills]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <AppNavbar activeTab="my-skills" maxWidthClass="max-w-[1200px]" />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-6">
        <p className="font-mono text-[11px] tracking-wide text-[#2563eb]">
          [ PURCHASED_SKILLS ]
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          My Skills Set
        </h1>
        <p className="mt-2 text-sm text-[#5c6178]">
          Skills you purchased are available here for quick access.
        </p>

        {!authLoading && !token && (
          <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please{" "}
            <Link href="/auth/login" className="font-semibold underline">
              sign in
            </Link>{" "}
            to see your purchased skills.
          </div>
        )}

        {loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {["my-skill-1", "my-skill-2", "my-skill-3", "my-skill-4"].map((id) => (
              <div
                key={id}
                className="h-36 animate-pulse border border-[#e5e7eb] bg-[#f8f9fc]"
              />
            ))}
          </div>
        )}

        {!!error && (
          <div className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && hasSkills && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {purchasedSkills.map((listing) => (
              <Link
                key={listing._id}
                href={`/skills/${listing._id}`}
                className="block border border-[#e5e7eb] bg-[#fafafa] p-4 transition-shadow hover:shadow-[0_10px_25px_rgba(15,18,34,0.08)]"
              >
                <p className="font-mono text-[10px] tracking-wide text-[#9aa0b5]">
                  #{listing.listingHashId}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight">{listing.title}</h2>
                <p className="mt-2 text-sm text-[#5c6178]">
                  {listing.shortDescription || listing.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-[#6b7280]">
                  <span>{formatPrice(listing.price)}</span>
                  <span>{formatBytes(listing.fileSizeBytes)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && !hasSkills && token && (
          <div className="mt-8 border border-dashed border-[#d1d5db] bg-[#fafafa] px-4 py-5 text-sm text-[#6b7280]">
            No purchased skills found yet. Browse the marketplace and buy a skill to
            see it here.
          </div>
        )}
      </main>
    </div>
  );
}

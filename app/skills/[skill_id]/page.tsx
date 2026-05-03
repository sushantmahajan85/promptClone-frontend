import { notFound } from "next/navigation";

import type { ApiListing } from "@/lib/api";

import { SkillDetailView } from "./skill-detail-view";

type Props = Readonly<{
  /** Next.js 16+: dynamic route `params` is async and must be awaited. */
  params: Promise<{ skill_id: string }>;
}>;

async function fetchListing(id: string): Promise<ApiListing | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!base || !id) return null;
  try {
    const res = await fetch(`${base}/api/listings/${id}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!data.success) return null;
    return data.listing as ApiListing;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { skill_id } = await params;
  const listing = await fetchListing(skill_id);
  if (!listing) return { title: "Skill | SkillKart" };
  return {
    title: `${listing.title} | SkillKart`,
    description: listing.shortDescription,
  };
}

export default async function SkillPage({ params }: Props) {
  const { skill_id } = await params;
  const listing = await fetchListing(skill_id);
  if (!listing) notFound();
  return <SkillDetailView listing={listing} />;
}

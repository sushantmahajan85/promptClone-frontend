/**
 * Fallback taxonomy when `GET /api/listings/categories` is unavailable.
 * Backend should return the same `slug` values for `ListingsQuery.category`.
 */
export const FALLBACK_LISTING_CATEGORIES: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: "content-social", label: "Content & Social Media" },
  { slug: "seo-growth", label: "SEO & Growth" },
  { slug: "design-creative", label: "Design & Creative" },
  { slug: "development-code", label: "Development & Code" },
  { slug: "video-media", label: "Video & Media" },
  { slug: "research-data", label: "Research & Data" },
  { slug: "business-productivity", label: "Business & Productivity" },
  { slug: "web3-blockchain", label: "Web3 & Blockchain" },
];

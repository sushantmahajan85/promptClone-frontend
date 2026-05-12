"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { type ListingCategoryOption, listingsApi } from "@/lib/api";
import { iconForCategory } from "@/lib/category-icons";
import { FALLBACK_LISTING_CATEGORIES } from "@/lib/explore-categories";

export function HomeCategoryGrid() {
  const [categories, setCategories] = useState<ListingCategoryOption[]>([
    ...FALLBACK_LISTING_CATEGORIES,
  ]);

  useEffect(() => {
    listingsApi
      .listCategories()
      .then(({ categories: cats }) => {
        if (cats.length > 0) setCategories(cats);
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  const visible = categories.slice(0, 8);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {visible.map((cat) => (
        <Link
          key={cat.slug}
          href={`/explore?category=${cat.slug}`}
          className="flex items-center gap-3 rounded-xl border border-[#eceefa] bg-white px-4 py-3.5 transition-all hover:border-[#2563eb]/30 hover:bg-[#f5f8ff] hover:shadow-sm"
        >
          <span className="shrink-0 text-xl" aria-hidden>
            {iconForCategory(cat.label, cat.slug)}
          </span>
          <span className="text-xs font-semibold leading-snug text-[#4a5068]">
            {cat.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { NavAuth } from "@/components/nav-auth";

export function LandingNavbar() {
  return (
    <header className="mb-16 sm:mb-24">
      <div className="flex items-center gap-3">
        <BrandLogo
          textClassName="text-lg font-semibold sm:text-xl"
          iconSize={32}
          className="min-w-0 shrink-0"
        />
        <nav className="mx-auto flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#7a7f93]">
          <Link href="/explore" className="hover:text-[#0f1222]">
            Explore
          </Link>
          <Link href="/sell/upload" className="hover:text-[#0f1222]">
            Sell
          </Link>
          <button type="button" className="bg-transparent p-0 hover:text-[#0f1222]">
            Docs
          </button>
        </nav>
        <div className="shrink-0">
          <NavAuth />
        </div>
      </div>
    </header>
  );
}

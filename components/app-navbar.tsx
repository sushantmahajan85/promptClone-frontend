import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { NavAuth } from "@/components/nav-auth";

type NavTab = "explore" | "sell" | "my-skills";

type AppNavbarProps = Readonly<{
  activeTab?: NavTab;
  maxWidthClass?: string;
}>;

function tabClasses(isActive: boolean) {
  const base = "border-b-2 pb-0.5";
  return isActive
    ? `${base} border-black font-medium text-black`
    : `${base} border-transparent hover:text-[#0f1222]`;
}

export function AppNavbar({
  activeTab,
  maxWidthClass = "max-w-[1400px]",
}: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#eceef5] bg-white/95 backdrop-blur">
      <div
        className={`mx-auto flex ${maxWidthClass} flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:gap-6 md:px-6`}
      >
        <BrandLogo className="shrink-0" />
        <nav className="flex min-w-0 flex-1 basis-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[#5c6178] sm:basis-auto md:gap-7">
          <Link href="/explore" className={tabClasses(activeTab === "explore")}>
            Explore
          </Link>
          <Link href="/sell/upload" className={tabClasses(activeTab === "sell")}>
            Sell
          </Link>
          <Link href="/my-skills" className={tabClasses(activeTab === "my-skills")}>
            My skills set
          </Link>
        </nav>
        <div className="ml-auto shrink-0">
          <NavAuth />
        </div>
      </div>
    </header>
  );
}

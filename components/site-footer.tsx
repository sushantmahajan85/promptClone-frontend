import Link from "next/link";

import { SupportTicketButton } from "@/components/support-ticket-button";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#eef0f8] bg-[#fafbff]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-[#0f1222]">
              <span className="text-base font-bold tracking-tight">SkillKart</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-[#6b728e]">
              The marketplace for AI skills. Buy, sell, and deploy
              battle-tested AI capabilities.
            </p>
            <a
              href="mailto:support@myskillkart.com"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#2563eb] hover:underline"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              support@myskillkart.com
            </a>
          </div>

          {/* Marketplace */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa0b5]">
              Marketplace
            </p>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/explore", label: "Browse skills" },
                { href: "/explore?sortBy=top_rated", label: "Top rated" },
                { href: "/explore?sortBy=newest", label: "Newest" },
                { href: "/sell/upload", label: "Sell a skill" },
                { href: "/sell/dashboard", label: "Seller dashboard" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[#5c6178] hover:text-[#0f1222]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa0b5]">
              Company
            </p>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/my-skills", label: "My skills" },
                { href: "/auth/login", label: "Sign in" },
                { href: "/auth/register", label: "Create account" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[#5c6178] hover:text-[#0f1222]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa0b5]">
              Legal & Support
            </p>
            <ul className="mt-4 space-y-3">
              {[
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/refund-policy", label: "Refund Policy" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-[#5c6178] hover:text-[#0f1222]">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <SupportTicketButton />
              </li>
              <li>
                <Link
                  href="mailto:support@myskillkart.com?subject=Report+a+skill"
                  className="text-sm text-[#5c6178] hover:text-[#0f1222]"
                >
                  Report a skill
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#eef0f8] pt-8 sm:flex-row">
          <p className="text-xs text-[#9aa0b5]">
            © {year} SkillKart. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-xs text-[#9aa0b5] hover:text-[#0f1222]">
              Terms
            </Link>
            <Link href="/refund-policy" className="text-xs text-[#9aa0b5] hover:text-[#0f1222]">
              Refund Policy
            </Link>
            <SupportTicketButton className="text-xs text-[#9aa0b5] hover:text-[#0f1222]" />
          </div>
        </div>
      </div>
    </footer>
  );
}

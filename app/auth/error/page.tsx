"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { BrandLogo } from "@/components/brand-logo";

const ERROR_MESSAGES: Record<string, string> = {
  account_exists_with_password:
    "An account with this email already exists. Please sign in with your password instead.",
  missing_token: "The sign-in link is invalid or expired.",
  invalid_token: "Could not verify your session. Please try signing in again.",
};

function ErrorContent() {
  const params = useSearchParams();
  const message = params.get("message") ?? "";
  const readable =
    ERROR_MESSAGES[message] ??
    "Something went wrong during sign-in. Please try again.";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-4 py-12 text-[#0f1222]">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <BrandLogo iconSize={36} textClassName="text-xl font-semibold" />
        </div>
        <div className="border border-red-200 bg-red-50 p-6">
          <p className="mb-1 font-mono text-[10px] tracking-[0.2em] text-red-400">
            [ AUTH / ERROR ]
          </p>
          <h1 className="text-lg font-semibold text-red-800">Sign-in failed</h1>
          <p className="mt-3 text-sm leading-relaxed text-red-700">{readable}</p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="border border-black bg-black py-2.5 text-center text-xs font-semibold tracking-[0.15em] text-white"
          >
            BACK TO LOGIN
          </Link>
          <Link
            href="/"
            className="border border-[#e5e7eb] py-2.5 text-center text-xs font-semibold tracking-wide text-[#374151] hover:bg-[#f9fafb]"
          >
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}

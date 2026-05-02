"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { authApi, isJwtValid, userFromJwt } from "@/lib/api";
import { TOKEN_KEY } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";

type Status = "loading" | "success" | "error";

function CallbackHandler() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = params.get("token");

    // 1. No token in URL
    if (!token) {
      setErrorMsg("No token was found in the redirect URL.");
      setStatus("error");
      return;
    }

    // 2. Token is already expired (decoded locally — no network call)
    if (!isJwtValid(token)) {
      setErrorMsg("The sign-in link has expired. Please try signing in again.");
      setStatus("error");
      return;
    }

    // 3. Store the token in localStorage immediately so the user is never
    //    left without a session even if the API call below fails.
    localStorage.setItem(TOKEN_KEY, token);

    // 4. Derive a minimal user object from the JWT payload (no network).
    const jwtUser = userFromJwt(token);

    // 5. Try to fetch the full profile from the API.
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";

    const finalize = (apiUser: Parameters<typeof login>[1] | null) => {
      const user = apiUser ?? jwtUser;
      if (user) {
        // Hydrate the auth context so the rest of the app knows
        // the user is logged in without a page reload.
        login(token, user);
      }
      setStatus("success");
      // Short delay so the success state is visible before redirect
      setTimeout(() => router.replace("/explore"), 400);
    };

    if (base) {
      authApi
        .me(token)
        .then(({ user: fullUser }) => finalize(fullUser))
        .catch(() => {
          // API unreachable — still proceed with JWT-derived user
          finalize(jwtUser);
        });
    } else {
      // No API URL configured — JWT fallback only
      finalize(jwtUser);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-4 text-center text-[#0f1222]">
        <BrandLogo iconSize={36} textClassName="text-xl font-semibold" />
        <div className="w-full max-w-sm border border-red-200 bg-red-50 p-6">
          <p className="font-mono text-[10px] tracking-[0.2em] text-red-400">
            [ AUTH / ERROR ]
          </p>
          <p className="mt-2 text-sm font-semibold text-red-800">
            Sign-in failed
          </p>
          <p className="mt-2 text-sm leading-relaxed text-red-700">
            {errorMsg}
          </p>
        </div>
        <a
          href="/auth/login"
          className="border border-black bg-black px-6 py-2.5 text-xs font-semibold tracking-[0.15em] text-white"
        >
          BACK TO LOGIN
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <BrandLogo iconSize={36} textClassName="text-xl font-semibold" />
      {status === "success" ? (
        <div className="flex flex-col items-center gap-2">
          <svg
            className="h-10 w-10 text-[#16a34a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="font-mono text-sm text-[#5c6178]">
            Signed in — redirecting…
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
          <p className="font-mono text-sm text-[#5c6178]">
            Completing sign in…
          </p>
        </div>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-4 text-center">
          <BrandLogo iconSize={36} textClassName="text-xl font-semibold" />
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}

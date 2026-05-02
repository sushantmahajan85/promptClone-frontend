"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function CallbackHandler() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      router.replace("/auth/error?message=missing_token");
      return;
    }
    authApi
      .me(token)
      .then(({ user }) => {
        login(token, user);
        router.replace("/explore");
      })
      .catch(() => {
        router.replace("/auth/error?message=invalid_token");
      });
  }, [login, params, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
        <p className="mt-4 font-mono text-sm text-[#5c6178]">
          Completing sign in…
        </p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#0f1222]" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}

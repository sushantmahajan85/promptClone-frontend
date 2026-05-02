"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      login(token, user);
      router.push("/explore");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-4 py-12 text-[#0f1222]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo iconSize={36} textClassName="text-xl font-semibold" />
        </div>

        <div className="border border-[#e5e7eb] bg-[#fafafa] p-6 sm:p-8">
          <p className="mb-1 font-mono text-[10px] tracking-[0.2em] text-[#9aa0b5]">
            [ AUTH / LOGIN ]
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            Sign in to SkillKart
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <label className="block">
              <span className="text-[10px] font-bold tracking-[0.12em] text-[#6b7280]">
                EMAIL
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full border border-[#e5e7eb] bg-white px-3 py-2.5 font-mono text-sm text-[#0f1222] outline-none placeholder:text-[#b4b8c9] focus:border-[#2563eb]/50"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-[0.12em] text-[#6b7280]">
                PASSWORD
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full border border-[#e5e7eb] bg-white px-3 py-2.5 font-mono text-sm text-[#0f1222] outline-none placeholder:text-[#b4b8c9] focus:border-[#2563eb]/50"
              />
            </label>

            {error && (
              <p className="border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-black bg-black py-2.5 text-xs font-semibold tracking-[0.15em] text-white disabled:opacity-60"
            >
              {loading ? "SIGNING IN…" : "SIGN IN"}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e5e7eb]" />
              <span className="text-[11px] text-[#9aa0b5]">or</span>
              <div className="h-px flex-1 bg-[#e5e7eb]" />
            </div>
            <a
              href={authApi.googleUrl()}
              className="mt-4 flex w-full items-center justify-center gap-2 border border-[#e5e7eb] bg-white py-2.5 text-xs font-semibold tracking-wide text-[#374151] hover:bg-[#f9fafb]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-[#6b7280]">
          No account?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-[#0f1222] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppNavbar } from "@/components/app-navbar";
import { type SellerInviteRequest, usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SellerInvitePage() {
  const { token, user, loading: authLoading } = useAuth();
  const [skillType, setSkillType] = useState("");
  const [skillSummary, setSkillSummary] = useState("");
  const [request, setRequest] = useState<SellerInviteRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!cancelled) setLoadingRequest(true);
    }, 0);
    usersApi
      .getMySellerInviteRequest(token)
      .then((res) => {
        if (cancelled) return;
        setRequest(res.request);
        setSkillType(res.request.skillType ?? "");
        setSkillSummary(res.request.skillSummary ?? "");
      })
      .catch(() => {
        if (!cancelled) setRequest(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingRequest(false);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [token]);

  const submitRequest = async () => {
    if (!token) return;
    if (!skillType.trim()) {
      setError("Skill type is required.");
      return;
    }
    if (!skillSummary.trim()) {
      setError("Skill summary is required.");
      return;
    }
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await usersApi.becomeSeller(token, {
        skillType: skillType.trim(),
        skillSummary: skillSummary.trim(),
      });
      setRequest(res.request);
      setSuccess("Seller invite request submitted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = request?.status === "pending";
  const isApproved = request?.status === "approved";

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <AppNavbar activeTab="sell" maxWidthClass="max-w-[1200px]" />
      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8 md:px-6">
        <p className="font-mono text-[11px] tracking-wide text-[#2563eb]">[ SELLER_INVITE ]</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Seller Access Request
        </h1>
        <p className="mt-2 text-sm text-[#5c6178]">
          Share your skill expertise so admins can review and approve your seller access.
        </p>

        {!authLoading && !token ? (
          <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please{" "}
            <Link href="/auth/login" className="font-semibold underline">
              sign in
            </Link>{" "}
            to submit a seller invite request.
          </div>
        ) : null}

        {user?.sellerStatus === "active" ? (
          <div className="mt-8 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Your seller access is active. You can upload skills from{" "}
            <Link href="/sell/upload" className="font-semibold underline">
              /sell/upload
            </Link>
            .
          </div>
        ) : null}

        {!!token && (
          <section className="mt-8 border border-[#e5e7eb] bg-white p-5 sm:p-6">
            {loadingRequest ? (
              <p className="text-sm text-[#6b7280]">Loading existing request...</p>
            ) : (
              <>
                {request ? (
                  <div className="mb-5 border border-[#e5e7eb] bg-[#fafafa] p-3 text-sm">
                    <p className="font-medium">
                      Current status:{" "}
                      <span className="uppercase tracking-wide">{request.status}</span>
                    </p>
                    {request.adminNotes ? (
                      <p className="mt-2 text-[#5c6178]">Admin notes: {request.adminNotes}</p>
                    ) : null}
                  </div>
                ) : null}

                <label className="block">
                  <span className="text-xs font-medium text-[#6b7280]">Skill type</span>
                  <input
                    type="text"
                    value={skillType}
                    disabled={isPending || isApproved}
                    onChange={(e) => setSkillType(e.target.value)}
                    placeholder="e.g. Content Writing"
                    className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]/60 disabled:bg-[#f9fafb]"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="text-xs font-medium text-[#6b7280]">Skill summary</span>
                  <textarea
                    value={skillSummary}
                    disabled={isPending || isApproved}
                    onChange={(e) => setSkillSummary(e.target.value)}
                    placeholder="Describe your expertise and what kind of skills you will publish."
                    rows={5}
                    className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]/60 disabled:bg-[#f9fafb]"
                  />
                </label>

                {!!error && (
                  <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </p>
                )}
                {!!success && (
                  <p className="mt-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {success}
                  </p>
                )}

                {!isPending && !isApproved && (
                  <button
                    type="button"
                    onClick={() => void submitRequest()}
                    disabled={submitting}
                    className="mt-5 border border-black bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit request"}
                  </button>
                )}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

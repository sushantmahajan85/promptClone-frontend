"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { NavAuth } from "@/components/nav-auth";
import { useAuth } from "@/lib/auth-context";
import { formatPrice, paymentsApi } from "@/lib/api";

type SellerDashboardPayload = {
  totalEarnings: number;
  pendingPayouts: number;
  completedTransactions: unknown[];
  listingBreakdown: {
    listingId: string;
    title: string;
    totalSales: number;
    totalEarnings: number;
  }[];
};

export default function SellerDashboardPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<SellerDashboardPayload | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");

    paymentsApi
      .sellerDashboard(token)
      .then((payload) => {
        if (!mounted) return;
        setData({
          totalEarnings: payload.totalEarnings,
          pendingPayouts: payload.pendingPayouts,
          completedTransactions: payload.completedTransactions,
          listingBreakdown: payload.listingBreakdown,
        });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, token]);

  const totalSales = useMemo(
    () =>
      data?.listingBreakdown.reduce((acc, item) => acc + (item.totalSales ?? 0), 0) ??
      0,
    [data],
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <header className="sticky top-0 z-20 border-b border-[#eceef5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:justify-between md:px-6">
          <BrandLogo className="shrink-0" />
          <nav className="order-3 flex w-full min-w-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#eef0f8] pt-3 text-sm text-[#5c6178] md:order-none md:w-auto md:flex-1 md:justify-center md:border-0 md:pt-0 md:gap-8">
            <Link href="/explore" className="hover:text-[#0f1222]">
              Explore
            </Link>
            <Link href="/sell" className="hover:text-[#0f1222]">
              Sell
            </Link>
            <span className="border-b-2 border-[#2563eb] pb-0.5 font-medium text-[#0f1222]">
              Dashboard
            </span>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            <NavAuth />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-6">
        <p className="break-all font-mono text-[11px] tracking-wide text-[#2563eb] sm:text-xs">
          [ SELLER_ANALYTICS ]
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Seller Dashboard
          </h1>
          <Link
            href="/sell"
            className="border border-black bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white"
          >
            Upload New Skill
          </Link>
        </div>
        <p className="mt-2 text-sm text-[#5c6178]">
          Track how much you have earned from all published skills till date.
        </p>

        {!authLoading && !user && (
          <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please{" "}
            <Link href="/auth/login" className="font-semibold underline">
              sign in
            </Link>{" "}
            to view your seller earnings.
          </div>
        )}

        {(authLoading || loading) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["summary-1", "summary-2", "summary-3"].map((skeletonId) => (
              <div
                key={skeletonId}
                className="h-28 animate-pulse border border-[#e5e7eb] bg-[#f8f9fc]"
              />
            ))}
          </div>
        )}

        {!!error && (
          <div className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!authLoading && !loading && !error && data && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="border border-[#e5e7eb] bg-[#fafafa] p-5">
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#9aa0b5]">
                  [ TOTAL EARNINGS ]
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f1222]">
                  {formatPrice(data.totalEarnings)}
                </p>
              </article>
              <article className="border border-[#e5e7eb] bg-[#fafafa] p-5">
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#9aa0b5]">
                  [ PENDING PAYOUTS ]
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f1222]">
                  {formatPrice(data.pendingPayouts)}
                </p>
              </article>
              <article className="border border-[#e5e7eb] bg-[#fafafa] p-5">
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#9aa0b5]">
                  [ TOTAL SALES ]
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#0f1222]">{totalSales}</p>
                <p className="mt-2 text-xs text-[#6b7280]">
                  {data.completedTransactions.length} completed transactions
                </p>
              </article>
            </section>

            <section className="mt-8 border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                <h2 className="text-sm font-semibold tracking-wide text-[#0f1222]">
                  Earnings by Skill
                </h2>
              </div>

              {data.listingBreakdown.length === 0 ? (
                <p className="px-4 py-6 text-sm text-[#6b7280]">
                  No completed sales yet. Publish skills and share them to start earning.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#e5e7eb] text-sm">
                    <thead className="bg-[#fafafa] text-left font-mono text-[11px] uppercase tracking-wide text-[#6b7280]">
                      <tr>
                        <th className="px-4 py-3">Skill</th>
                        <th className="px-4 py-3">Sales</th>
                        <th className="px-4 py-3">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f2f8]">
                      {data.listingBreakdown.map((item) => (
                        <tr key={item.listingId}>
                          <td className="px-4 py-3 text-[#0f1222]">{item.title}</td>
                          <td className="px-4 py-3 text-[#3d4459]">{item.totalSales}</td>
                          <td className="px-4 py-3 font-medium text-[#0f1222]">
                            {formatPrice(item.totalEarnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

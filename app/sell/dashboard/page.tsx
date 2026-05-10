"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppNavbar } from "@/components/app-navbar";
import { formatPrice, paymentsApi, type ApiTransaction, type ApiWithdrawal } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type SellerDashboardPayload = {
  totalEarnings: number;
  pendingPayouts: number;
  completedTransactions: ApiTransaction[];
  listingBreakdown: {
    listingId: string;
    title: string;
    totalSales: number;
    totalEarnings: number;
  }[];
  withdrawalHistory: ApiWithdrawal[];
};

type SellerPaymentDetails = {
  country: string;
  currency: string;
  legalEntityName: string;
  email: string;
  bankName: string;
  accountHolderName: string;
  accountType: string;
  accountNumber: string;
  iban: string;
  bicSwift: string;
  routingNumber: string;
  ifscCode: string;
  sortCode: string;
  bsbCode: string;
  transitNumber: string;
  institutionNumber: string;
};

type BankRequirement =
  | "bankName"
  | "accountHolderName"
  | "accountType"
  | "accountNumber"
  | "iban"
  | "bicSwift"
  | "routingNumber"
  | "ifscCode"
  | "sortCode"
  | "bsbCode"
  | "transitNumber"
  | "institutionNumber";

type CountryOption = {
  code: string;
  label: string;
  currencies: string[];
  requiredFields: BankRequirement[];
};

const COUNTRY_OPTIONS: CountryOption[] = [
  {
    code: "US",
    label: "United States",
    currencies: ["USD"],
    requiredFields: [
      "bankName",
      "accountHolderName",
      "accountType",
      "accountNumber",
      "routingNumber",
    ],
  },
  {
    code: "IN",
    label: "India",
    currencies: ["INR", "USD"],
    requiredFields: ["bankName", "accountHolderName", "accountNumber", "ifscCode"],
  },
  {
    code: "GB",
    label: "United Kingdom",
    currencies: ["GBP", "EUR", "USD"],
    requiredFields: ["bankName", "accountHolderName", "accountNumber", "sortCode"],
  },
  {
    code: "DE",
    label: "Germany (SEPA)",
    currencies: ["EUR", "USD"],
    requiredFields: ["accountHolderName", "iban", "bicSwift"],
  },
  {
    code: "AU",
    label: "Australia",
    currencies: ["AUD", "USD"],
    requiredFields: ["bankName", "accountHolderName", "accountNumber", "bsbCode"],
  },
  {
    code: "CA",
    label: "Canada",
    currencies: ["CAD", "USD"],
    requiredFields: [
      "bankName",
      "accountHolderName",
      "accountNumber",
      "transitNumber",
      "institutionNumber",
    ],
  },
  {
    code: "OTHER",
    label: "Other country",
    currencies: ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "SGD"],
    requiredFields: ["bankName", "accountHolderName", "accountNumber", "bicSwift"],
  },
];

const FIELD_LABELS: Record<BankRequirement, string> = {
  bankName: "Bank Name",
  accountHolderName: "Account Holder Name",
  accountType: "Account Type",
  accountNumber: "Account Number",
  iban: "IBAN",
  bicSwift: "BIC / SWIFT Code",
  routingNumber: "Routing Number (ABA)",
  ifscCode: "IFSC Code",
  sortCode: "Sort Code",
  bsbCode: "BSB Code",
  transitNumber: "Transit Number",
  institutionNumber: "Institution Number",
};

/** Minimum pending balance (cents) before the Withdraw action is shown ($30.00). */
const WITHDRAW_MIN_CENTS = 3000;
/** Entered withdrawal must be strictly more than $30.00 (same 3000-cent floor for comparison). */
const WITHDRAW_AMOUNT_MIN_EXCLUSIVE_CENTS = 3000;

const defaultPaymentDetails: SellerPaymentDetails = {
  country: "US",
  currency: "USD",
  legalEntityName: "",
  email: "",
  bankName: "",
  accountHolderName: "",
  accountType: "",
  accountNumber: "",
  iban: "",
  bicSwift: "",
  routingNumber: "",
  ifscCode: "",
  sortCode: "",
  bsbCode: "",
  transitNumber: "",
  institutionNumber: "",
};

const emptyDashboard: SellerDashboardPayload = {
  totalEarnings: 0,
  pendingPayouts: 0,
  completedTransactions: [],
  listingBreakdown: [],
  withdrawalHistory: [],
};

export default function SellerDashboardPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [paymentDetails, setPaymentDetails] =
    useState<SellerPaymentDetails>(defaultPaymentDetails);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSaved, setPaymentSaved] = useState(false);
  const withdrawDialogRef = useRef<HTMLDialogElement>(null);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [data, setData] = useState<SellerDashboardPayload>(emptyDashboard);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setDashboardLoading(false);
      return;
    }

    let mounted = true;
    setDashboardLoading(true);
    setDashboardError("");

    paymentsApi
      .sellerDashboard(token)
      .then((res) => {
        if (mounted) {
          setData({
            totalEarnings: res.totalEarnings,
            pendingPayouts: res.pendingPayouts,
            completedTransactions: res.completedTransactions,
            listingBreakdown: res.listingBreakdown,
            withdrawalHistory: res.withdrawalHistory ?? [],
          });
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setDashboardError(
            err instanceof Error ? err.message : "Failed to load dashboard data."
          );
        }
      })
      .finally(() => {
        if (mounted) setDashboardLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authLoading, token]);

  const totalSales = useMemo(
    () =>
      data.listingBreakdown.reduce((acc, item) => acc + (item.totalSales ?? 0), 0),
    [data],
  );

  const openWithdrawModal = useCallback(() => {
    setWithdrawError("");
    setWithdrawAmountInput("");
    withdrawDialogRef.current?.showModal();
  }, []);

  const closeWithdrawModal = useCallback(() => {
    if (withdrawSubmitting) return;
    withdrawDialogRef.current?.close();
  }, [withdrawSubmitting]);

  const submitWithdraw = async () => {
    if (!token) return;
    setWithdrawError("");
    const raw = withdrawAmountInput.trim();
    if (!raw) {
      setWithdrawError("Enter an amount to withdraw.");
      return;
    }
    const dollars = Number.parseFloat(raw);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      setWithdrawError("Enter a valid dollar amount.");
      return;
    }
    const cents = Math.round(dollars * 100);
    if (cents <= WITHDRAW_AMOUNT_MIN_EXCLUSIVE_CENTS) {
      setWithdrawError("Amount must be greater than $30.00.");
      return;
    }
    if (cents > data.pendingPayouts) {
      setWithdrawError(
        `Amount cannot exceed your pending balance (${formatPrice(data.pendingPayouts)}).`,
      );
      return;
    }

    setWithdrawSubmitting(true);
    try {
      const { withdrawal } = await paymentsApi.withdraw(
        token,
        cents,
        paymentDetails as unknown as Record<string, unknown>,
      );
      // Optimistically update balance and prepend to history
      const optimisticWithdrawal: ApiWithdrawal = {
        _id: withdrawal._id,
        type: "withdrawal",
        sellerId: "",
        amount: withdrawal.amount,
        status: withdrawal.status as ApiWithdrawal["status"],
        bankDetails: paymentDetails as unknown as Record<string, unknown>,
        createdAt: withdrawal.createdAt,
      };
      setData((prev) => ({
        ...prev,
        pendingPayouts: Math.max(0, prev.pendingPayouts - cents),
        withdrawalHistory: [optimisticWithdrawal, ...prev.withdrawalHistory],
      }));
      withdrawDialogRef.current?.close();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Withdrawal failed. Try again.");
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const savePaymentDetails = () => {
    setPaymentError("");
    setPaymentSaved(false);

    if (!paymentDetails.legalEntityName.trim()) {
      setPaymentError("Business / legal entity name is required.");
      return;
    }

    if (!paymentDetails.email.trim()) {
      setPaymentError("Payout contact email is required.");
      return;
    }

    const selectedCountry =
      COUNTRY_OPTIONS.find((country) => country.code === paymentDetails.country) ??
      COUNTRY_OPTIONS[0];

    for (const field of selectedCountry.requiredFields) {
      const value = paymentDetails[field];
      if (!value.trim()) {
        setPaymentError(`${FIELD_LABELS[field]} is required.`);
        return;
      }
    }

    setPaymentSaved(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <AppNavbar activeTab="sell" maxWidthClass="max-w-[1200px]" />

      <dialog
        ref={withdrawDialogRef}
        className="m-0 border-0 bg-transparent p-0 shadow-none backdrop:bg-black/45 [&:not([open])]:hidden"
        aria-labelledby="withdraw-dialog-title"
        onCancel={(e) => {
          if (withdrawSubmitting) e.preventDefault();
        }}
        onClose={() => {
          setWithdrawError("");
          setWithdrawAmountInput("");
        }}
      >
        <div className="fixed inset-0 z-50 flex min-h-dvh w-full items-center justify-center p-4">
        <div className="relative w-full max-w-md border border-[#e5e7eb] bg-white p-5 shadow-[0_20px_50px_rgba(15,18,34,0.18)] sm:p-6">
            <h2
              id="withdraw-dialog-title"
              className="text-lg font-semibold tracking-tight text-[#0f1222]"
            >
              Confirm withdrawal
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c6178]">
              Enter how much of your pending balance you want to withdraw. The amount must be
              greater than <span className="font-medium text-[#0f1222]">$30.00</span> and cannot
              exceed your current pending total.
            </p>
            <p className="mt-2 text-xs text-[#6b7280]">
              Available pending:{" "}
              <span className="font-mono font-semibold text-[#0f1222]">
                {formatPrice(data.pendingPayouts)}
              </span>
            </p>
            <label className="mt-5 block">
              <span className="text-xs font-medium text-[#6b7280]">Amount (USD)</span>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#9aa0b5]">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={withdrawAmountInput}
                  onChange={(e) => {
                    setWithdrawAmountInput(e.target.value);
                    setWithdrawError("");
                  }}
                  placeholder="e.g. 45.00"
                  className="w-full border border-[#e5e7eb] bg-[#fafafa] py-2.5 pl-7 pr-3 font-mono text-sm text-[#0f1222] outline-none focus:border-[#2563eb]/50"
                />
              </div>
            </label>
            {withdrawError ? (
              <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {withdrawError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={withdrawSubmitting}
                onClick={closeWithdrawModal}
                className="w-full border border-[#e5e7eb] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#f9fafb] sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={withdrawSubmitting}
                onClick={submitWithdraw}
                className="w-full border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1d2e] disabled:opacity-60 sm:w-auto"
              >
                {withdrawSubmitting ? "Processing…" : "Confirm withdrawal"}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-6">
        <p className="break-all font-mono text-[11px] tracking-wide text-[#2563eb] sm:text-xs">
          [ SELLER_ANALYTICS ]
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Seller Dashboard
          </h1>
          {user?.sellerStatus === "active" ? (
            <Link
              href="/sell/upload"
              className="border border-black bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white"
            >
              Upload New Skill
            </Link>
          ) : (
            <Link
              href="/sell/invite"
              className="border border-black bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white"
            >
              Request Seller Access
            </Link>
          )}
        </div>
        <p className="mt-2 text-sm text-[#5c6178]">
          Track how much you have earned from all published skills till date.
        </p>
        <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[#6b7280]">
          Pending payouts can be withdrawn once your pending balance is{" "}
          <span className="font-medium text-[#0f1222]">$30 or more</span>. Below
          that threshold, funds stay in pending until additional sales bring the
          balance up.
        </p>

        {!authLoading && !token && (
          <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please{" "}
            <Link href="/auth/login" className="font-semibold underline">
              sign in
            </Link>{" "}
            to view your seller dashboard.
          </div>
        )}
        {!authLoading && !!token && user?.sellerStatus !== "active" && (
          <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account is not approved for selling yet. Submit your seller invite request{" "}
            <Link href="/sell/invite" className="font-semibold underline">
              here
            </Link>
            .
          </div>
        )}

        {dashboardError && (
          <div className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardError}
          </div>
        )}

        {dashboardLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["d-a", "d-b", "d-c"].map((id) => (
              <div key={id} className="h-28 animate-pulse border border-[#e5e7eb] bg-[#f8f9fc]" />
            ))}
          </div>
        ) : (
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
                {data.pendingPayouts >= WITHDRAW_MIN_CENTS && (
                  <button
                    type="button"
                    onClick={openWithdrawModal}
                    className="mt-4 w-full border border-black bg-black px-3 py-2 text-xs font-semibold tracking-wide text-white hover:bg-[#1a1d2e]"
                  >
                    Withdraw
                  </button>
                )}
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

        {/* Withdrawal history — always visible once data loads */}
        {!dashboardLoading && (
          <section className="mt-8 border border-[#e5e7eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <h2 className="text-sm font-semibold tracking-wide text-[#0f1222]">
                Withdrawal History
              </h2>
              <span className="font-mono text-[10px] tracking-[0.14em] text-[#9aa0b5]">
                [ WITHDRAWALS ]
              </span>
            </div>

            {data.withdrawalHistory.length === 0 ? (
              <p className="px-4 py-6 text-sm text-[#6b7280]">
                No withdrawals yet. Once your pending balance reaches $30, you can request a payout.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#e5e7eb] text-sm">
                  <thead className="bg-[#fafafa] text-left font-mono text-[11px] uppercase tracking-wide text-[#6b7280]">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Bank / Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f2f8]">
                    {data.withdrawalHistory.map((w) => {
                      const bd = (w.bankDetails ?? {}) as Record<string, string>;
                      const bankSummary = [bd.bankName, bd.accountNumber ? `····${bd.accountNumber.slice(-4)}` : null]
                        .filter(Boolean)
                        .join(" · ") || "—";
                      return (
                        <tr key={w._id}>
                          <td className="px-4 py-3 text-[#5c6178]">
                            {new Date(w.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#0f1222]">
                            {formatPrice(w.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${
                                w.status === "completed"
                                  ? "bg-green-50 text-green-700"
                                  : w.status === "failed"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#5c6178]">
                            {bankSummary}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

            <section className="mt-8 border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-4 py-3">
                <h2 className="text-sm font-semibold tracking-wide text-[#0f1222]">
                  Payout Details (Universal Recipient)
                </h2>
                <p className="mt-1 text-xs text-[#6b7280]">
                  Bank transfer only. Choose country and currency to see required bank fields.
                </p>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-xs font-medium text-[#6b7280]">Payout Method</span>
                  <input
                    type="text"
                    value="Bank transfer"
                    readOnly
                    className="mt-1 w-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-[#4b5563] outline-none"
                  />
                </label>

                <label>
                  <span className="text-xs font-medium text-[#6b7280]">Recipient Country</span>
                  <select
                    value={paymentDetails.country}
                    onChange={(e) => {
                      const selected = COUNTRY_OPTIONS.find(
                        (country) => country.code === e.target.value,
                      );
                      setPaymentSaved(false);
                      setPaymentDetails((prev) => ({
                        ...prev,
                        country: e.target.value,
                        currency: selected?.currencies[0] ?? prev.currency,
                      }));
                    }}
                    className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]/60"
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-xs font-medium text-[#6b7280]">Settlement Currency</span>
                  <select
                    value={paymentDetails.currency}
                    onChange={(e) => {
                      setPaymentSaved(false);
                      setPaymentDetails((prev) => ({ ...prev, currency: e.target.value }));
                    }}
                    className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]/60"
                  >
                    {(COUNTRY_OPTIONS.find((country) => country.code === paymentDetails.country)
                      ?.currencies ?? ["USD"]
                    ).map((currencyCode) => (
                      <option key={currencyCode} value={currencyCode}>
                        {currencyCode}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-xs font-medium text-[#6b7280]">
                    Business / Legal Entity Name
                  </span>
                  <input
                    type="text"
                    value={paymentDetails.legalEntityName}
                    onChange={(e) => {
                      setPaymentSaved(false);
                      setPaymentDetails((prev) => ({
                        ...prev,
                        legalEntityName: e.target.value,
                      }));
                    }}
                    placeholder="Entity receiving payouts"
                    className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]/60"
                  />
                </label>

                <label>
                  <span className="text-xs font-medium text-[#6b7280]">Payout Contact Email</span>
                  <input
                    type="email"
                    value={paymentDetails.email}
                    onChange={(e) => {
                      setPaymentSaved(false);
                      setPaymentDetails((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                    }}
                    placeholder="finance@company.com"
                    className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]/60"
                  />
                </label>

                {(COUNTRY_OPTIONS.find((country) => country.code === paymentDetails.country)
                  ?.requiredFields ?? []
                ).map((field) => (
                  <label key={field} className={field === "iban" ? "sm:col-span-2" : ""}>
                    <span className="text-xs font-medium text-[#6b7280]">
                      {FIELD_LABELS[field]}
                    </span>
                    {field === "accountType" ? (
                      <select
                        value={paymentDetails.accountType}
                        onChange={(e) => {
                          setPaymentSaved(false);
                          setPaymentDetails((prev) => ({
                            ...prev,
                            accountType: e.target.value,
                          }));
                        }}
                        className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#2563eb]/60"
                      >
                        <option value="">Select account type</option>
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="current">Current</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={paymentDetails[field]}
                        onChange={(e) => {
                          setPaymentSaved(false);
                          setPaymentDetails((prev) => ({
                            ...prev,
                            [field]:
                              field === "ifscCode" || field === "bicSwift"
                                ? e.target.value.toUpperCase()
                                : e.target.value,
                          }));
                        }}
                        placeholder={`Enter ${FIELD_LABELS[field]}`}
                        className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]/60"
                      />
                    )}
                  </label>
                ))}

                <label className="sm:col-span-2">
                  <span className="text-xs font-medium text-[#6b7280]">
                    Account Holder Name
                  </span>
                  <input
                    type="text"
                    value={paymentDetails.accountHolderName}
                    onChange={(e) => {
                      setPaymentSaved(false);
                      setPaymentDetails((prev) => ({
                        ...prev,
                        accountHolderName: e.target.value,
                      }));
                    }}
                    placeholder="Enter full legal name"
                    className="mt-1 w-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#2563eb]/60"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-[#e5e7eb] px-4 py-3">
                <button
                  type="button"
                  onClick={savePaymentDetails}
                  className="border border-black bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white"
                >
                  Save payment details
                </button>
                {paymentSaved && (
                  <p className="text-xs text-[#16a34a]">
                    Payment details saved successfully.
                  </p>
                )}
                {!!paymentError && (
                  <p className="text-xs text-red-700">{paymentError}</p>
                )}
              </div>
            </section>
      </main>
    </div>
  );
}

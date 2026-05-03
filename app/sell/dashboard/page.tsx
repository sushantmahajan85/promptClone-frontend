"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppNavbar } from "@/components/app-navbar";
import { formatPrice } from "@/lib/api";

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

export default function SellerDashboardPage() {
  const [paymentDetails, setPaymentDetails] =
    useState<SellerPaymentDetails>(defaultPaymentDetails);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [data] = useState<SellerDashboardPayload>({
    totalEarnings: 1284200,
    pendingPayouts: 74200,
    completedTransactions: Array.from({ length: 34 }),
    listingBreakdown: [
      {
        listingId: "demo-listing-1",
        title: "Vision Parser Pro",
        totalSales: 22,
        totalEarnings: 924000,
      },
      {
        listingId: "demo-listing-2",
        title: "Excel Tracker Assistant",
        totalSales: 8,
        totalEarnings: 240000,
      },
      {
        listingId: "demo-listing-3",
        title: "Contract Summarizer",
        totalSales: 4,
        totalEarnings: 120200,
      },
    ],
  });

  const totalSales = useMemo(
    () =>
      data.listingBreakdown.reduce((acc, item) => acc + (item.totalSales ?? 0), 0),
    [data],
  );

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

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-6">
        <p className="break-all font-mono text-[11px] tracking-wide text-[#2563eb] sm:text-xs">
          [ SELLER_ANALYTICS ]
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Seller Dashboard
          </h1>
          <Link
            href="/sell/upload"
            className="border border-black bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white"
          >
            Upload New Skill
          </Link>
        </div>
        <p className="mt-2 text-sm text-[#5c6178]">
          Track how much you have earned from all published skills till date.
        </p>
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

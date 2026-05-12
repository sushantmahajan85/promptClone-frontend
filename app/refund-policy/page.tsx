import Link from "next/link";

import { LandingNavbar } from "@/components/landing-navbar";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Refund Policy — SkillKart",
};

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0f1222]">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <LandingNavbar />
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 sm:px-6">
        <div className="mb-10">
          <Link href="/" className="text-xs text-[#7a8099] hover:text-[#0f1222]">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Refund Policy
          </h1>
          <p className="mt-2 text-sm text-[#6b728e]">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* TL;DR callout */}
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-900">Summary</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            We do <strong>not</strong> offer refunds for change-of-mind purchases. Refunds are only
            issued when a skill demonstrably does not work as described and the seller is unable to
            resolve the issue within 5 business days.
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-[#3a4060] [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#0f1222] [&_p]:mt-3 [&_p]:leading-7 [&_ul]:mt-3 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:leading-7">

          <h2>1. Our General Policy</h2>
          <p>
            All sales on SkillKart are <strong>final</strong>. Because skill packages are digital
            goods that are instantly accessible after purchase, we do not issue refunds for
            change-of-mind, accidental purchases, or because the skill did not meet subjective
            expectations that were not stated in the listing.
          </p>
          <p>
            We encourage buyers to review the listing description, demo media, and{" "}
            <span className="font-mono text-[13px]">skills.md</span> documentation carefully before
            purchasing.
          </p>

          <h2>2. When a Refund Is Eligible</h2>
          <p>
            A refund may be granted in the following circumstances:
          </p>
          <ul>
            <li>
              <strong>Skill does not function as described:</strong> The skill fails to perform the
              core functionality explicitly stated in the listing description or{" "}
              <span className="font-mono text-[12px]">skills.md</span> file.
            </li>
            <li>
              <strong>Download is inaccessible or corrupt:</strong> You are unable to download the
              skill package after multiple attempts, or the downloaded file is corrupted.
            </li>
            <li>
              <strong>Duplicate charge:</strong> You were charged more than once for the same skill.
            </li>
            <li>
              <strong>Fraudulent listing:</strong> The listing was found to be fraudulent or in
              violation of our Terms &amp; Conditions after your purchase.
            </li>
          </ul>

          <h2>3. Refund Process</h2>
          <p>To request a refund:</p>
          <ul>
            <li>
              Contact us at{" "}
              <a href="mailto:support@myskillkart.com" className="text-[#2563eb] hover:underline">
                support@myskillkart.com
              </a>{" "}
              within <strong>14 days</strong> of your purchase.
            </li>
            <li>
              Include your order ID, the skill name, and a clear description of the issue you
              encountered.
            </li>
            <li>
              Provide evidence where possible (e.g., screenshots, error messages, or a short
              description of the steps you followed).
            </li>
          </ul>
          <p>
            We will forward your report to the seller, who will have <strong>5 business days</strong>{" "}
            to resolve the issue or respond. If the issue cannot be resolved, we will process a full
            refund to your original payment method within 5–10 business days.
          </p>

          <h2>4. What Is Not Covered</h2>
          <ul>
            <li>Change of mind after purchase.</li>
            <li>
              Incompatibility with a specific LLM, runtime, or environment not mentioned in the
              listing.
            </li>
            <li>
              Issues arising from modifications you made to the skill after downloading it.
            </li>
            <li>Buyer&apos;s lack of technical knowledge required to use the skill.</li>
            <li>Requests submitted more than 14 days after the purchase date.</li>
          </ul>

          <h2>5. Chargebacks</h2>
          <p>
            We strongly encourage buyers to contact us before initiating a chargeback with their
            bank or card issuer. Illegitimate chargebacks may result in permanent account suspension.
            We cooperate fully with payment providers to resolve disputes in good faith.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            SkillKart reserves the right to update this Refund Policy at any time. The updated
            policy will apply to purchases made after the revision date shown above. Existing
            purchases are governed by the policy in effect at the time of purchase.
          </p>

          <h2>7. Contact</h2>
          <p>
            Questions about this policy? Reach us at{" "}
            <a href="mailto:support@myskillkart.com" className="text-[#2563eb] hover:underline">
              support@myskillkart.com
            </a>. We aim to respond within 1 business day.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

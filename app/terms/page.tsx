import Link from "next/link";

import { LandingNavbar } from "@/components/landing-navbar";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Terms & Conditions — SkillKart",
};

export default function TermsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-[#6b728e]">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-[#3a4060] [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#0f1222] [&_p]:mt-3 [&_p]:leading-7 [&_ul]:mt-3 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:leading-7">

          <p>
            Welcome to SkillKart. By accessing or using our platform, you agree to be bound by these
            Terms &amp; Conditions. Please read them carefully before making any purchase or listing.
          </p>

          <h2>1. The Platform</h2>
          <p>
            SkillKart is a marketplace that connects sellers of AI skill packages with buyers who wish
            to use those skills in their own agents, workflows, and applications. SkillKart acts as an
            intermediary platform and is not responsible for the content, quality, or legality of
            individual skill listings beyond what is stated in our review policy.
          </p>

          <h2>2. Accounts</h2>
          <ul>
            <li>You must be at least 18 years old to create an account and transact on SkillKart.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>
              You agree not to impersonate any person or entity or misrepresent your affiliation with
              any person or entity.
            </li>
            <li>
              SkillKart reserves the right to suspend or terminate any account found to be in
              violation of these terms.
            </li>
          </ul>

          <h2>3. Purchases</h2>
          <p>
            All purchases on SkillKart are one-time payments. Upon successful payment, you receive a
            non-exclusive, non-transferable licence to use the purchased skill for your personal or
            commercial projects. You may not resell, redistribute, or sublicence the skill to third
            parties.
          </p>
          <ul>
            <li>Prices are displayed in USD and include applicable taxes where required.</li>
            <li>Payment is processed securely via our payment provider (Stripe).</li>
            <li>You will receive a download link immediately after payment is confirmed.</li>
            <li>
              SkillKart does not store your full card details; all payment data is handled by Stripe.
            </li>
          </ul>

          <h2>4. Seller Responsibilities</h2>
          <p>
            Sellers are responsible for the accuracy, quality, and originality of their listings.
            By listing a skill, you warrant that:
          </p>
          <ul>
            <li>You own all necessary rights to the content you are selling.</li>
            <li>Your skill does not infringe any third-party intellectual property.</li>
            <li>Your listing description accurately reflects the functionality of the skill.</li>
            <li>You will respond in good faith to buyer disputes.</li>
          </ul>
          <p>
            SkillKart takes a platform fee on each sale. The current fee structure is displayed on
            your seller dashboard. We reserve the right to update fees with 30 days' notice.
          </p>

          <h2>5. Prohibited Content</h2>
          <p>The following types of skills or content are strictly prohibited on SkillKart:</p>
          <ul>
            <li>Skills designed to generate malware, spam, or harmful content.</li>
            <li>Skills that facilitate illegal activities or violate applicable law.</li>
            <li>Skills that infringe third-party intellectual property rights.</li>
            <li>Skills that collect or misuse personal data without consent.</li>
            <li>Deceptive or misleading descriptions.</li>
          </ul>
          <p>
            SkillKart reserves the right to remove any listing that violates these rules and to
            suspend the associated seller account.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on SkillKart — including the platform design, logo, and original text — is
            the property of SkillKart and protected by applicable intellectual property laws. Skills
            listed by sellers remain the property of their respective creators; SkillKart claims no
            ownership over seller content.
          </p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            SkillKart is provided on an "as is" and "as available" basis. We make no warranties,
            expressed or implied, regarding the platform or any skill listed on it, including
            warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, SkillKart shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the
            platform or any skill purchased through it.
          </p>

          <h2>9. Changes to These Terms</h2>
          <p>
            We may update these Terms &amp; Conditions from time to time. Material changes will be
            communicated via email or a prominent notice on the platform. Continued use of SkillKart
            after such changes constitutes acceptance of the updated terms.
          </p>

          <h2>10. Contact</h2>
          <p>
            If you have questions about these Terms &amp; Conditions, please contact us at{" "}
            <a href="mailto:support@myskillkart.com" className="text-[#2563eb] hover:underline">
              support@myskillkart.com
            </a>.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

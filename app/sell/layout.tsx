import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Upload New Skill | SkillKart",
  description:
    "Convert your local logic into a portable AI skill primitive.",
};

export default function SellLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}

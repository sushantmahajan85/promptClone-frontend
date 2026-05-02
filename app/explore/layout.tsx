import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace Explorer | SkillKart",
  description:
    "Browse verified high-performance skills for your modular AI stack.",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { notFound } from "next/navigation";

import { getSkillByRouteId } from "@/lib/skill-registry";

import { SkillDetailView } from "./skill-detail-view";

type Props = Readonly<{
  params: Promise<{ skill_id: string }>;
}>;

export async function generateMetadata({ params }: Props) {
  const { skill_id } = await params;
  const skill = getSkillByRouteId(skill_id);
  if (!skill) {
    return { title: "Skill | SkillKart" };
  }
  return {
    title: `${skill.title} | SkillKart`,
    description: skill.shortDescription,
  };
}

export default async function SkillPage({ params }: Props) {
  const { skill_id } = await params;
  const skill = getSkillByRouteId(skill_id);
  if (!skill) {
    notFound();
  }
  return <SkillDetailView skill={skill} />;
}

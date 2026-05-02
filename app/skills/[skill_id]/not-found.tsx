import Link from "next/link";

export default function SkillNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-[#0f1222]">
      <p className="text-lg font-medium">Skill not found</p>
      <p className="max-w-sm text-sm text-[#5c6178]">
        That skill ID is not in the registry. Return to the marketplace to pick
        another module.
      </p>
      <Link
        href="/explore"
        className="border border-black bg-black px-5 py-2 text-xs font-semibold tracking-wide text-white"
      >
        Browse Explore
      </Link>
    </div>
  );
}

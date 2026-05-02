import Link from "next/link";

export default function SkillNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-4 py-10 text-center text-[#0f1222] sm:px-6">
      <p className="text-base font-medium sm:text-lg">Skill not found</p>
      <p className="max-w-sm text-sm leading-relaxed text-[#5c6178]">
        That skill ID is not in the registry. Return to the marketplace to pick
        another module.
      </p>
      <Link
        href="/explore"
        className="w-full max-w-xs border border-black bg-black px-5 py-2.5 text-center text-xs font-semibold tracking-wide text-white sm:w-auto sm:py-2"
      >
        Browse Explore
      </Link>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = Readonly<{
  className?: string;
  textClassName?: string;
  iconSize?: number;
}>;

export function BrandLogo({
  className = "",
  textClassName = "text-lg font-semibold",
  iconSize = 32,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 text-[#0f1222] ${className}`}
    >
      <Image
        src="/skillkart-logo.svg"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0"
        priority
      />
      <span className={`tracking-tight ${textClassName}`}>SkillKart</span>
    </Link>
  );
}

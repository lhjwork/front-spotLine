import Link from "next/link";

interface AreaCtaProps {
  area: string;
  areaLabel?: string;
}

export default function AreaCta({ area, areaLabel }: AreaCtaProps) {
  return (
    <Link
      href={`/feed?area=${area}`}
      className="block w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      {areaLabel || area} 지역 더 보기 →
    </Link>
  );
}

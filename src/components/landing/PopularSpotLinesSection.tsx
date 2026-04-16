import Link from "next/link";
import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import type { SpotLinePreview } from "@/types";

interface PopularSpotLinesSectionProps {
  spotLines: SpotLinePreview[];
}

export default function PopularSpotLinesSection({ spotLines }: PopularSpotLinesSectionProps) {
  if (spotLines.length === 0) return null;

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">지금 인기 있는 SpotLine</h2>
          <Link href="/feed" className="text-sm text-blue-600 hover:underline">
            전체 보기 &rarr;
          </Link>
        </div>
        <div className="scrollbar-hide flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
          {spotLines.map((sl) => (
            <div key={sl.id} className="min-w-[280px] flex-shrink-0 snap-center">
              <SpotLinePreviewCard spotLine={sl} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

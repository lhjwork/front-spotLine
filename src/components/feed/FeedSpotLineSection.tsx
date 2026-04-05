import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import FeedCreateCTA from "./FeedCreateCTA";
import type { SpotLinePreview } from "@/types";

interface FeedSpotLineSectionProps {
  spotLines: SpotLinePreview[];
}

export default function FeedSpotLineSection({ spotLines }: FeedSpotLineSectionProps) {
  return (
    <section className="px-4 py-4">
      <FeedCreateCTA />
      {spotLines.length > 0 && (
        <>
          <h2 className="mt-4 mb-3 text-lg font-bold text-gray-900">인기 SpotLine</h2>
          <div className="flex flex-col gap-3">
            {spotLines.map((spotLine) => (
              <SpotLinePreviewCard key={spotLine.id} spotLine={spotLine} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

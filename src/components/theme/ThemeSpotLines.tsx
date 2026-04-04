import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import type { SpotLinePreview } from "@/types";

interface ThemeSpotLinesProps {
  spotLines: SpotLinePreview[];
}

export default function ThemeSpotLines({ spotLines }: ThemeSpotLinesProps) {
  if (spotLines.length === 0) {
    return (
      <section className="px-4 py-8 text-center">
        <p className="text-sm text-gray-400">아직 등록된 코스가 없습니다</p>
      </section>
    );
  }

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-gray-900">인기 SpotLine</h2>
      <div className="flex flex-col gap-3">
        {spotLines.map((spotLine) => (
          <SpotLinePreviewCard key={spotLine.id} spotLine={spotLine} />
        ))}
      </div>
    </section>
  );
}

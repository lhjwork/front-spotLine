import { cn } from "@/lib/utils";
import type { SpotLineSpotDetail } from "@/types";

const segmentColors: Record<string, string> = {
  DATE: "bg-pink-400",
  TRAVEL: "bg-blue-400",
  WALK: "bg-green-400",
  HANGOUT: "bg-yellow-400",
  FOOD_TOUR: "bg-red-400",
  CAFE_TOUR: "bg-amber-400",
  CULTURE: "bg-purple-400",
};

interface SpotLineProgressBarProps {
  spots: SpotLineSpotDetail[];
  totalDuration: number;
  theme?: string;
}

export default function SpotLineProgressBar({ spots, totalDuration, theme }: SpotLineProgressBarProps) {
  if (!totalDuration || spots.length === 0) return null;

  const sorted = [...spots].sort((a, b) => a.order - b.order);
  const segmentColor = segmentColors[theme || ""] || "bg-blue-400";

  // Build segments: [stay, walk, stay, walk, ..., stay]
  const segments: { type: "stay" | "walk"; duration: number; label: string }[] = [];

  sorted.forEach((spot, i) => {
    const stay = spot.stayDuration || Math.round(totalDuration / spots.length);
    segments.push({ type: "stay", duration: stay, label: spot.spotTitle });

    if (i < sorted.length - 1 && spot.walkingTimeToNext) {
      segments.push({ type: "walk", duration: spot.walkingTimeToNext, label: "도보" });
    }
  });

  const totalSegmentDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-1.5">
      {/* Progress bar */}
      <div className="flex h-2 overflow-hidden rounded-full bg-gray-100">
        {segments.map((seg, i) => {
          const pct = (seg.duration / totalSegmentDuration) * 100;
          return (
            <div
              key={i}
              className={cn(
                "min-w-[4px] transition-all",
                seg.type === "stay" ? segmentColor : "bg-gray-200"
              )}
              style={{ width: `${pct}%` }}
              title={`${seg.label} ${seg.duration}분`}
            />
          );
        })}
      </div>

      {/* Labels */}
      {sorted.length >= 2 && (
        <div className="flex justify-between">
          {sorted.map((spot) => (
            <span key={spot.spotId} className="truncate text-[10px] text-gray-400 max-w-[80px]">
              {spot.spotTitle}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

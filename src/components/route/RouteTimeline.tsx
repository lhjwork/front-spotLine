import RouteTimelineItem from "./RouteTimelineItem";
import type { RouteSpotDetail } from "@/types";

interface RouteTimelineProps {
  spots: RouteSpotDetail[];
}

export default function RouteTimeline({ spots }: RouteTimelineProps) {
  const sorted = [...spots].sort((a, b) => a.order - b.order);

  return (
    <section className="mt-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">경로 타임라인</h2>
      <div>
        {sorted.map((spot, index) => (
          <RouteTimelineItem
            key={spot.spotId}
            spot={spot}
            isLast={index === sorted.length - 1}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

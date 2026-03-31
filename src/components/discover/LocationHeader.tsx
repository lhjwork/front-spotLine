"use client";

import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationHeaderProps {
  area: string | null;
  locationGranted: boolean;
  className?: string;
}

export default function LocationHeader({
  area,
  locationGranted,
  className,
}: LocationHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {locationGranted ? (
        <Navigation className="h-4 w-4 text-blue-600" />
      ) : (
        <MapPin className="h-4 w-4 text-gray-400" />
      )}
      <span className="text-sm font-medium text-gray-700">
        {locationGranted && area
          ? `${area} 근처`
          : locationGranted
            ? "현재 위치 근처"
            : "인기 Spot"}
      </span>
    </div>
  );
}

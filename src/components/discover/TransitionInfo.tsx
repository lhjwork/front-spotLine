"use client";

import { ArrowDown, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/utils";

interface TransitionInfoProps {
  distanceMeters: number;
  walkingTimeMinutes: number;
  className?: string;
}

export default function TransitionInfo({
  distanceMeters,
  walkingTimeMinutes,
  className,
}: TransitionInfoProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1 py-3", className)}>
      <ArrowDown className="h-5 w-5 text-gray-300" />
      <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
        <Footprints className="h-3.5 w-3.5 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">
          도보 {walkingTimeMinutes}분 · {formatDistance(distanceMeters)}
        </span>
      </div>
    </div>
  );
}

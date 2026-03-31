"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationPermissionBannerProps {
  onRequestLocation: () => void;
  className?: string;
}

export default function LocationPermissionBanner({
  onRequestLocation,
  className,
}: LocationPermissionBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3",
        className
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
        <MapPin className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-blue-800">
          위치를 허용하면 근처 Spot을 찾아드려요
        </p>
        <p className="text-xs text-blue-600/70">
          위치 없이도 인기 Spot을 둘러볼 수 있어요
        </p>
      </div>
      <button
        onClick={onRequestLocation}
        className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
      >
        허용하기
      </button>
    </div>
  );
}

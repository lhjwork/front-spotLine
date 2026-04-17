"use client";

import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpotChecklistProps {
  mySpotLineId: string;
  spots: { spotId: string; name: string }[];
  onAllChecked: () => void;
}

const getStorageKey = (id: string) => `spotline_checklist_${id}`;

const readChecklist = (id: string): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(getStorageKey(id));
    if (!raw) return {};
    const items: { spotId: string; checked: boolean }[] = JSON.parse(raw);
    return Object.fromEntries(items.map((i) => [i.spotId, i.checked]));
  } catch {
    return {};
  }
};

const saveChecklist = (id: string, checkedMap: Record<string, boolean>) => {
  const items = Object.entries(checkedMap).map(([spotId, checked]) => ({ spotId, checked }));
  localStorage.setItem(getStorageKey(id), JSON.stringify(items));
};

export default function SpotChecklist({
  mySpotLineId,
  spots,
  onAllChecked,
}: SpotChecklistProps) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCheckedMap(readChecklist(mySpotLineId));
  }, [mySpotLineId]);

  const toggleSpot = useCallback(
    (spotId: string) => {
      setCheckedMap((prev) => {
        const updated = { ...prev, [spotId]: !prev[spotId] };
        saveChecklist(mySpotLineId, updated);

        // 전체 체크 확인
        const allChecked = spots.every((s) => updated[s.spotId]);
        if (allChecked) {
          setTimeout(() => onAllChecked(), 300);
        }

        return updated;
      });
    },
    [mySpotLineId, spots, onAllChecked]
  );

  const checkedCount = spots.filter((s) => checkedMap[s.spotId]).length;
  const progress = spots.length > 0 ? Math.round((checkedCount / spots.length) * 100) : 0;

  return (
    <div className="mt-2 space-y-2">
      {spots.map(({ spotId, name }) => (
        <button
          key={spotId}
          onClick={() => toggleSpot(spotId)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
            checkedMap[spotId]
              ? "bg-green-50 text-green-700"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          )}
        >
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
              checkedMap[spotId]
                ? "border-green-500 bg-green-500 text-white"
                : "border-gray-300"
            )}
          >
            {checkedMap[spotId] && <Check className="h-3 w-3" />}
          </div>
          <span className={checkedMap[spotId] ? "line-through" : ""}>{name}</span>
        </button>
      ))}

      {/* Progress bar */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500">
          {checkedCount}/{spots.length}
        </span>
      </div>
    </div>
  );
}

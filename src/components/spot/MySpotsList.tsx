"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMySpotStore } from "@/store/useMySpotStore";
import MySpotCard from "./MySpotCard";
import type { SpotStatus } from "@/types";

const TABS: { label: string; value: SpotStatus | "ALL" }[] = [
  { label: "전체", value: "ALL" },
  { label: "검토 중", value: "PENDING" },
  { label: "승인됨", value: "APPROVED" },
  { label: "반려됨", value: "REJECTED" },
];

export default function MySpotsList() {
  const { spots, isLoading, fetchSpots, removeSpot } = useMySpotStore();
  const [activeTab, setActiveTab] = useState<SpotStatus | "ALL">("ALL");

  useEffect(() => {
    const status = activeTab === "ALL" ? undefined : activeTab;
    fetchSpots(status);
  }, [activeTab, fetchSpots]);

  const handleDelete = async (slug: string) => {
    if (!confirm("이 Spot을 삭제하시겠습니까?")) return;
    await removeSpot(slug);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <MapPin className="mb-2 h-10 w-10" />
          <p className="text-sm">등록한 Spot이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {spots.map((spot) => (
            <MySpotCard key={spot.id} spot={spot} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

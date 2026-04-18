"use client";

import type { PartnerDailyTrend } from "@/types";

export interface PartnerAnalyticsChartProps {
  data: PartnerDailyTrend[];
  brandColor: string;
}

export default function PartnerAnalyticsChart({ data, brandColor }: PartnerAnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        데이터가 없습니다
      </div>
    );
  }

  const maxScans = Math.max(...data.map((d) => d.scans), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">일별 스캔 트렌드</h3>
      <div className="flex h-48 items-end gap-1 md:h-64">
        {data.map((item) => {
          const height = (item.scans / maxScans) * 100;
          const dateLabel = item.date.slice(5).replace("-", "/");
          return (
            <div key={item.date} className="group flex flex-1 flex-col items-center gap-1">
              <div className="relative w-full">
                <div
                  className="mx-auto w-full max-w-[24px] rounded-t transition-opacity group-hover:opacity-80"
                  style={{ height: `${Math.max(height, 2)}%`, backgroundColor: brandColor }}
                />
                <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                  {item.scans}회
                </div>
              </div>
              <span className="text-[10px] text-gray-400">{dateLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

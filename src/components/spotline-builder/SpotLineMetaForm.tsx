"use client";

import { useSpotLineBuilderStore } from "@/store/useSpotLineBuilderStore";
import type { SpotLineTheme } from "@/types";

const THEME_OPTIONS: { value: SpotLineTheme; label: string }[] = [
  { value: "DATE", label: "데이트" },
  { value: "TRAVEL", label: "여행" },
  { value: "WALK", label: "산책" },
  { value: "HANGOUT", label: "모임" },
  { value: "FOOD_TOUR", label: "맛집 투어" },
  { value: "CAFE_TOUR", label: "카페 투어" },
  { value: "CULTURE", label: "문화" },
];

export default function SpotLineMetaForm() {
  const title = useSpotLineBuilderStore((s) => s.title);
  const description = useSpotLineBuilderStore((s) => s.description);
  const theme = useSpotLineBuilderStore((s) => s.theme);
  const area = useSpotLineBuilderStore((s) => s.area);
  const setTitle = useSpotLineBuilderStore((s) => s.setTitle);
  const setDescription = useSpotLineBuilderStore((s) => s.setDescription);
  const setTheme = useSpotLineBuilderStore((s) => s.setTheme);
  const setArea = useSpotLineBuilderStore((s) => s.setArea);

  return (
    <div className="space-y-3 border-t border-gray-100 px-4 pt-4">
      {/* 제목 */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="나만의 코스 이름 *"
          maxLength={50}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium outline-none placeholder:text-gray-400 focus:border-purple-400"
        />
        {title.length > 0 && title.trim().length < 2 && (
          <p className="mt-1 text-xs text-red-500">2자 이상 입력해주세요</p>
        )}
      </div>

      {/* 테마 */}
      <div className="flex flex-wrap gap-2">
        {THEME_OPTIONS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTheme(theme === t.value ? null : t.value)}
            className={
              theme === t.value
                ? "rounded-full bg-purple-600 px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 지역 (자동 추론) */}
      <div>
        <input
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="지역 (Spot에서 자동 추론)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-purple-400"
        />
      </div>

      {/* 소개 */}
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="한줄 소개 (선택)"
          maxLength={200}
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-purple-400"
        />
        {description.length > 0 && (
          <p className="text-right text-xs text-gray-400">
            {description.length}/200
          </p>
        )}
      </div>
    </div>
  );
}

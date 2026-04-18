"use client";

import { cn } from "@/lib/utils";
import { AREA_CENTERS, CATEGORY_COLORS } from "@/constants/explore";
import { THEMES } from "@/constants/themes";
import type { SpotCategory } from "@/types";

const CATEGORY_LABELS: Record<SpotCategory, string> = {
  CAFE: "카페",
  RESTAURANT: "맛집",
  BAR: "바",
  NATURE: "자연",
  CULTURE: "문화",
  EXHIBITION: "전시",
  WALK: "산책",
  ACTIVITY: "액티비티",
  SHOPPING: "쇼핑",
  OTHER: "기타",
};

export interface SearchFiltersProps {
  tab: "spot" | "spotline" | "blog";
  area: string | null;
  category: string | null;
  theme: string | null;
  onAreaChange: (area: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onThemeChange: (theme: string | null) => void;
}

export default function SearchFilters({
  tab,
  area,
  category,
  theme,
  onAreaChange,
  onCategoryChange,
  onThemeChange,
}: SearchFiltersProps) {
  const areas = Object.keys(AREA_CENTERS);
  const categories = Object.keys(CATEGORY_COLORS) as SpotCategory[];

  return (
    <div className="space-y-2 border-b border-gray-100 px-4 py-2">
      {/* Area 칩 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <ChipButton active={!area} onClick={() => onAreaChange(null)}>
          전체
        </ChipButton>
        {areas.map((a) => (
          <ChipButton
            key={a}
            active={area === a}
            onClick={() => onAreaChange(area === a ? null : a)}
          >
            {a}
          </ChipButton>
        ))}
      </div>

      {/* Category (Spot 탭) / Theme (SpotLine 탭) 칩 — Blog 탭은 area만 */}
      {tab === "spot" ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <ChipButton
            active={!category}
            onClick={() => onCategoryChange(null)}
          >
            전체
          </ChipButton>
          {categories.map((c) => (
            <ChipButton
              key={c}
              active={category === c}
              onClick={() =>
                onCategoryChange(category === c ? null : c)
              }
            >
              {CATEGORY_LABELS[c]}
            </ChipButton>
          ))}
        </div>
      ) : tab === "spotline" ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <ChipButton active={!theme} onClick={() => onThemeChange(null)}>
            전체
          </ChipButton>
          {THEMES.map((t) => (
            <ChipButton
              key={t.slug}
              active={theme === t.slug}
              onClick={() =>
                onThemeChange(theme === t.slug ? null : t.slug)
              }
            >
              {t.name}
            </ChipButton>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {children}
    </button>
  );
}

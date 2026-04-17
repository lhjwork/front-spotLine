import type { SpotCategory, SpotLineTheme, FeedSort, PartnerTier } from "@/types";

// 한국어 라벨 매핑
export const SPOT_CATEGORY_LABELS: Record<SpotCategory, string> = {
  CAFE: "카페",
  RESTAURANT: "레스토랑",
  BAR: "바/펍",
  NATURE: "자연",
  CULTURE: "문화",
  EXHIBITION: "전시",
  WALK: "산책",
  ACTIVITY: "액티비티",
  SHOPPING: "쇼핑",
  OTHER: "기타",
};

export const SPOTLINE_THEME_LABELS: Record<SpotLineTheme, string> = {
  DATE: "데이트",
  TRAVEL: "여행",
  WALK: "산책",
  HANGOUT: "놀거리",
  FOOD_TOUR: "맛집 투어",
  CAFE_TOUR: "카페 투어",
  CULTURE: "문화",
};

export const FEED_SORT_LABELS: Record<FeedSort, string> = {
  POPULAR: "인기순",
  NEWEST: "최신순",
};

export const PARTNER_TIER_LABELS: Record<PartnerTier, string> = {
  BASIC: "베이직",
  PREMIUM: "프리미엄",
};

// Slug ↔ Enum 변환 (URL용)
const THEME_SLUG_MAP: Record<SpotLineTheme, string> = {
  DATE: "date",
  TRAVEL: "travel",
  WALK: "walk",
  HANGOUT: "hangout",
  FOOD_TOUR: "food-tour",
  CAFE_TOUR: "cafe-tour",
  CULTURE: "culture",
};

const SLUG_THEME_MAP: Record<string, SpotLineTheme> = Object.fromEntries(
  Object.entries(THEME_SLUG_MAP).map(([k, v]) => [v, k as SpotLineTheme])
) as Record<string, SpotLineTheme>;

export const themeToSlug = (theme: SpotLineTheme): string =>
  THEME_SLUG_MAP[theme] ?? theme.toLowerCase().replace(/_/g, "-");

export const slugToTheme = (slug: string): SpotLineTheme | undefined =>
  SLUG_THEME_MAP[slug];

// Category slug 변환 (category는 단순 lowercase)
export const categoryToSlug = (cat: SpotCategory): string => cat.toLowerCase();
export const slugToCategory = (slug: string): SpotCategory | undefined => {
  const upper = slug.toUpperCase() as SpotCategory;
  return upper in SPOT_CATEGORY_LABELS ? upper : undefined;
};

// 모든 값 배열 (select/filter UI용)
export const ALL_SPOT_CATEGORIES: SpotCategory[] = Object.keys(SPOT_CATEGORY_LABELS) as SpotCategory[];
export const ALL_SPOTLINE_THEMES: SpotLineTheme[] = Object.keys(SPOTLINE_THEME_LABELS) as SpotLineTheme[];

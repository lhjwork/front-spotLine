import type { ThemeInfo, SpotLineTheme, SpotCategory } from "@/types";

export const THEMES: ThemeInfo[] = [
  { slug: "date", name: "데이트", theme: "DATE" as SpotLineTheme, description: "특별한 데이트를 위한 추천 코스", colorClass: "bg-pink-100 text-pink-700", iconName: "Heart" },
  { slug: "travel", name: "여행", theme: "TRAVEL" as SpotLineTheme, description: "서울 여행자를 위한 추천 코스", colorClass: "bg-blue-100 text-blue-700", iconName: "Plane" },
  { slug: "walk", name: "산책", theme: "WALK" as SpotLineTheme, description: "여유로운 산책을 위한 추천 코스", colorClass: "bg-green-100 text-green-700", iconName: "Footprints" },
  { slug: "hangout", name: "놀거리", theme: "HANGOUT" as SpotLineTheme, description: "친구와 함께 즐기는 놀거리 코스", colorClass: "bg-yellow-100 text-yellow-700", iconName: "Sparkles" },
  { slug: "food-tour", name: "맛집 투어", theme: "FOOD_TOUR" as SpotLineTheme, description: "미식가를 위한 맛집 투어 코스", colorClass: "bg-red-100 text-red-700", iconName: "UtensilsCrossed" },
  { slug: "cafe-tour", name: "카페 투어", theme: "CAFE_TOUR" as SpotLineTheme, description: "분위기 좋은 카페 투어 코스", colorClass: "bg-amber-100 text-amber-700", iconName: "Coffee" },
  { slug: "culture", name: "문화", theme: "CULTURE" as SpotLineTheme, description: "전시, 공연, 문화 체험 코스", colorClass: "bg-purple-100 text-purple-700", iconName: "Palette" },
];

export const findThemeBySlug = (slug: string): ThemeInfo | undefined =>
  THEMES.find((t) => t.slug === slug);

export const THEME_CATEGORY_MAP: Record<string, SpotCategory[]> = {
  DATE: ["CAFE", "RESTAURANT", "CULTURE"],
  TRAVEL: ["CULTURE", "NATURE", "WALK"],
  WALK: ["WALK", "NATURE", "CAFE"],
  HANGOUT: ["ACTIVITY", "BAR", "SHOPPING"],
  FOOD_TOUR: ["RESTAURANT"],
  CAFE_TOUR: ["CAFE"],
  CULTURE: ["CULTURE", "EXHIBITION"],
};

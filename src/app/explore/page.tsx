import type { Metadata } from "next";

import ExplorePage from "@/components/explore/ExplorePage";

export const metadata: Metadata = {
  title: "탐색 | Spotline",
  description: "지도에서 주변 카페, 맛집, 문화 공간을 탐색하세요",
};

export default function ExploreRoute() {
  return <ExplorePage />;
}

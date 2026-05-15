import type { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/landing/HeroSection";
import PopularSpotLinesSection from "@/components/landing/PopularSpotLinesSection";
import CityThemeSection from "@/components/landing/CityThemeSection";
import ServiceIntroSection from "@/components/landing/ServiceIntroSection";
import LatestSpotsSection from "@/components/landing/LatestSpotsSection";
import LandingCTA from "@/components/landing/LandingCTA";
import OnboardingWrapper from "@/components/landing/OnboardingWrapper";
// [BACKEND_REQUIRED] import { fetchPopularSpotLines, fetchFeedSpots } from "@/lib/api";
// [BACKEND_REQUIRED] import type { SpotLinePreview, SpotDetailResponse } from "@/types";
//test


export const metadata: Metadata = {
  title: "Spotline — 다음 장소, Spotline이 추천해요",
  description:
    "지금 있는 장소에서 다음에 가기 좋은 곳을 발견하세요. 인기 SpotLine, 도시별 코스, 테마별 추천까지.",
  openGraph: {
    title: "Spotline — 다음 장소, Spotline이 추천해요",
    description: "지금 있는 장소에서 다음에 가기 좋은 곳을 발견하세요.",
    type: "website",
  },
};

// [BACKEND_REQUIRED] async function getPopularSpotLines(): Promise<SpotLinePreview[]> {
//   try {
//     return await fetchPopularSpotLines(undefined, 6);
//   } catch {
//     return [];
//   }
// }

// [BACKEND_REQUIRED] async function getLatestSpots(): Promise<SpotDetailResponse[]> {
//   try {
//     const response = await fetchFeedSpots(undefined, undefined, 0, 6, "latest");
//     return response.content;
//   } catch {
//     return [];
//   }
// }

export default async function Home() {
  // [BACKEND_REQUIRED] const [popularSpotLines, latestSpots] = await Promise.all([
  //   getPopularSpotLines(),
  //   getLatestSpots(),
  // ]);

  return (
    <Layout showFooter>
      <HeroSection />
      <PopularSpotLinesSection spotLines={[]} />
      <CityThemeSection />
      <ServiceIntroSection />
      <LatestSpotsSection spots={[]} />
      <LandingCTA />
      <OnboardingWrapper />
    </Layout>
  );
}

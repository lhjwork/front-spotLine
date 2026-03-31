import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import CityHero from "@/components/city/CityHero";
import CityRoutes from "@/components/city/CityRoutes";
import CitySpots from "@/components/city/CitySpots";
import CityNavigation from "@/components/city/CityNavigation";
import { CITIES, findCityBySlug } from "@/constants/cities";
import { fetchFeedSpots, fetchFeedRoutes } from "@/lib/api";

export const revalidate = 3600;

interface CityPageProps {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  return CITIES.map((city) => ({ name: city.slug }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { name } = await params;
  const city = findCityBySlug(name);
  if (!city) return {};

  return {
    title: `${city.name} 인기 경험 · 카페, 맛집, 문화 | Spotline`,
    description: city.description,
    openGraph: {
      title: `${city.name} 탐색 | Spotline`,
      description: city.description,
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { name } = await params;
  const city = findCityBySlug(name);
  if (!city) notFound();

  const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, last: true, first: true };
  const [spotsResult, routesResult] = await Promise.all([
    fetchFeedSpots(city.area, undefined, 0, 12).catch(() => emptyPage as Awaited<ReturnType<typeof fetchFeedSpots>>),
    fetchFeedRoutes(city.area, undefined, 0, 5).catch(() => emptyPage as Awaited<ReturnType<typeof fetchFeedRoutes>>),
  ]);

  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto">
        <CityHero city={city} />
        <CityRoutes routes={routesResult.content} />
        <CitySpots spots={spotsResult.content} cityArea={city.area} />
        <CityNavigation currentSlug={city.slug} />
      </div>
    </Layout>
  );
}

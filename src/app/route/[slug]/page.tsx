import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchRouteDetail } from "@/lib/api";
import RouteHeader from "@/components/route/RouteHeader";
import RouteTimeline from "@/components/route/RouteTimeline";
import RouteMapPreview from "@/components/route/RouteMapPreview";
import RouteVariations from "@/components/route/RouteVariations";
import RouteBottomBar from "@/components/route/RouteBottomBar";
import SocialHydrator from "@/components/social/SocialHydrator";

interface RoutePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await fetchRouteDetail(slug);

  if (!route) {
    return { title: "Route를 찾을 수 없습니다" };
  }

  const description = route.description || `${route.area}의 ${route.title} - ${route.spots.length}곳`;

  return {
    title: route.title,
    description,
    openGraph: {
      title: `${route.title} | Spotline`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: route.title,
      description,
    },
  };
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { slug } = await params;
  const route = await fetchRouteDetail(slug);

  if (!route) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <RouteHeader route={route} />

      <div className="mx-auto max-w-lg px-4">
        <RouteTimeline spots={route.spots} />

        {route.spots.length >= 2 && (
          <RouteMapPreview spots={route.spots} title={route.title} />
        )}

        {route.variationsCount > 0 && (
          <RouteVariations
            routeId={route.id}
            parentRouteId={route.parentRouteId}
            variationsCount={route.variationsCount}
          />
        )}
      </div>

      <SocialHydrator type="route" id={route.id} likesCount={route.likesCount} savesCount={route.savesCount} />
      <RouteBottomBar route={route} />
    </main>
  );
}

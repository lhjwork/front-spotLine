import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSpotLineDetail } from "@/lib/api";
import { formatWalkingTime, formatDistance } from "@/lib/utils";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/seo/Breadcrumb";
import { generateSpotLineJsonLd } from "@/lib/seo/jsonld";
import SpotLineHeader from "@/components/spotline/SpotLineHeader";
import SpotLineProgressBar from "@/components/spotline/SpotLineProgressBar";
import SpotLineTimeline from "@/components/spotline/SpotLineTimeline";
import SpotLineMapPreview from "@/components/spotline/SpotLineMapPreview";
import SpotLineMapFAB from "@/components/spotline/SpotLineMapFAB";
import SpotLineVariations from "@/components/spotline/SpotLineVariations";
import SpotLineBottomBar from "@/components/spotline/SpotLineBottomBar";
import SocialHydrator from "@/components/social/SocialHydrator";
import CommentSection from "@/components/comment/CommentSection";
import ViewTracker from "@/components/common/ViewTracker";

interface SpotLinePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SpotLinePageProps): Promise<Metadata> {
  const { slug } = await params;
  const spotLine = await fetchSpotLineDetail(slug);

  if (!spotLine) {
    return { title: "SpotLine을 찾을 수 없습니다" };
  }

  const description = spotLine.description || `${spotLine.area}의 ${spotLine.title} - ${spotLine.spots.length}곳`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  return {
    title: spotLine.title,
    description,
    alternates: {
      canonical: `${siteUrl}/spotline/${slug}`,
    },
    openGraph: {
      title: `${spotLine.title} | Spotline`,
      description,
      type: "article",
      ...(spotLine.spots?.[0]?.spotMedia?.[0] && {
        images: [{ url: spotLine.spots[0].spotMedia[0] }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: spotLine.title,
      description,
    },
  };
}

export default async function SpotLinePage({ params }: SpotLinePageProps) {
  const { slug } = await params;
  const spotLine = await fetchSpotLineDetail(slug);

  if (!spotLine) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <JsonLd data={generateSpotLineJsonLd(spotLine)} />
      <Breadcrumb items={[
        { name: spotLine.area, url: `/city/${spotLine.area}` },
        { name: spotLine.theme, url: `/theme/${spotLine.theme}` },
        { name: spotLine.title },
      ]} />
      <SpotLineHeader spotLine={spotLine} />
      <SpotLineProgressBar spots={spotLine.spots} totalDuration={spotLine.totalDuration} theme={spotLine.theme} />

      {/* Desktop: 2-column, Mobile: single column */}
      <div className="mx-auto max-w-5xl px-4 md:flex md:gap-8">
        {/* Left column: Timeline + Comments + Variations */}
        <div className="min-w-0 md:flex-1">
          <SpotLineTimeline spots={spotLine.spots} theme={spotLine.theme} />

          {/* Mobile: Map below timeline */}
          {spotLine.spots.length >= 2 && (
            <div className="md:hidden">
              <SpotLineMapPreview spots={spotLine.spots} title={spotLine.title} />
            </div>
          )}

          <div className="mt-6">
            <CommentSection targetType="SPOTLINE" targetId={spotLine.id} commentsCount={spotLine.commentsCount ?? 0} />
          </div>

          <div className="mt-6">
            <SpotLineVariations
              spotLineId={spotLine.id}
              spotLineSlug={slug}
              spotLineTitle={spotLine.title}
              parentSpotLineId={spotLine.parentSpotLineId}
              variationsCount={spotLine.variationsCount}
              originalSpots={spotLine.spots}
            />
          </div>
        </div>

        {/* Right column: Map + Course Summary (sticky, desktop only) */}
        {spotLine.spots.length >= 2 && (
          <div className="hidden md:block md:w-80 md:shrink-0">
            <div className="sticky top-4 space-y-4">
              <SpotLineMapPreview spots={spotLine.spots} title={spotLine.title} />
              {/* Course summary card */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-900">코스 요약</h3>
                <div className="mt-2 space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>전체 소요</span>
                    <span className="font-medium text-gray-700">{formatWalkingTime(spotLine.totalDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>총 거리</span>
                    <span className="font-medium text-gray-700">{formatDistance(spotLine.totalDistance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>장소 수</span>
                    <span className="font-medium text-gray-700">{spotLine.spots.length}곳</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ViewTracker type="spotline" id={spotLine.id} />
      <SocialHydrator type="spotline" id={spotLine.id} likesCount={spotLine.likesCount} savesCount={spotLine.savesCount} />
      {spotLine.spots.length >= 2 && (
        <SpotLineMapFAB spots={spotLine.spots} title={spotLine.title} />
      )}
      <SpotLineBottomBar spotLine={spotLine} />
    </main>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSpotLineDetail } from "@/lib/api";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/seo/Breadcrumb";
import { generateSpotLineJsonLd } from "@/lib/seo/jsonld";
import SpotLineHeader from "@/components/spotline/SpotLineHeader";
import SpotLineTimeline from "@/components/spotline/SpotLineTimeline";
import SpotLineMapPreview from "@/components/spotline/SpotLineMapPreview";
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

      <div className="mx-auto max-w-lg px-4">
        <SpotLineTimeline spots={spotLine.spots} />

        {spotLine.spots.length >= 2 && (
          <SpotLineMapPreview spots={spotLine.spots} title={spotLine.title} />
        )}

        <CommentSection targetType="SPOTLINE" targetId={spotLine.id} commentsCount={spotLine.commentsCount ?? 0} />

        {spotLine.variationsCount > 0 && (
          <SpotLineVariations
            spotLineId={spotLine.id}
            parentSpotLineId={spotLine.parentSpotLineId}
            variationsCount={spotLine.variationsCount}
          />
        )}
      </div>

      <ViewTracker type="spotline" id={spotLine.id} />
      <SocialHydrator type="spotline" id={spotLine.id} likesCount={spotLine.likesCount} savesCount={spotLine.savesCount} />
      <SpotLineBottomBar spotLine={spotLine} />
    </main>
  );
}

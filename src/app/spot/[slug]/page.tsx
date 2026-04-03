import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSpotDetail, fetchSpotRoutes, fetchNearbySpots } from "@/lib/api";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/seo/Breadcrumb";
import { generateSpotJsonLd } from "@/lib/seo/jsonld";
import SpotHero from "@/components/spot/SpotHero";
import SpotCrewNote from "@/components/spot/SpotCrewNote";
import SpotPlaceInfo from "@/components/spot/SpotPlaceInfo";
import SpotImageGallery from "@/components/spot/SpotImageGallery";
import SpotRoutes from "@/components/spot/SpotRoutes";
import SpotNearby from "@/components/spot/SpotNearby";
import SpotBottomBar from "@/components/spot/SpotBottomBar";
import SocialHydrator from "@/components/social/SocialHydrator";
import QrBanner from "@/components/qr/QrBanner";
import QrAnalytics from "@/components/qr/QrAnalytics";
import AreaCta from "@/components/shared/AreaCta";
import PartnerBenefit from "@/components/spot/PartnerBenefit";
import CommentSection from "@/components/comment/CommentSection";

interface SpotPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ qr?: string }>;
}

export async function generateMetadata({ params }: SpotPageProps): Promise<Metadata> {
  const { slug } = await params;
  const spot = await fetchSpotDetail(slug);

  if (!spot) {
    return { title: "Spot을 찾을 수 없습니다" };
  }

  const description = spot.crewNote || spot.description || `${spot.area}의 ${spot.title}`;
  const imageUrl = spot.placeInfo?.photos?.[0] || spot.media?.[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  return {
    title: spot.title,
    description,
    alternates: {
      canonical: `${siteUrl}/spot/${slug}`,
    },
    openGraph: {
      title: `${spot.title} | Spotline`,
      description,
      type: "article",
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: spot.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: spot.title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function SpotPage({ params, searchParams }: SpotPageProps) {
  const { slug } = await params;
  const { qr: qrId } = await searchParams;
  const isQrMode = !!qrId;
  const spot = await fetchSpotDetail(slug);

  if (!spot) {
    notFound();
  }

  const [routes, nearbySpots] = await Promise.all([
    fetchSpotRoutes(spot.id),
    fetchNearbySpots(spot.latitude, spot.longitude, spot.id, 6),
  ]);

  const allPhotos = [
    ...(spot.placeInfo?.photos || []),
    ...spot.media,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <JsonLd data={generateSpotJsonLd(spot)} />
      <Breadcrumb items={[
        { name: spot.area, url: `/city/${spot.area}` },
        { name: spot.title },
      ]} />
      <SpotHero spot={spot} />

      <div className="mx-auto max-w-lg px-4">
        {isQrMode && (
          <>
            <QrBanner storeName={spot.title} />
            <QrAnalytics spotId={spot.id} qrId={qrId!} />
          </>
        )}

        {spot.crewNote && (
          <SpotCrewNote crewNote={spot.crewNote} source={spot.source} />
        )}

        {spot.partner?.isPartner && spot.partner.benefitText && (
          <PartnerBenefit partner={spot.partner} />
        )}

        {spot.placeInfo && (
          <SpotPlaceInfo placeInfo={spot.placeInfo} />
        )}

        {allPhotos.length > 1 && (
          <SpotImageGallery photos={allPhotos} title={spot.title} />
        )}

        {routes.length > 0 && (
          <SpotRoutes routes={routes} />
        )}

        {nearbySpots.length > 0 && (
          <SpotNearby spots={nearbySpots} />
        )}

        <CommentSection targetType="SPOT" targetId={spot.id} commentsCount={spot.commentsCount ?? 0} />

        {isQrMode && spot.area && (
          <AreaCta area={spot.area} />
        )}
      </div>

      <SocialHydrator type="spot" id={spot.id} likesCount={spot.likesCount} savesCount={spot.savesCount} />
      <SpotBottomBar spot={spot} />
    </main>
  );
}

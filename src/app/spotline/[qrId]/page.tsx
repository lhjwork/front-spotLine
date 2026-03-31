import { permanentRedirect } from "next/navigation";
import { resolveQrToSpot } from "@/lib/api";
import SpotlineLegacyPage from "@/components/spotline/SpotlineLegacyPage";

interface SpotlinePageProps {
  params: Promise<{ qrId: string }>;
  searchParams: Promise<{ qr?: string }>;
}

export default async function SpotlinePage({ params, searchParams }: SpotlinePageProps) {
  const { qrId: storeId } = await params;
  const { qr: qrId } = await searchParams;

  // 데모 모드: 기존 레거시 렌더링 유지
  if (storeId.startsWith("demo_")) {
    return <SpotlineLegacyPage storeId={storeId} qrId={qrId || null} />;
  }

  // v2 Spot 조회 시도 → 성공 시 영구 리다이렉트
  const resolution = await resolveQrToSpot(storeId);

  if (resolution?.source === "v2") {
    permanentRedirect(`/spot/${resolution.slug}${qrId ? `?qr=${qrId}` : ""}`);
  }

  // v2에 없으면 기존 레거시 SpotLine 렌더링
  return <SpotlineLegacyPage storeId={storeId} qrId={qrId || null} />;
}

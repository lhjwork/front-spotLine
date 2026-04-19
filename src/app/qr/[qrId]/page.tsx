"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { resolveQrToSpot } from "@/lib/api";
import { addQrScanToHistory } from "@/lib/qr-history";

export default function QRPage() {
  const params = useParams();
  const router = useRouter();
  const qrId = params.qrId as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleQRScan = async () => {
      if (!qrId) return;

      try {
        // 데모 QR 코드인지 확인
        if (qrId === "demo_cafe_001") {
          // 데모 전용 페이지로 리다이렉트
          router.replace(`/spotline/demo-store?qr=${qrId}`);
          return;
        }

        // 실제 QR 코드 처리 (v2 우선, 레거시 fallback)
        const result = await resolveQrToSpot(qrId);

        if (result) {
          addQrScanToHistory({
            spotId: result.spotId,
            slug: result.slug,
            title: result.slug,
            category: "",
            qrId,
          });

          if (result.source === "v2") {
            router.replace(`/spot/${result.slug}?qr=${qrId}`);
          } else {
            router.replace(`/spotline/${result.spotId}?qr=${qrId}`);
          }
        } else {
          setError("등록되지 않은 QR 코드입니다");
          return;
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") console.error("QR 코드 처리 실패:", err);
        setError(err instanceof Error ? err.message : "QR 코드를 처리할 수 없습니다");
      }
    };

    handleQRScan();
  }, [qrId, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">QR 코드 오류</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => (window.location.href = "/")} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">매장 정보를 확인하는 중...</p>
      </div>
    </div>
  );
}

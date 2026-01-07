"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function QRPage() {
  const params = useParams();
  const router = useRouter();
  const qrId = params.qrId as string;

  useEffect(() => {
    // SpotLine 페이지로 리다이렉트
    if (qrId) {
      router.replace(`/spotline/${qrId}`);
    }
  }, [qrId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">SpotLine으로 이동 중...</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchSpotDetail } from "@/lib/api";
import SpotCreateForm from "@/components/spot/SpotCreateForm";
import type { SpotDetailResponse } from "@/types";

export default function EditSpotPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [spot, setSpot] = useState<SpotDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSpotDetail(params.slug);
        if (!data) {
          setError("Spot을 찾을 수 없습니다.");
          return;
        }
        if (data.status !== "PENDING" && data.status !== "REJECTED") {
          setError("승인된 Spot은 수정할 수 없습니다.");
          return;
        }
        setSpot(data);
      } catch {
        setError("Spot 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
        <button onClick={() => router.back()} className="text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Spot 수정</h1>
      </div>

      {/* Form */}
      <SpotCreateForm editData={spot} />
    </div>
  );
}

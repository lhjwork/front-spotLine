"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

const STORAGE_KEY = "spotContentGuideDismissed";

export default function SpotContentGuide() {
  const [dismissed, setDismissed] = useState(false);

  if (typeof window !== "undefined" && !dismissed && sessionStorage.getItem(STORAGE_KEY) === "true") {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="relative rounded-lg border border-blue-200 bg-blue-50 p-4">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
        aria-label="닫기"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            좋은 Spot을 만드는 팁
          </p>
          <ul className="mt-2 space-y-1 text-xs text-blue-700">
            <li>- 실제 방문한 장소를 등록해주세요</li>
            <li>- 직접 촬영한 사진을 첨부하면 승인이 빨라요</li>
            <li>- 장소의 특징을 구체적으로 설명해주세요</li>
            <li>- 정확한 주소와 카테고리를 선택해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

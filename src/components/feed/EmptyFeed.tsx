import { Compass, MapPin, Search } from "lucide-react";

interface EmptyFeedProps {
  type: "spot" | "spotline";
  onResetArea?: () => void;
  keyword?: string;
  onResetFilters?: () => void;
}

export default function EmptyFeed({ type, onResetArea, keyword, onResetFilters }: EmptyFeedProps) {
  // Keyword search empty state
  if (keyword) {
    return (
      <div className="px-4 py-16 text-center">
        <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="mb-1 text-sm font-medium text-gray-600">
          &apos;{keyword}&apos; 검색 결과가 없어요
        </p>
        <p className="text-xs text-gray-400">다른 키워드로 검색하거나 필터를 초기화해보세요</p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-4 rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            필터 초기화
          </button>
        )}
      </div>
    );
  }

  const Icon = type === "spot" ? Compass : MapPin;
  const message = type === "spot" ? "이 지역에 Spot이 아직 없어요" : "이 지역에 SpotLine이 아직 없어요";

  return (
    <div className="px-4 py-16 text-center">
      <Icon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
      <p className="mb-1 text-sm font-medium text-gray-600">{message}</p>
      {onResetArea && (
        <button
          onClick={onResetArea}
          className="mt-4 rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          전체 지역 보기
        </button>
      )}
    </div>
  );
}

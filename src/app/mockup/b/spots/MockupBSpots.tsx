"use client";

import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Star,
  Route,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

const AREA_INFO: Record<string, { name: string; subtitle: string }> = {
  seongsu: { name: "성수", subtitle: "크리에이티브 핫플레이스" },
  yeonnam: { name: "연남", subtitle: "감성 카페와 골목 맛집" },
  euljiro: { name: "을지로", subtitle: "레트로 감성과 힙한 공간" },
  ikseon: { name: "익선동", subtitle: "한옥 골목의 새로운 발견" },
  mangwon: { name: "망원", subtitle: "로컬이 사랑하는 동네" },
};

const THEME_INFO: Record<string, { name: string; subtitle: string }> = {
  "cafe-tour": { name: "카페 투어", subtitle: "분위기 좋은 카페를 따라 걷는 하루" },
  exhibition: { name: "전시 탐방", subtitle: "갤러리와 전시장을 연결하는 문화 루트" },
  "local-food": { name: "로컬 맛집", subtitle: "동네 주민이 추천하는 진짜 맛집" },
  "photo-spot": { name: "포토 스팟", subtitle: "사진 찍기 좋은 장소 모음" },
  "nature-walk": { name: "산책 코스", subtitle: "자연과 함께하는 여유로운 산책" },
  "new-open": { name: "신규 오픈", subtitle: "최근 새로 문을 연 핫한 공간들" },
};

const MOCK_SPOTS = [
  {
    id: 1,
    name: "대림창고 갤러리",
    category: "전시",
    description: "성수동의 대표적인 복합문화공간. 전시와 팝업 스토어가 수시로 열립니다.",
    image: "https://picsum.photos/seed/spot-a/400/300",
    distance: 200,
    walkingTime: 3,
    rating: 4.7,
    author: "크루 민지",
  },
  {
    id: 2,
    name: "할아버지 공장",
    category: "카페",
    description: "옛 공장 건물을 개조한 카페. 높은 천장과 빈티지한 분위기가 매력적.",
    image: "https://picsum.photos/seed/spot-b/400/300",
    distance: 350,
    walkingTime: 5,
    rating: 4.8,
    author: "크루 지훈",
  },
  {
    id: 3,
    name: "어니언 성수",
    category: "카페",
    description: "유명 베이커리 카페. 시그니처 빵과 함께하는 여유로운 시간.",
    image: "https://picsum.photos/seed/spot-c/400/300",
    distance: 500,
    walkingTime: 7,
    rating: 4.6,
    author: "크루 수연",
  },
  {
    id: 4,
    name: "성수연방",
    category: "복합공간",
    description: "쇼핑, 카페, 전시를 한 곳에서. 성수의 랜드마크 복합 공간.",
    image: "https://picsum.photos/seed/spot-d/400/300",
    distance: 600,
    walkingTime: 8,
    rating: 4.5,
    author: "크루 민지",
  },
];

// 루트 제안 카드
const ROUTE_SUGGESTION = {
  name: "성수 반나절 코스",
  spots: ["대림창고 갤러리", "할아버지 공장", "어니언 성수"],
  totalTime: "약 2시간",
  totalDistance: "1.2km",
};

export default function MockupBSpots() {
  const searchParams = useSearchParams();
  const areaId = searchParams.get("area");
  const themeId = searchParams.get("theme");

  const info = areaId
    ? AREA_INFO[areaId]
    : themeId
    ? THEME_INFO[themeId]
    : { name: "탐색", subtitle: "" };

  return (
    <Layout showFooter={false}>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="px-4 py-4">
          <Link
            href="/mockup/b"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">돌아가기</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {info?.name}
            </h1>
            <p className="text-gray-500">{info?.subtitle}</p>
          </div>
        </div>

        {/* 루트 제안 배너 */}
        <div className="mx-4 mb-6 p-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Route className="h-5 w-5" />
            <span className="text-sm font-medium text-blue-200">
              추천 루트
            </span>
          </div>
          <h3 className="text-lg font-bold mb-2">
            {ROUTE_SUGGESTION.name}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            {ROUTE_SUGGESTION.spots.map((spot, i) => (
              <span key={spot} className="flex items-center text-sm text-blue-100">
                {spot}
                {i < ROUTE_SUGGESTION.spots.length - 1 && (
                  <span className="mx-1.5 text-blue-300">→</span>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-blue-200">
            <span>{ROUTE_SUGGESTION.totalTime}</span>
            <span>{ROUTE_SUGGESTION.totalDistance}</span>
          </div>
          <button className="mt-3 w-full py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
            루트 따라가기
          </button>
        </div>

        {/* 개별 Spot 리스트 */}
        <div className="px-4 mb-2">
          <h2 className="text-lg font-bold text-gray-900">
            개별 Spot
          </h2>
        </div>

        <div className="px-4 pb-16 space-y-4">
          {MOCK_SPOTS.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex">
                {/* 이미지 */}
                <div className="relative w-32 h-32 shrink-0 bg-gray-200">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 정보 */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-purple-600 font-medium bg-purple-50 px-1.5 py-0.5 rounded">
                        {spot.category}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600">
                          {spot.rating}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {spot.name}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {spot.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {spot.distance}m
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {spot.walkingTime}분
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {spot.author}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-purple-50 border-t border-purple-200 px-4 py-2 text-center">
          <p className="text-xs text-purple-700">
            방향 B 목업 — {areaId ? "지역" : "테마"} 큐레이션 리스트 + 루트 제안
          </p>
        </div>
      </div>
    </Layout>
  );
}

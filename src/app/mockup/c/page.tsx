"use client";

import {
  QrCode,
  MapPin,
  ArrowRight,
  Smartphone,
  Coffee,
  Palette,
  Route,
  Compass,
  Clock,
  Star,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

// 최근 콘텐츠 목업 데이터
const RECENT_SPOTS = [
  {
    id: 1,
    name: "온도 커피",
    category: "카페",
    area: "성수",
    image: "https://picsum.photos/seed/recent1/400/300",
    author: "크루 민지",
    date: "3일 전",
  },
  {
    id: 2,
    name: "을지 갤러리",
    area: "을지로",
    category: "전시",
    image: "https://picsum.photos/seed/recent2/400/300",
    author: "크루 지훈",
    date: "5일 전",
  },
  {
    id: 3,
    name: "미도식당",
    area: "연남",
    category: "맛집",
    image: "https://picsum.photos/seed/recent3/400/300",
    author: "크루 수연",
    date: "1주 전",
  },
];

export default function MockupC() {
  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 목업 네비게이션 */}
        <div className="py-4">
          <Link
            href="/mockup"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">목업 목록</span>
          </Link>
        </div>

        {/* ===== 히어로 섹션 (기존과 동일) ===== */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                SpotLine
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              현재 장소를 기준으로
              <br />
              다음 경험을 자연스럽게 제안
            </p>

            {/* 기존 시작하기 + 새로운 둘러보기 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                <QrCode className="h-5 w-5" />
                SpotLine 시작하기
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 rounded-xl transition-colors">
                <Compass className="h-5 w-5" />
                Spot 둘러보기
              </button>
            </div>

            {/* 사용 시나리오 카드 (기존 유지) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-center text-lg">
                이런 순간에 SpotLine을 사용해보세요
              </h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 rounded-xl bg-amber-50 p-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-xl shrink-0">
                    <Coffee className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-gray-700 text-sm">{`카페에서 작업을 마친 후 "이제 어디 가지?" 하는 순간`}</p>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-purple-50 p-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl shrink-0">
                    <Palette className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-gray-700 text-sm">
                    전시를 관람한 후 여운을 이어갈 다음 공간을 찾을 때
                  </p>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl shrink-0">
                    <Route className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-gray-700 text-sm">
                    무작정 검색하지 않고 의도된 동선으로 움직이고 싶을 때
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 새로운 섹션: 크루가 추천하는 Spot ===== */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  크루가 추천하는 Spot
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  SpotLine 크루가 직접 발견한 장소들
                </p>
              </div>
              <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                전체보기
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 가로 스크롤 카드 */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {RECENT_SPOTS.map((spot) => (
                <div
                  key={spot.id}
                  className="shrink-0 w-64 bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="relative h-36 bg-gray-200">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-xs bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-gray-700">
                      {spot.area}
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-blue-600 font-medium">
                      {spot.category}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-1">
                      {spot.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{spot.author}</span>
                      <span>{spot.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 사용법 섹션 (기존 유지) */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
              사용법은 정말 간단해요
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">QR 스캔</h3>
                <p className="text-sm text-gray-600">
                  매장의 SpotLine QR 코드를 스캔하세요
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  다음 Spot 확인
                </h3>
                <p className="text-sm text-gray-600">
                  현재 장소와 자연스럽게 이어지는 추천을 확인하세요
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  지도로 이동
                </h3>
                <p className="text-sm text-gray-600">
                  마음에 드는 장소를 선택하고 지도로 이동하세요
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 특징 섹션 (기존 유지) */}
        <section className="py-16 bg-white rounded-xl border mb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
              SpotLine은 다릅니다
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">즉시 접근</h3>
                <p className="text-sm text-gray-600">
                  앱 설치 없이 QR 코드만 스캔하면 바로 확인
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">맥락 기반</h3>
                <p className="text-sm text-gray-600">
                  현재 위치와 경험을 고려한 자연스러운 추천
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4">
                  <ArrowRight className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  신뢰할 수 있는
                </h3>
                <p className="text-sm text-gray-600">
                  광고나 리뷰가 아닌 큐레이션 기반 추천
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 (수정) */}
        <section className="py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              지금 바로 체험해보세요
            </h2>
            <p className="text-gray-600 mb-8">
              다음에 가기 좋은 곳을 찾는 새로운 방법을 경험해보세요
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                SpotLine 시작하기
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-colors">
                <Compass className="h-5 w-5" />
                Spot 둘러보기
              </button>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              또는{" "}
              <button className="text-purple-600 hover:text-purple-700 underline font-medium">
                데모보기로 먼저 체험해보기
              </button>
            </div>
          </div>
        </section>

        {/* 하단 목업 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-green-50 border-t border-green-200 px-4 py-2 text-center z-10">
          <p className="text-xs text-green-700">
            방향 C 목업 — 기존 랜딩에 &quot;둘러보기&quot; 버튼과 크루 추천 Spot 섹션 추가
          </p>
        </div>
      </div>
    </Layout>
  );
}

"use client";

import { useState } from "react";
import {
  MapPin,
  Coffee,
  Palette,
  UtensilsCrossed,
  Camera,
  TreePine,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

const AREAS = [
  {
    id: "seongsu",
    name: "성수",
    subtitle: "크리에이티브 핫플레이스",
    spotCount: 24,
    image: "https://picsum.photos/seed/seongsu/600/400",
    color: "bg-blue-600",
  },
  {
    id: "yeonnam",
    name: "연남",
    subtitle: "감성 카페와 골목 맛집",
    spotCount: 18,
    image: "https://picsum.photos/seed/yeonnam/600/400",
    color: "bg-purple-600",
  },
  {
    id: "euljiro",
    name: "을지로",
    subtitle: "레트로 감성과 힙한 공간",
    spotCount: 15,
    image: "https://picsum.photos/seed/euljiro/600/400",
    color: "bg-amber-600",
  },
  {
    id: "ikseon",
    name: "익선동",
    subtitle: "한옥 골목의 새로운 발견",
    spotCount: 12,
    image: "https://picsum.photos/seed/ikseon/600/400",
    color: "bg-rose-600",
  },
  {
    id: "mangwon",
    name: "망원",
    subtitle: "로컬이 사랑하는 동네",
    spotCount: 20,
    image: "https://picsum.photos/seed/mangwon/600/400",
    color: "bg-green-600",
  },
];

const THEMES = [
  {
    id: "cafe-tour",
    name: "카페 투어",
    description: "분위기 좋은 카페를 따라 걷는 하루",
    icon: Coffee,
    spotCount: 32,
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
  },
  {
    id: "exhibition",
    name: "전시 탐방",
    description: "갤러리와 전시장을 연결하는 문화 루트",
    icon: Palette,
    spotCount: 14,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  {
    id: "local-food",
    name: "로컬 맛집",
    description: "동네 주민이 추천하는 진짜 맛집",
    icon: UtensilsCrossed,
    spotCount: 28,
    color: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
  },
  {
    id: "photo-spot",
    name: "포토 스팟",
    description: "사진 찍기 좋은 장소 모음",
    icon: Camera,
    spotCount: 19,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    id: "nature-walk",
    name: "산책 코스",
    description: "자연과 함께하는 여유로운 산책",
    icon: TreePine,
    spotCount: 11,
    color: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
  {
    id: "new-open",
    name: "신규 오픈",
    description: "최근 새로 문을 연 핫한 공간들",
    icon: Sparkles,
    spotCount: 8,
    color: "bg-pink-50",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
];

type Tab = "area" | "theme";

export default function MockupB() {
  const [activeTab, setActiveTab] = useState<Tab>("area");

  return (
    <Layout showFooter={false}>
      <div className="max-w-2xl mx-auto">
        {/* 상단 */}
        <div className="px-4 py-4">
          <Link
            href="/mockup"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">목업 목록</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              어디를 둘러볼까요?
            </h1>
            <p className="text-gray-500">
              관심 있는 지역이나 테마를 선택해보세요
            </p>
          </div>

          {/* 탭 전환 */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab("area")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "area"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapPin className="h-4 w-4 inline-block mr-1" />
              지역별
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "theme"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sparkles className="h-4 w-4 inline-block mr-1" />
              테마별
            </button>
          </div>
        </div>

        {/* 지역별 탭 */}
        {activeTab === "area" && (
          <div className="px-4 pb-8 space-y-4">
            {AREAS.map((area) => (
              <Link
                key={area.id}
                href={`/mockup/b/spots?area=${area.id}`}
                className="block relative rounded-2xl overflow-hidden h-40 group"
              >
                <img
                  src={area.image}
                  alt={area.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {area.name}
                  </h3>
                  <p className="text-sm text-white/80 mb-2">{area.subtitle}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/70 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      {area.spotCount}개의 Spot
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/70" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 테마별 탭 */}
        {activeTab === "theme" && (
          <div className="px-4 pb-8 space-y-3">
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              return (
                <Link
                  key={theme.id}
                  href={`/mockup/b/spots?theme=${theme.id}`}
                  className={`block rounded-2xl border ${theme.borderColor} ${theme.color} p-5 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 bg-white rounded-xl shrink-0`}
                    >
                      <Icon className={`h-6 w-6 ${theme.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900">
                          {theme.name}
                        </h3>
                        <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {theme.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {theme.spotCount}개의 Spot
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 하단 목업 안내 */}
        <div className="fixed bottom-0 left-0 right-0 bg-purple-50 border-t border-purple-200 px-4 py-2 text-center">
          <p className="text-xs text-purple-700">
            방향 B 목업 — 지역/테마 선택 시 해당 큐레이션 리스트로 이동
          </p>
        </div>
      </div>
    </Layout>
  );
}

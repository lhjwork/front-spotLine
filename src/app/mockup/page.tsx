"use client";

import {
  MapPin,
  Layers,
  ArrowLeftRight,
  Users,
  Zap,
  Heart,
  Smartphone,
  Route,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

const DIRECTIONS = [
  {
    id: "a",
    href: "/mockup/a",
    label: "방향 A",
    labelColor: "text-blue-600 bg-blue-50",
    borderHover: "hover:border-blue-400",
    iconBg: "bg-blue-100",
    icon: MapPin,
    iconColor: "text-blue-600",
    title: "지도 기반 통합 탐색",
    description:
      "지도 위에 SpotLine 제휴 Spot + 유저 추천 Spot이 함께 표시. 방문·좋아요·소개 활동이 실시간 반영",
    tags: [
      { label: "🗺️ 지도 중심", color: "bg-blue-50 text-blue-700" },
      { label: "유저 활동 표시", color: "bg-green-50 text-green-700" },
      { label: "제휴/유저 구분", color: "bg-purple-50 text-purple-700" },
    ],
  },
  {
    id: "b",
    href: "/mockup/b",
    label: "방향 B",
    labelColor: "text-purple-600 bg-purple-50",
    borderHover: "hover:border-purple-400",
    iconBg: "bg-purple-100",
    icon: Layers,
    iconColor: "text-purple-600",
    title: "SpotLine별 큐레이션 + 유저 인기 Spot",
    description:
      "SpotLine 단위로 제휴 Spot을 탐색하고, 유저들이 가장 많이 방문·추천한 인기 Spot을 별도 섹션으로 표시",
    tags: [
      { label: "📋 SpotLine별 정리", color: "bg-purple-50 text-purple-700" },
      { label: "유저 인기순", color: "bg-green-50 text-green-700" },
      { label: "SEO 최적", color: "bg-blue-50 text-blue-700" },
    ],
  },
  {
    id: "c",
    href: "/mockup/c",
    label: "방향 C",
    labelColor: "text-green-600 bg-green-50",
    borderHover: "hover:border-green-400",
    iconBg: "bg-green-100",
    icon: ArrowLeftRight,
    iconColor: "text-green-600",
    title: "기존 QR + 소셜 피드 병행",
    description:
      "QR 스캔 기반 SpotLine 경험은 유지하면서, 유저 커뮤니티 피드를 통해 방문·좋아요·소개 활동을 자연스럽게 노출",
    tags: [
      { label: "리스크 낮음", color: "bg-green-50 text-green-700" },
      { label: "점진적 전환", color: "bg-green-50 text-green-700" },
      { label: "커뮤니티 피드", color: "bg-amber-50 text-amber-700" },
    ],
  },
  {
    id: "d",
    href: "/mockup/d",
    label: "방향 D",
    labelColor: "text-rose-600 bg-rose-50",
    borderHover: "hover:border-rose-400",
    iconBg: "bg-rose-100",
    icon: Smartphone,
    iconColor: "text-rose-600",
    title: "스토리/릴스형 탐색",
    description:
      "풀스크린 세로 카드를 위아래로 스와이프하며 Spot을 탐색. 사진+한줄 스토리가 몰입감 있게 보여지는 인스타 릴스/틱톡 스타일",
    tags: [
      { label: "📱 모바일 몰입", color: "bg-rose-50 text-rose-700" },
      { label: "스와이프 탐색", color: "bg-pink-50 text-pink-700" },
      { label: "유저 콘텐츠", color: "bg-purple-50 text-purple-700" },
      { label: "⭐ NEW", color: "bg-yellow-50 text-yellow-700" },
    ],
  },
  {
    id: "e",
    href: "/mockup/e",
    label: "방향 E",
    labelColor: "text-cyan-600 bg-cyan-50",
    borderHover: "hover:border-cyan-400",
    iconBg: "bg-cyan-100",
    icon: Route,
    iconColor: "text-cyan-600",
    title: "루트(코스) 중심 탐색",
    description:
      "\"성수 카페 3곳 코스\", \"을지로 야경 루트\" 같은 코스 단위로 Spot을 연결하여 탐색. \"다음 Spot\" 컨셉을 가장 직접적으로 구현",
    tags: [
      { label: "🚶 다음 Spot 극대화", color: "bg-cyan-50 text-cyan-700" },
      { label: "완주 시스템", color: "bg-green-50 text-green-700" },
      { label: "유저 루트 생성", color: "bg-purple-50 text-purple-700" },
      { label: "⭐ NEW", color: "bg-yellow-50 text-yellow-700" },
    ],
  },
  {
    id: "f",
    href: "/mockup/f",
    label: "방향 F",
    labelColor: "text-orange-600 bg-orange-50",
    borderHover: "hover:border-orange-400",
    iconBg: "bg-orange-100",
    icon: Gamepad2,
    iconColor: "text-orange-600",
    title: "게이미피케이션 탐험",
    description:
      "미션(방문 N곳, 루트 완주 등)을 수행하고 뱃지/포인트를 획득. 탐험과 수집의 재미로 재방문을 유도하는 포켓몬GO + 스탬프랠리 스타일",
    tags: [
      { label: "🎮 미션/뱃지", color: "bg-orange-50 text-orange-700" },
      { label: "레벨 시스템", color: "bg-amber-50 text-amber-700" },
      { label: "리더보드", color: "bg-red-50 text-red-700" },
      { label: "⭐ NEW", color: "bg-yellow-50 text-yellow-700" },
    ],
  },
  {
    id: "g",
    href: "/mockup/g",
    label: "방향 G",
    labelColor: "text-indigo-600 bg-indigo-50",
    borderHover: "hover:border-indigo-400",
    iconBg: "bg-indigo-100",
    icon: Sparkles,
    iconColor: "text-indigo-600",
    title: "AI 개인화 추천",
    description:
      "유저의 방문 기록, 좋아요, 취향 태그를 분석하여 \"오늘의 추천 Spot\", \"당신이 좋아할 SpotLine\"을 개인 맞춤으로 제안하는 스포티파이 스타일",
    tags: [
      { label: "🤖 AI 추천", color: "bg-indigo-50 text-indigo-700" },
      { label: "매치율 표시", color: "bg-blue-50 text-blue-700" },
      { label: "취향 프로필", color: "bg-purple-50 text-purple-700" },
      { label: "⭐ NEW", color: "bg-yellow-50 text-yellow-700" },
    ],
  },
];

export default function MockupIndex() {
  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-sm text-blue-600 font-medium mb-2">MOCKUP</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            SpotLine × User 생태계 설계
          </h1>
          <p className="text-gray-600 mb-2">
            SpotLine 제휴 Spot과 유저들이 방문·좋아요·소개하는 Spot이
          </p>
          <p className="text-gray-600">
            지도 위에서 함께 보이는 7가지 접근 방식
          </p>
        </div>

        {/* 개념 설명 배너 */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <h3 className="font-bold text-gray-900 mb-4 text-center">
            핵심 설계 구조
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 bg-white rounded-xl p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg shrink-0">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  SpotLine 제휴
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  크루가 큐레이션하고 매장과 제휴된 공식 Spot
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-xl p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg shrink-0">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">유저 추천</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  회원가입 유저가 방문·좋아요·소개하는 Spot
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-xl p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg shrink-0">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">소셜 활동</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  방문 기록, 좋아요, 리뷰가 지도 위에 표시
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {DIRECTIONS.map((dir) => {
            const Icon = dir.icon;
            return (
              <Link
                key={dir.id}
                href={dir.href}
                className={`block rounded-2xl border-2 border-gray-200 bg-white p-8 ${dir.borderHover} hover:shadow-lg transition-all`}
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`flex items-center justify-center w-14 h-14 ${dir.iconBg} rounded-2xl shrink-0`}
                  >
                    <Icon className={`h-7 w-7 ${dir.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-xs font-bold ${dir.labelColor} px-2 py-1 rounded`}
                      >
                        {dir.label}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900">
                        {dir.title}
                      </h2>
                    </div>
                    <p className="text-gray-600 mb-3">{dir.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {dir.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className={`${tag.color} px-2 py-1 rounded`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

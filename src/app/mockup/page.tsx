"use client";

import { MapPin, Layers, ArrowLeftRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

export default function MockupIndex() {
  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-sm text-blue-600 font-medium mb-2">MOCKUP</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            &quot;시작하기&quot; 플로우 방향 비교
          </h1>
          <p className="text-gray-600">
            콘텐츠 기반 플랫폼 전환을 위한 3가지 접근 방식
          </p>
        </div>

        <div className="grid gap-6">
          {/* 방향 A */}
          <Link
            href="/mockup/a"
            className="block rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-5">
              <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl shrink-0">
                <MapPin className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    방향 A
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">
                    지역 기반 탐색 피드
                  </h2>
                </div>
                <p className="text-gray-600 mb-3">
                  &quot;시작하기&quot; → 위치 허용 → 근처 Spot 피드 (/explore)
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                    직관적 UX
                  </span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                    위치 기반
                  </span>
                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
                    초기 빈 피드 위험
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* 방향 B */}
          <Link
            href="/mockup/b"
            className="block rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-purple-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-5">
              <div className="flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl shrink-0">
                <Layers className="h-7 w-7 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    방향 B
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">
                    지역/테마 선택 → 큐레이션
                  </h2>
                </div>
                <p className="text-gray-600 mb-3">
                  &quot;시작하기&quot; → 지역 또는 테마 선택 → 큐레이션 리스트
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                    SEO 최적
                  </span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                    콘텐츠 구조화
                  </span>
                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
                    지역별 최소 수량 필요
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* 방향 C */}
          <Link
            href="/mockup/c"
            className="block rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-green-400 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-5">
              <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl shrink-0">
                <ArrowLeftRight className="h-7 w-7 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                    방향 C
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">
                    기존 방식 유지 + 콘텐츠 병행
                  </h2>
                </div>
                <p className="text-gray-600 mb-3">
                  &quot;시작하기&quot;는 기존 QR 플로우 + &quot;둘러보기&quot;
                  버튼 추가
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                    리스크 낮음
                  </span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                    점진적 전환
                  </span>
                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
                    경로 혼재
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

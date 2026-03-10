"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  MapPin,
  ArrowRight,
  Navigation,
  Coffee,
  Palette,
  Route,
  Locate,
  Shield,
  X,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

export default function MockupALanding() {
  const router = useRouter();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleStart = () => {
    setShowLocationModal(true);
  };

  const handleAllowLocation = () => {
    setLocating(true);
    // 위치 허용 시뮬레이션
    setTimeout(() => {
      setLocating(false);
      setShowLocationModal(false);
      router.push("/mockup/a/explore");
    }, 1500);
  };

  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 목업 안내 배너 */}
        <div className="mt-4 mx-auto max-w-2xl">
          <Link
            href="/mockup"
            className="block bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center"
          >
            <p className="text-xs text-blue-600">
              방향 A 목업 — 지역 기반 탐색 피드 플로우
            </p>
            <p className="text-xs text-blue-500 mt-0.5">
              랜딩 → 위치 허용 → 탐색 피드 → Spot 상세
            </p>
          </Link>
        </div>

        {/* 히어로 섹션 */}
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

            {/* 시작하기 버튼 → 위치 허용 모달 */}
            <div className="mb-12">
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/25"
              >
                <Navigation className="h-5 w-5" />
                주변 Spot 탐색하기
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* 사용 시나리오 카드 */}
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

        {/* 작동 방식 */}
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
                <h3 className="font-semibold text-gray-900 mb-2">
                  탐색 시작
                </h3>
                <p className="text-sm text-gray-600">
                  위치를 허용하면 주변 Spot이 자동으로 표시됩니다
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Spot 선택
                </h3>
                <p className="text-sm text-gray-600">
                  크루가 큐레이션한 장소들을 둘러보고 마음에 드는 곳을 선택하세요
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  다음 Spot으로
                </h3>
                <p className="text-sm text-gray-600">
                  각 장소에서 자연스럽게 이어지는 다음 Spot을 추천받으세요
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              지금 바로 주변을 탐색해보세요
            </h2>
            <p className="text-gray-600 mb-8">
              SpotLine 크루가 직접 발견한 장소들을 확인해보세요
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <Navigation className="h-5 w-5" />
              주변 Spot 탐색하기
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>

      {/* 위치 허용 모달 */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            {!locating ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                    <Locate className="h-6 w-6 text-blue-600" />
                  </div>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  위치 정보가 필요해요
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  주변 Spot을 찾기 위해 현재 위치를 사용합니다.
                  위치 정보는 탐색 목적으로만 사용되며 저장되지 않습니다.
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-6">
                  <Shield className="h-4 w-4 shrink-0 text-green-600" />
                  <span>위치 데이터는 서버에 전송되지 않으며, 브라우저에서만 처리됩니다</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleAllowLocation}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    위치 허용하기
                  </button>
                  <button
                    onClick={() => {
                      setShowLocationModal(false);
                      router.push("/mockup/a/explore");
                    }}
                    className="w-full py-3 text-gray-500 rounded-xl font-medium hover:bg-gray-100 transition-colors text-sm"
                  >
                    위치 없이 둘러보기
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 animate-pulse">
                  <Navigation className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-gray-900 font-medium mb-1">
                  현재 위치를 찾고 있어요
                </p>
                <p className="text-sm text-gray-500">잠시만 기다려주세요...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

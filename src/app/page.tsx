"use client";

import { useState } from "react";
import { QrCode, MapPin, Star, ArrowRight, Smartphone, Heart, Compass } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SpotlineExperienceButton from "@/components/spotline/SpotlineExperienceButton";
import { DEFAULT_QR_CODE } from "@/lib/spotline";

export default function Home() {
  return (
    <Layout showFooter>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 히어로 섹션 - SpotLine 정체성 강조 */}
        <section className="py-12 md:py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
                <QrCode className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">SpotLine</h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed">현재 장소를 기준으로 다음 경험을 자연스럽게 제안</p>

            <p className="text-lg text-gray-500 mb-8">광고도, 리뷰도 아닌 — 큐레이션의 신뢰로 이어지는 경험</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <SpotlineExperienceButton size="lg" className="w-full sm:w-auto" showArrow useAPI={true} />
            </div>

            <div className="bg-blue-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                이런 순간에 SpotLine을 사용해보세요
              </h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• 카페에서 작업을 마친 후 "이제 어디 가지?" 하는 순간</li>
                <li>• 전시를 관람한 후 여운을 이어갈 다음 공간을 찾을 때</li>
                <li>• 현재 경험과 자연스럽게 연결되는 다음 장소를 원할 때</li>
                <li>• 무작정 검색하지 않고 의도된 동선으로 움직이고 싶을 때</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SpotLine 정체성 섹션 */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl mb-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">SpotLine은 다릅니다</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-red-600 mb-3">❌ SpotLine이 아닌 것</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• 광고 플랫폼이 아닙니다</li>
                  <li>• 리뷰 서비스가 아닙니다</li>
                  <li>• 사용자 참여형 커뮤니티가 아닙니다</li>
                  <li>• 무작위 검색 결과를 보여주지 않습니다</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-green-600 mb-3">✅ SpotLine의 목적</h3>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• 현재 장소 기준 다음 경험을 자연스럽게 제안</li>
                  <li>• 사용자 이동 흐름을 관찰하고 학습</li>
                  <li>• 큐레이션의 신뢰를 지속적으로 축적</li>
                  <li>• 의미있는 공간 연결성을 만들어냄</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-700 italic">"다음에 가기 좋은 곳"을 찾는 새로운 방법</p>
            </div>
          </div>
        </section>

        {/* 특징 섹션 */}
        <section className="py-16 bg-white rounded-2xl shadow-sm border mb-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">왜 SpotLine인가요?</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">즉시 접근</h3>
                <p className="text-gray-600">앱 설치 없이 QR 코드만 스캔하면 바로 다음 Spot을 확인할 수 있어요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mx-auto mb-4">
                  <Compass className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">맥락 기반 큐레이션</h3>
                <p className="text-gray-600">현재 위치와 경험을 고려한 자연스러운 다음 장소를 제안해드려요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">신뢰할 수 있는 선택</h3>
                <p className="text-gray-600">광고나 리뷰가 아닌 공간의 연결성을 바탕으로 한 추천이에요</p>
              </div>
            </div>
          </div>
        </section>

        {/* 사용법 섹션 */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">사용법은 정말 간단해요</h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">QR 스캔</h3>
                <p className="text-sm text-gray-600">매장의 SpotLine QR 코드를 스캔하세요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">다음 Spot 확인</h3>
                <p className="text-sm text-gray-600">현재 장소와 자연스럽게 이어지는 다음 Spot들을 확인하세요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Spot 선택</h3>
                <p className="text-sm text-gray-600">마음에 드는 다음 Spot을 선택하세요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold">4</div>
                <h3 className="font-semibold text-gray-900 mb-2">자연스러운 이동</h3>
                <p className="text-sm text-gray-600">지도로 연결되어 자연스럽게 다음 경험으로 이어가세요</p>
              </div>
            </div>
          </div>
        </section>

        {/* 통계 섹션 */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white mb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">SpotLine과 함께하는 경험</h2>
            <p className="text-blue-100 mb-12">큐레이션의 신뢰로 만들어가는 새로운 이동 패턴</p>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-blue-100">큐레이션된 Spot</div>
              </div>

              <div>
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-blue-100">월간 경험 연결</div>
              </div>

              <div>
                <div className="text-4xl font-bold mb-2">92%</div>
                <div className="text-blue-100">만족도</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">지금 바로 체험해보세요</h2>
            <p className="text-xl text-gray-600 mb-8">"이제 어디 가지?" 하는 순간을 위한 새로운 해답을 경험해보세요</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SpotlineExperienceButton size="lg" className="w-full sm:w-auto" showArrow useAPI={true} />
            </div>

            <p className="text-sm text-gray-500 mt-4">* 체험하기 버튼을 누르면 관리자가 설정한 추천 매장으로 이동합니다</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}

"use client";

import { QrCode, MapPin, ArrowRight, Smartphone } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SpotlineStartButton from "@/components/spotline/SpotlineExperienceButton";

export default function Home() {
  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 히어로 섹션 - 심플하고 깔끔하게 */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">SpotLine</h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              현재 장소를 기준으로
              <br />
              다음 경험을 자연스럽게 제안
            </p>

            <div className="mb-12">
              <SpotlineStartButton size="lg" className="px-8 py-4 text-lg" showArrow />
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">이런 순간에 SpotLine을 사용해보세요</h3>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {` 카페에서 작업을 마친 후 "이제 어디 가지?" 하는 순간`}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  전시를 관람한 후 여운을 이어갈 다음 공간을 찾을 때
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  무작정 검색하지 않고 의도된 동선으로 움직이고 싶을 때
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 사용법 섹션 - 간단하게 */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">사용법은 정말 간단해요</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">QR 스캔</h3>
                <p className="text-sm text-gray-600">매장의 SpotLine QR 코드를 스캔하세요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">다음 Spot 확인</h3>
                <p className="text-sm text-gray-600">현재 장소와 자연스럽게 이어지는 추천을 확인하세요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold text-lg">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">지도로 이동</h3>
                <p className="text-sm text-gray-600">마음에 드는 장소를 선택하고 지도로 이동하세요</p>
              </div>
            </div>
          </div>
        </section>

        {/* 특징 섹션 - 심플하게 */}
        <section className="py-16 bg-white rounded-xl border mb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">SpotLine은 다릅니다</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">즉시 접근</h3>
                <p className="text-sm text-gray-600">앱 설치 없이 QR 코드만 스캔하면 바로 확인</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">맥락 기반</h3>
                <p className="text-sm text-gray-600">현재 위치와 경험을 고려한 자연스러운 추천</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4">
                  <ArrowRight className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">신뢰할 수 있는</h3>
                <p className="text-sm text-gray-600">광고나 리뷰가 아닌 큐레이션 기반 추천</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">지금 바로 체험해보세요</h2>
            <p className="text-gray-600 mb-8">다음에 가기 좋은 곳을 찾는 새로운 방법을 경험해보세요</p>

            <div className="space-y-4">
              <SpotlineStartButton size="lg" className="px-8 py-4" showArrow />

              <div className="text-sm text-gray-500">
                또는{" "}
                <button 
                  onClick={() => window.location.href = '/qr/demo_cafe_001'}
                  className="text-purple-600 hover:text-purple-700 underline font-medium"
                >
                  🎭 데모보기로 먼저 체험해보기
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, MapPin, Star, ArrowRight, Smartphone } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Button from "@/components/common/Button";

export default function Home() {
  const [demoQrId] = useState("6ccbb682-df55-4566-ac30-703ddb5cfb7f");

  return (
    <Layout showFooter>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 히어로 섹션 */}
        <section className="py-12 md:py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
                <QrCode className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Spotline</h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">현재 장소를 기준으로 다음 경험을 자연스럽게 제안하는 서비스</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={`/spotline/${demoQrId}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <QrCode className="mr-2 h-5 w-5" />
                  SpotLine 체험하기
                </Button>
              </Link>

              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  서비스 소개 보기
                </Button>
              </Link>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">💡 이런 순간에 SpotLine을 사용해보세요</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• 카페에서 작업을 마친 후 자연스럽게 이어질 다음 공간을 찾을 때</li>
                <li>• 전시를 관람한 후 여운을 이어갈 장소를 찾을 때</li>
                <li>• 현재 경험과 조화로운 다음 경험을 원할 때</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 특징 섹션 */}
        <section className="py-16 bg-white rounded-2xl shadow-sm border mb-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">왜 Spotline인가요?</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">간편한 QR 접근</h3>
                <p className="text-gray-600">앱 설치 없이 QR 코드만 스캔하면 바로 추천을 받을 수 있어요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">맥락 기반 추천</h3>
                <p className="text-gray-600">현재 위치와 상황을 고려한 개인화된 장소를 추천해드려요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">큐레이션 품질</h3>
                <p className="text-gray-600">무작위 검색이 아닌 의도된 동선으로 더 나은 경험을 제공해요</p>
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
                <p className="text-sm text-gray-600">마음에 드는 Spot을 선택하세요</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-4 font-bold">4</div>
                <h3 className="font-semibold text-gray-900 mb-2">지도 연결</h3>
                <p className="text-sm text-gray-600">마음에 드는 장소를 선택하고 지도로 이동하세요</p>
              </div>
            </div>
          </div>
        </section>

        {/* 통계 섹션 */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white mb-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-12">SpotLine과 함께하는 사람들</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">1,000+</div>
                <div className="text-blue-100">참여 매장</div>
              </div>

              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <div className="text-blue-100">월간 추천</div>
              </div>

              <div>
                <div className="text-4xl font-bold mb-2">85%</div>
                <div className="text-blue-100">실제 방문율</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">지금 바로 시작해보세요</h2>
            <p className="text-xl text-gray-600 mb-8">다음에 가기 좋은 장소를 찾는 새로운 방법을 경험해보세요</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/spotline/${demoQrId}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <QrCode className="mr-2 h-5 w-5" />
                  SpotLine 체험하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

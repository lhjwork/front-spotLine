"use client";

import { QrCode, Smartphone, Users, Target } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Layout from "@/components/layout/Layout";
import DemoExperienceButton from "@/components/spotline/DemoExperienceButton";
import { getDemoStores } from "@/lib/api";
import { SpotlineStore } from "@/types";

export default function DemoPage() {
  const [demoStores, setDemoStores] = useState<SpotlineStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStoreList, setShowStoreList] = useState(false);

  // 데모 매장 목록 로드
  const loadDemoStores = async () => {
    if (demoStores.length > 0) {
      setShowStoreList(!showStoreList);
      return;
    }

    setIsLoading(true);
    try {
      const stores = await getDemoStores();
      setDemoStores(stores);
      setShowStoreList(true);
    } catch (error) {
      console.error("데모 매장 목록 로드 실패:", error);
      alert("데모 매장 목록을 불러올 수 없습니다. 기본 데모를 체험해보세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 데모 매장 직접 보기
  const handleDemoStoreView = (storeId: string) => {
    // 매장 ID를 사용하여 SpotLine 페이지로 이동
    window.location.href = `/spotline/${storeId}`;
  };

  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 데모 안내 배너 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-8">
          <div className="flex items-center">
            <div className="shrink-0">
              <QrCode className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>데모 체험 모드</strong> - 이것은 서비스 소개용 데모입니다. 실제 매장 데이터가 아닌 샘플 데이터를 사용합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 히어로 섹션 - 업주 대상 */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">SpotLine</h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed">
              매장 간 자연스러운 연결을 통해
              <br />
              고객 경험을 확장하는 서비스
            </p>

            <p className="text-lg text-gray-500 mb-8">업주님을 위한 데모 체험으로 SpotLine의 가능성을 확인해보세요</p>

            <div className="mb-8 space-y-4">
              <DemoExperienceButton size="lg" className="px-8 py-4 text-lg" showArrow />

              <div className="text-sm text-gray-500">또는</div>

              <button onClick={loadDemoStores} disabled={isLoading} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border transition-colors disabled:opacity-50">
                {isLoading ? "로딩 중..." : showStoreList ? "매장 목록 숨기기" : "데모 매장 목록 보기"}
              </button>
            </div>

            {/* 데모 매장 목록 */}
            {showStoreList && demoStores.length > 0 && (
              <div className="bg-white rounded-xl border p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">데모 매장 목록</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {demoStores.map((store) => (
                    <div key={store.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="relative w-full h-32 mb-3">
                        <Image src={store.representativeImage} alt={store.name} fill className="object-cover rounded-md" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{store.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{store.shortDescription}</p>
                      <button onClick={() => handleDemoStoreView(store.id)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        데모 보기
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-left">
              <h3 className="font-semibold text-amber-900 mb-4 text-center">💡 데모에서 체험할 수 있는 기능</h3>
              <ul className="text-amber-800 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  QR 코드 스캔 후 매장 정보 확인
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  현재 위치 기반 다음 추천 매장 목록
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  Google/Kakao/Naver 지도 연동
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  매장별 SpotLine 스토리 및 외부 링크
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 업주 대상 가치 제안 */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">SpotLine이 업주님께 드리는 가치</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">고객 유입 증대</h3>
                <p className="text-sm text-gray-600">다른 매장에서 자연스럽게 연결되는 고객들을 유치할 수 있습니다</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">타겟 고객 확보</h3>
                <p className="text-sm text-gray-600">비슷한 취향의 고객들이 연결되어 더 높은 만족도를 기대할 수 있습니다</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">간편한 운영</h3>
                <p className="text-sm text-gray-600">QR 코드만 설치하면 별도 앱이나 복잡한 설정 없이 바로 시작</p>
              </div>
            </div>
          </div>
        </section>

        {/* 실제 서비스 안내 */}
        <section className="py-16 bg-gray-50 rounded-xl border mb-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">실제 서비스 도입을 원하시나요?</h2>
            <p className="text-gray-600 mb-8">데모를 체험해보시고 관심이 있으시다면, 실제 매장 데이터로 SpotLine을 시작할 수 있습니다.</p>

            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold text-gray-900 mb-3">도입 문의</h3>
              <p className="text-sm text-gray-600 mb-4">매장 정보 등록, QR 코드 제작, 추천 로직 설정 등 모든 과정을 지원해드립니다.</p>
              <div className="text-sm text-gray-500">
                <p>📧 이메일: contact@spotline.com</p>
                <p>📱 카카오톡: @spotline</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-16 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">지금 바로 데모를 체험해보세요</h2>
            <p className="text-gray-600 mb-8">SpotLine이 어떻게 고객 경험을 연결하는지 직접 확인해보세요</p>

            <DemoExperienceButton size="lg" className="px-8 py-4" showArrow />

            <div className="mt-4 text-xs text-gray-500">* 데모 데이터를 사용하며, 실제 매장과는 관련이 없습니다</div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

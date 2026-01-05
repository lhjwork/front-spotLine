import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import { QrCode, MapPin, Star, Users, TrendingUp, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
  title: '서비스 소개',
  description: 'Spotline은 QR 코드 기반 로컬 연결 서비스로 다음에 가기 좋은 장소를 추천합니다.',
};

export default function AboutPage() {
  return (
    <Layout showBackButton title="서비스 소개">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* 헤더 섹션 */}
          <section className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Spotline</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              지금 있는 장소에서, 다음으로 이어지는 최적의 동선을 추천하는 QR 기반 로컬 연결 서비스
            </p>
          </section>

          {/* 문제 정의 */}
          <section className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">해결하고자 하는 문제</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="font-semibold text-gray-900 mb-2">다음 장소 결정의 어려움</h3>
                <p className="text-sm text-gray-600">
                  카페, 전시, 미팅 이후 &ldquo;이제 어디 가지?&rdquo;라는 순간적 니즈
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-semibold text-gray-900 mb-2">검색의 피로</h3>
                <p className="text-sm text-gray-600">
                  지도 앱 검색은 범위가 넓고 현재 상황에 맞는 맥락이 부족
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="font-semibold text-gray-900 mb-2">매장 홍보의 한계</h3>
                <p className="text-sm text-gray-600">
                  오프라인 매장의 유휴 공간 활용과 효과적인 로컬 광고의 어려움
                </p>
              </div>
            </div>
          </section>

          {/* 솔루션 */}
          <section className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Spotline의 해결책</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">맥락 기반 추천</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• &ldquo;지금 이 장소 다음&rdquo;이라는 명확한 상황 정의</li>
                  <li>• 현재 매장의 특성과 사용자 상황을 고려</li>
                  <li>• 시간대, 날씨, 동반자 등을 반영한 개인화</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">간편한 QR 접근</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• 앱 설치나 다운로드 없이 즉시 사용</li>
                  <li>• 매장 테이블/카운터에서 자연스러운 접근</li>
                  <li>• 모바일 최적화된 웹 인터페이스</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 특징 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">주요 특징</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">모바일 퍼스트</h3>
                <p className="text-gray-600">
                  스마트폰에서 QR 스캔 후 사용하는 시나리오에 최적화된 인터페이스
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">지도 연동</h3>
                <p className="text-gray-600">
                  카카오맵, 구글맵, 네이버맵과 연동하여 실제 이동까지 지원
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">데이터 분석</h3>
                <p className="text-gray-600">
                  실제 방문 데이터를 추적하여 추천 품질을 지속적으로 개선
                </p>
              </div>
            </div>
          </section>

          {/* 사용 시나리오 */}
          <section className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">사용 시나리오</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">카페에서 커피 후</h3>
                  <p className="text-gray-600">
                    카페에서 커피를 마신 후 테이블의 QR을 스캔하여 근처 디저트 카페나 산책로를 추천받습니다.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">전시 관람 후</h3>
                  <p className="text-gray-600">
                    전시를 관람한 후 QR을 스캔하여 근처 맛집이나 관련 문화 공간을 추천받습니다.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">비즈니스 미팅 후</h3>
                  <p className="text-gray-600">
                    미팅이 끝난 후 QR을 스캔하여 후속 미팅 장소나 식사 장소를 추천받습니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 비전 */}
          <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8">
            <h2 className="text-2xl font-bold mb-4">우리의 비전</h2>
            <p className="text-xl mb-6">
              &ldquo;모든 장소가 다음 장소와 연결되는 세상&rdquo;
            </p>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Spotline을 통해 도시의 모든 공간이 유기적으로 연결되어, 
              사람들의 일상이 더욱 풍부하고 발견이 가득한 경험이 되도록 하는 것이 우리의 목표입니다.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
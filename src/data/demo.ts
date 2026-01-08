// 데모 설정 (백엔드 API에서 데이터를 받아오므로 이미지 URL은 제거)
export const DEMO_CONFIG = {
  defaultScenario: 'cafe',
  loadingDelay: 500, // 로딩 시뮬레이션 시간 (ms)
  enableAnalytics: false, // 데모에서는 통계 수집 안함
  contactInfo: {
    email: "contact@spotline.com",
    kakao: "@spotline",
    phone: "02-1234-5678"
  }
};

// 다양한 데모 시나리오를 위한 확장 가능한 구조 (향후 사용)
export const DEMO_SCENARIOS = {
  cafe: 'cafe',
  restaurant: 'restaurant',
  retail: 'retail'
} as const;

// 데모 데이터는 이제 백엔드 API (/api/demo/store)에서 가져옵니다.
// 이 파일은 설정값만 관리합니다.
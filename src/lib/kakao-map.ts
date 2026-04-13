// Kakao Map SDK loader utility
// react-kakao-maps-sdk의 useKakaoLoader를 래핑하여 앱 전체에서 일관된 SDK 로드 설정 제공

import { useKakaoLoader } from "react-kakao-maps-sdk";

export function useKakaoMapLoader() {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "",
  });

  return { loading, error };
}

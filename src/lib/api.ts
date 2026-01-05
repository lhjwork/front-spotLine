import axios from 'axios';
import { Store, RecommendationResponse, AnalyticsEvent, FilterOptions } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// QR 코드로 매장 정보 조회
export const getStoreByQR = async (qrId: string): Promise<Store> => {
  try {
    const response = await api.get(`/stores/qr/${qrId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '매장을 찾을 수 없습니다');
    }
    throw new Error('네트워크 오류가 발생했습니다');
  }
};

// QR 기반 추천 조회
export const getRecommendationsByQR = async (
  qrId: string, 
  options?: FilterOptions
): Promise<RecommendationResponse> => {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.limit) params.append('limit', options.limit.toString());
    
    const url = `/recommendations/qr/${qrId}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '추천 정보를 가져올 수 없습니다');
    }
    throw new Error('네트워크 오류가 발생했습니다');
  }
};

// 분석 이벤트 로깅
export const logAnalyticsEvent = async (eventData: AnalyticsEvent): Promise<void> => {
  try {
    await api.post('/analytics/event', eventData);
  } catch (error) {
    // 분석 이벤트 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
    console.warn('Analytics event failed:', error);
  }
};

// 헬스 체크
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('서버에 연결할 수 없습니다');
  }
};
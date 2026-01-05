import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 세션 ID 생성 및 관리
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return uuidv4();
  
  let sessionId = sessionStorage.getItem('spotline_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('spotline_session_id', sessionId);
  }
  return sessionId;
};

// 거리 포맷팅
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

// 도보 시간 포맷팅
export const formatWalkingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `도보 ${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `도보 ${hours}시간 ${remainingMinutes}분`;
};

// 영업시간 포맷팅
export const formatBusinessHours = (hours: { open: string; close: string }): string => {
  return `${hours.open} - ${hours.close}`;
};

// 현재 영업 상태 확인
export const isCurrentlyOpen = (businessHours: { [key: string]: { open: string; close: string } }): boolean => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM 형식
  
  const todayHours = businessHours[currentDay];
  if (!todayHours) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// 카테고리 한글 변환
export const getCategoryLabel = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    cafe: '카페',
    restaurant: '음식점',
    dessert: '디저트',
    activity: '활동',
    shopping: '쇼핑',
    culture: '문화',
    rest: '휴식',
    next_meal: '식사',
  };
  return categoryMap[category] || category;
};

// 카테고리 색상 반환
export const getCategoryColor = (category: string): string => {
  const colorMap: { [key: string]: string } = {
    cafe: 'bg-amber-100 text-amber-800',
    restaurant: 'bg-red-100 text-red-800',
    dessert: 'bg-pink-100 text-pink-800',
    activity: 'bg-blue-100 text-blue-800',
    shopping: 'bg-purple-100 text-purple-800',
    culture: 'bg-green-100 text-green-800',
    rest: 'bg-gray-100 text-gray-800',
    next_meal: 'bg-orange-100 text-orange-800',
  };
  return colorMap[category] || 'bg-gray-100 text-gray-800';
};

// 이미지 URL 검증
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 전화번호 포맷팅
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

// 디바운스 함수
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
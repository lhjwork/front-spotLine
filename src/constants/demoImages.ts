// 데모 이미지 관리 - 백엔드에서 전달받은 URL을 그대로 사용
// 백엔드 API에서 무료 이미지 서비스 URL을 직접 전달받아 사용합니다.

// 이미지 로딩 실패 시 대체 이미지 (로컬 플레이스홀더)
export const FALLBACK_IMAGES = {
  STORE: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuuniOyepSDsnbTrr7jsp4A8L3RleHQ+Cjwvc3ZnPg==',
  SPOT: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuuniOyepSDsnbTrr7jsp4A8L3RleHQ+Cjwvc3ZnPg=='
} as const;

// 이미지 최적화 설정
export const IMAGE_CONFIG = {
  // Next.js Image 컴포넌트 기본 설정
  quality: 85,
  placeholder: 'blur' as const,
  blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  
  // 반응형 이미지 크기
  sizes: {
    mobile: '(max-width: 768px) 100vw',
    tablet: '(max-width: 1024px) 50vw', 
    desktop: '33vw'
  }
} as const;

// 외부 이미지 서비스 도메인 목록 (Next.js 최적화 비활성화용)
export const EXTERNAL_IMAGE_DOMAINS = [
  'images.unsplash.com',
  'picsum.photos',
  'via.placeholder.com'
] as const;

// 이미지가 외부 서비스인지 확인하는 유틸리티
export const isExternalImage = (src: string): boolean => {
  return EXTERNAL_IMAGE_DOMAINS.some(domain => src.includes(domain));
};

// 이미지 로딩 상태 관리를 위한 유틸리티
export const createImageLoadHandler = (fallbackSrc: string) => {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    img.src = fallbackSrc;
  };
};
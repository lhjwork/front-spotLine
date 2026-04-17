"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { IMAGE_CONFIG, FALLBACK_IMAGES } from "@/constants/demoImages";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  type?: 'store' | 'spot';
  fill?: boolean;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  type = 'store',
  fill = false,
  sizes
}: OptimizedImageProps) {
  // Picsum 이미지 URL 정규화 (캐싱 개선을 위해)
  const normalizeImageUrl = (url: string) => {
    if (url.includes('picsum.photos')) {
      const match = url.match(/random=(\d+)/);
      if (match) {
        const seed = match[1];
        return url.replace(/\?random=\d+/, `?seed=${seed}`);
      }
    }
    return url;
  };

  const normalizedSrc = useMemo(() => normalizeImageUrl(src), [src]);

  const [imgSrc, setImgSrc] = useState(normalizedSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // src 변경 시 상태 초기화 (useEffect로 안전하게 처리)
  useEffect(() => {
    setImgSrc(normalizedSrc);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [normalizedSrc]);

  const handleError = () => {
    if (retryCount < 2 && imgSrc.includes('picsum.photos')) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        const newUrl = imgSrc.includes('seed=')
          ? imgSrc.replace(/seed=\d+/, `seed=${Date.now()}`)
          : `${imgSrc}&t=${Date.now()}`;
        setImgSrc(newUrl);
      }, 1000);
    } else {
      setHasError(true);
      setImgSrc(type === 'store' ? FALLBACK_IMAGES.STORE : FALLBACK_IMAGES.SPOT);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className={`relative overflow-hidden ${className} ${fill ? 'h-full w-full' : ''}`}>
      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400 text-sm text-center px-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
            <div>이미지 로딩 중...</div>
            {retryCount > 0 && (
              <div className="text-xs mt-1">재시도 중... ({retryCount}/2)</div>
            )}
          </div>
        </div>
      )}

      {/* 실제 이미지 */}
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={IMAGE_CONFIG.quality}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${fill ? 'object-cover' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        sizes={sizes || (fill ? IMAGE_CONFIG.sizes.mobile : undefined)}
        crossOrigin="anonymous"
      />

      {/* 에러 상태 표시 */}
      {hasError && imgSrc.startsWith('data:image/svg') && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs z-10">
          데모 이미지
        </div>
      )}

      {/* 디버그 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-10">
          {isLoading ? '로딩중' : hasError ? '에러' : '완료'}
          {retryCount > 0 && ` (재시도: ${retryCount})`}
        </div>
      )}
    </div>
  );
}
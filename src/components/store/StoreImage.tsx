'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { isValidImageUrl } from '@/lib/utils';

interface StoreImageProps {
  images: string[];
  storeName: string;
  className?: string;
}

export default function StoreImage({ images, storeName, className = '' }: StoreImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
  
  // 유효한 이미지만 필터링
  const validImages = images.filter((img, index) => 
    isValidImageUrl(img) && !imageError[index]
  );

  if (validImages.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">이미지가 없습니다</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
    // 현재 보고 있는 이미지에 오류가 발생하면 다음 이미지로 이동
    if (index === currentIndex && validImages.length > 1) {
      nextImage();
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      {/* 메인 이미지 */}
      <div className="relative aspect-video w-full">
        <Image
          src={validImages[currentIndex]}
          alt={`${storeName} 이미지 ${currentIndex + 1}`}
          fill
          className="object-cover"
          onError={() => handleImageError(currentIndex)}
          priority={currentIndex === 0}
        />
        
        {/* 이미지 네비게이션 (이미지가 2개 이상일 때만) */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        
        {/* 이미지 인디케이터 */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* 이미지 카운터 */}
      {validImages.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";

interface SpotImageGalleryProps {
  photos: string[];
  title: string;
}

export default function SpotImageGallery({ photos, title }: SpotImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const displayPhotos = photos.slice(0, 8);

  return (
    <>
      <section className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">사진</h2>
        <div className="grid grid-cols-3 gap-1.5 overflow-hidden rounded-xl">
          {displayPhotos.map((photo, index) => (
            <button
              key={photo}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden bg-gray-100",
                index === 0 && displayPhotos.length > 3 && "col-span-2 row-span-2"
              )}
            >
              <OptimizedImage
                src={photo}
                alt={`${title} 사진 ${index + 1}`}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
              {index === displayPhotos.length - 1 && photos.length > displayPhotos.length && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-lg font-bold text-white">
                    +{photos.length - displayPhotos.length}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-[fadeIn_0.2s_ease-out]">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>

          {selectedIndex > 0 && (
            <button
              onClick={() => setSelectedIndex(selectedIndex - 1)}
              className="absolute left-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div key={selectedIndex} className="relative h-[80vh] w-[90vw] max-w-2xl animate-[fadeIn_0.15s_ease-out]">
            <OptimizedImage
              src={photos[selectedIndex]}
              alt={`${title} 사진 ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {selectedIndex < photos.length - 1 && (
            <button
              onClick={() => setSelectedIndex(selectedIndex + 1)}
              className="absolute right-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <div className="absolute bottom-4 text-sm text-white/70">
            {selectedIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}

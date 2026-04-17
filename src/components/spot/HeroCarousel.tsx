"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import OptimizedImage from "@/components/common/OptimizedImage";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  photos: string[];
  title: string;
}

export default function HeroCarousel({ photos, title }: HeroCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || photos.length <= 1) return;

    const slides = container.children;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Array.from(slides).indexOf(entry.target as Element);
            if (index >= 0) setActiveIndex(index);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    Array.from(slides).forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [photos.length]);

  const scrollTo = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const slide = container.children[index] as HTMLElement;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        scrollTo(activeIndex - 1);
      } else if (e.key === "ArrowRight" && activeIndex < photos.length - 1) {
        scrollTo(activeIndex + 1);
      }
    },
    [activeIndex, photos.length, scrollTo]
  );

  if (photos.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center bg-gray-200 md:h-80">
        <MapPin className="h-12 w-12 text-gray-300" />
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div className="relative h-64 w-full bg-gray-200 md:h-80">
        <OptimizedImage src={photos[0]} alt={title} fill className="object-cover" priority />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex h-64 w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide md:h-80"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="region"
        aria-roledescription="carousel"
        aria-label="Spot 사진"
      >
        {photos.map((photo, i) => (
          <div key={photo} className="w-full shrink-0 snap-center">
            <div className="relative h-64 w-full bg-gray-200 md:h-80">
              <OptimizedImage
                src={photo}
                alt={`${title} 사진 ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
            )}
            aria-label={`사진 ${i + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}

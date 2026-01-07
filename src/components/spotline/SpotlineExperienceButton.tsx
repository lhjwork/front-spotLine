"use client";

import React from "react";
import { QrCode, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import { useSpotlineExperience, AreaType } from "@/lib/spotline";

interface SpotlineExperienceButtonProps {
  area?: AreaType;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  children?: React.ReactNode;
  onError?: (error: Error) => void;
  loadingText?: string;
  useAPI?: boolean; // VERSION002: Experience API 사용 여부
}

const SpotlineExperienceButton: React.FC<SpotlineExperienceButtonProps> = ({
  area = "random",
  size = "lg",
  variant = "primary",
  className = "",
  style = {},
  showArrow = false,
  children,
  onError,
  loadingText = "체험 준비 중...",
  useAPI = true, // VERSION002: 기본적으로 Experience API 사용
}) => {
  const { isLoading, error, goToExperience, goToExperienceWithAPI } = useSpotlineExperience();

  const handleClick = async (): Promise<void> => {
    try {
      if (useAPI) {
        // VERSION002: Experience API 사용 (실제 운영 데이터)
        await goToExperienceWithAPI();
      } else {
        // 로컬 로직 사용
        goToExperience(area);
      }
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error("알 수 없는 오류가 발생했습니다.");
      onError?.(errorObj);
    }
  };

  // 에러가 발생하면 onError 콜백 호출
  React.useEffect(() => {
    if (error && onError) {
      onError(new Error(error));
    }
  }, [error, onError]);

  const defaultStyle: React.CSSProperties = {
    backgroundColor: "#4285f4",
    color: "white",
    padding: size === "lg" ? "12px 24px" : size === "md" ? "10px 20px" : "8px 16px",
    border: "none",
    borderRadius: "8px",
    fontSize: size === "lg" ? "16px" : size === "md" ? "14px" : "12px",
    cursor: isLoading ? "not-allowed" : "pointer",
    fontWeight: "bold",
    opacity: isLoading ? 0.7 : 1,
    transition: "all 0.2s ease",
    ...style,
  };

  return (
    <Button size={size} variant={variant} className={`${className} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`} style={defaultStyle} onClick={handleClick} disabled={isLoading}>
      <QrCode className="mr-2 h-5 w-5" />
      {isLoading ? loadingText : children || "🎯 SpotLine 체험하기"}
      {showArrow && !isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  );
};

export default SpotlineExperienceButton;

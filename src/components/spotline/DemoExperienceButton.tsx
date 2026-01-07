"use client";

import React, { useState } from "react";
import { QrCode, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import { DemoExperienceResult } from "@/types";

interface DemoExperienceButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  children?: React.ReactNode;
  onError?: (error: Error) => void;
  loadingText?: string;
}

const DemoExperienceButton: React.FC<DemoExperienceButtonProps> = ({
  size = "lg",
  variant = "primary",
  className = "",
  style = {},
  showArrow = false,
  children,
  onError,
  loadingText = "데모 준비 중...",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const demoApiUrl = process.env.NEXT_PUBLIC_DEMO_API_URL;
      if (!demoApiUrl) {
        throw new Error("데모 API URL이 설정되지 않았습니다.");
      }

      const response = await fetch(`${demoApiUrl}/experience`);
      const data = await response.json();

      if (data.success) {
        const result = data.data as DemoExperienceResult;
        window.location.href = result.redirectUrl;
      } else {
        throw new Error(data.message || "데모 체험을 시작할 수 없습니다.");
      }
    } catch (error) {
      console.error("데모 체험 오류:", error);

      // 폴백: 기본 데모 매장으로 이동
      const fallbackUrl = `${process.env.NEXT_PUBLIC_DEMO_API_URL}/stores/demo_cafe_001`;
      window.location.href = fallbackUrl;

      if (onError) {
        const errorObj = error instanceof Error ? error : new Error("데모 체험 중 오류가 발생했습니다.");
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      {isLoading ? loadingText : children || "🎭 SpotLine 데모 체험"}
      {showArrow && !isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  );
};

export default DemoExperienceButton;

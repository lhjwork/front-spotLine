"use client";

import React, { useState } from "react";
import { QrCode, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";

interface SpotlineStartResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  configUsed: {
    id: string;
    name: string;
    type: string;
  };
  redirectUrl: string;
  timestamp: string;
}

interface SpotlineStartButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  children?: React.ReactNode;
  onError?: (error: Error) => void;
  loadingText?: string;
}

const SpotlineStartButton: React.FC<SpotlineStartButtonProps> = ({
  size = "lg",
  variant = "primary",
  className = "",
  style = {},
  showArrow = false,
  children,
  onError,
  loadingText = "SpotLine 준비 중...",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // 세션 ID 생성 함수
  const generateSessionId = (): string => {
    return `spotline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

      const response = await fetch(`${apiUrl}/experience`, {
        headers: {
          "x-session-id": generateSessionId(), // 통계용 세션 ID
        },
      });

      const data = await response.json();

      if (data.success) {
        const result = data.data as SpotlineStartResult;
        // 실제 운영 매장으로 이동 (통계 수집 있음)
        window.location.href = result.redirectUrl;
      } else {
        throw new Error(data.message || "SpotLine을 시작할 수 없습니다.");
      }
    } catch (error) {
      console.error("SpotLine 시작 오류:", error);

      if (onError) {
        const errorObj = error instanceof Error ? error : new Error("SpotLine 시작 중 오류가 발생했습니다.");
        onError(errorObj);
      } else {
        alert("SpotLine 시작 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const defaultStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: size === "lg" ? "12px 24px" : size === "md" ? "10px 20px" : "8px 16px",
    border: "2px solid #667eea",
    borderRadius: "8px",
    fontSize: size === "lg" ? "16px" : size === "md" ? "14px" : "12px",
    cursor: isLoading ? "not-allowed" : "pointer",
    fontWeight: "bold",
    opacity: isLoading ? 0.7 : 1,
    transition: "all 0.3s ease",
    position: "relative",
    ...style,
  };

  return (
    <Button size={size} variant={variant} className={`${className} start-mode ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`} style={defaultStyle} onClick={handleClick} disabled={isLoading}>
      <QrCode className="mr-2 h-5 w-5" />
      {isLoading ? loadingText : children || "🎯 SpotLine 시작"}
      {showArrow && !isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  );
};

export default SpotlineStartButton;

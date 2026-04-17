"use client";

import React, { useState } from "react";
import { QrCode, ArrowRight } from "lucide-react";
import Button from "@/components/common/Button";
import { DemoExperienceResult } from "@/types";

interface DemoViewButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  children?: React.ReactNode;
  onError?: (error: Error) => void;
  loadingText?: string;
}

const DemoViewButton: React.FC<DemoViewButtonProps> = ({ size = "lg", variant = "primary", className = "", style = {}, showArrow = false, children, onError, loadingText = "데모 준비 중..." }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 데모 QR 페이지로 직접 이동 (기존 방식 유지)
      window.location.href = '/qr/demo_cafe_001';
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("데모 오류:", error);

      if (onError) {
        const errorObj = error instanceof Error ? error : new Error("데모 중 오류가 발생했습니다.");
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const defaultStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    color: "white",
    padding: size === "lg" ? "12px 24px" : size === "md" ? "10px 20px" : "8px 16px",
    border: "2px dashed #ff6b9d",
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
    <Button size={size} variant={variant} className={`${className} demo-mode ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`} style={defaultStyle} onClick={handleClick} disabled={isLoading}>
      <QrCode className="mr-2 h-5 w-5" />
      {isLoading ? loadingText : children || "🎭 데모보기"}
      {showArrow && !isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  );
};

export default DemoViewButton;

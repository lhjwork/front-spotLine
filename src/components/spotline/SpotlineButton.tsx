"use client";

import React from "react";
import DemoViewButton from "./DemoExperienceButton";
import SpotlineStartButton from "./SpotlineExperienceButton";

interface SpotlineButtonProps {
  mode: "demo" | "start";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  children?: React.ReactNode;
  onError?: (error: Error) => void;
  loadingText?: string;
}

const SpotlineButton: React.FC<SpotlineButtonProps> = ({ mode, size = "lg", variant = "primary", className = "", style = {}, showArrow = false, children, onError, loadingText }) => {
  if (mode === "demo") {
    return (
      <DemoViewButton size={size} variant={variant} className={`${className} demo-mode`} style={style} showArrow={showArrow} onError={onError} loadingText={loadingText}>
        {children}
      </DemoViewButton>
    );
  }

  return (
    <SpotlineStartButton size={size} variant={variant} className={`${className} start-mode`} style={style} showArrow={showArrow} onError={onError} loadingText={loadingText}>
      {children}
    </SpotlineStartButton>
  );
};

export default SpotlineButton;

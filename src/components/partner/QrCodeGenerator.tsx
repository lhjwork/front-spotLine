"use client";

import { useRef, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, Image as ImageIcon } from "lucide-react";

export interface QrCodeGeneratorProps {
  qrUrl: string;
  label: string;
  brandColor?: string;
  size?: number;
}

export default function QrCodeGenerator({
  qrUrl,
  label,
  brandColor = "#000000",
  size = 256,
}: QrCodeGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const downloadPng = useCallback(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${label}.png`;
    a.click();
  }, [label]);

  const downloadSvg = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${label}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [label]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={containerRef} className="rounded-xl border border-gray-200 bg-white p-4">
        <QRCodeSVG value={qrUrl} size={size} fgColor={brandColor} level="M" />
        <div className="hidden">
          <QRCodeCanvas value={qrUrl} size={size * 2} fgColor={brandColor} level="M" />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={downloadPng}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <ImageIcon className="h-4 w-4" />
          PNG 다운로드
        </button>
        <button
          onClick={downloadSvg}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          SVG 다운로드
        </button>
      </div>
    </div>
  );
}

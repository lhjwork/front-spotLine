"use client";

import { useState } from "react";
import { X, MapPin, MapPinCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGeolocation } from "@/hooks/useGeolocation";

interface CheckinMemoModalProps {
  spotTitle: string;
  onSubmit: (data: { latitude?: number; longitude?: number; memo?: string }) => Promise<void>;
  onClose: () => void;
}

export default function CheckinMemoModal({ spotTitle, onSubmit, onClose }: CheckinMemoModalProps) {
  const [memo, setMemo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { coordinates, status } = useGeolocation();

  const gpsReady = status === "granted" && coordinates !== null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        memo: memo.trim() || undefined,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 429) {
        setError("24시간 내 이미 체크인하였습니다.");
      } else {
        setError("체크인에 실패했습니다.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-xl sm:rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">체크인</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 text-sm text-gray-600">
          <span className="font-medium text-gray-900">{spotTitle}</span>에 체크인합니다
        </p>

        {/* GPS 상태 */}
        <div className={cn(
          "mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
          gpsReady ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
        )}>
          {status === "requesting" ? (
            <><Loader2 size={16} className="animate-spin" /> 위치 확인 중...</>
          ) : gpsReady ? (
            <><MapPinCheck size={16} /> GPS 인증 가능</>
          ) : (
            <><MapPin size={16} /> GPS 없이 체크인 (미인증)</>
          )}
        </div>

        {/* 메모 입력 */}
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="한줄 메모 (선택)"
          rows={2}
          maxLength={100}
          className="mb-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <p className="mb-3 text-right text-xs text-gray-400">{memo.length}/100</p>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "체크인 중..." : "체크인"}
          </button>
        </div>
      </div>
    </div>
  );
}

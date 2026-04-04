"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, CalendarPlus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMySpotLinesStore } from "@/store/useMySpotLinesStore";
import { replicateSpotLine } from "@/lib/api";
import type { MySpotLine } from "@/types";

interface ReplicateSpotLineSheetProps {
  isOpen: boolean;
  onClose: () => void;
  spotLine: {
    id: string;
    slug: string;
    title: string;
    area: string;
    spotsCount: number;
  };
}

const LOCAL_STORAGE_KEY = "spotline_my_spotlines";

const getQuickDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const saturday = new Date(today);
  saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));

  return {
    today: today.toISOString().split("T")[0],
    tomorrow: tomorrow.toISOString().split("T")[0],
    weekend: saturday.toISOString().split("T")[0],
  };
};

const formatDateKr = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = days[date.getDay()];
  return `${m}월 ${d}일 (${day})`;
};

export default function ReplicateSpotLineSheet({
  isOpen,
  onClose,
  spotLine,
}: ReplicateSpotLineSheetProps) {
  const addSpotLine = useMySpotLinesStore((s) => s.addSpotLine);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDateInput, setShowDateInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const quickDates = getQuickDates();

  // ESC close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleKeyDown]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(null);
      setShowDateInput(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (date: string | null) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await replicateSpotLine(spotLine.id, date);
      addSpotLine(response.mySpotLine);
      setToast("내 일정에 추가되었습니다");
      onClose();
    } catch {
      // localStorage fallback
      const localSpotLine: MySpotLine = {
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        spotLineId: spotLine.id,
        spotLineSlug: spotLine.slug,
        title: spotLine.title,
        area: spotLine.area,
        spotsCount: spotLine.spotsCount,
        scheduledDate: date,
        status: "scheduled",
        completedAt: null,
        parentSpotLineId: spotLine.id,
        createdAt: new Date().toISOString(),
      };
      addSpotLine(localSpotLine);
      console.warn("복제 API 실패 — localStorage에 저장");
      setToast("내 일정에 추가되었습니다");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        {/* Bottom Sheet */}
        <div className="relative w-full max-w-lg animate-slide-up rounded-t-2xl bg-white px-6 pb-8 pt-4">
          {/* Drag handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">내 일정에 추가</h3>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {spotLine.title} · {spotLine.area} · {spotLine.spotsCount}곳
            </p>
          </div>

          {/* Date selection */}
          <p className="mb-3 text-sm font-medium text-gray-700">
            언제 가실 예정인가요?
          </p>

          {/* Quick dates */}
          <div className="mb-3 flex gap-2">
            {[
              { label: "오늘", date: quickDates.today },
              { label: "내일", date: quickDates.tomorrow },
              { label: "이번 주말", date: quickDates.weekend },
            ].map(({ label, date }) => (
              <button
                key={label}
                onClick={() => {
                  setSelectedDate(date);
                  setShowDateInput(false);
                }}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  selectedDate === date
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <span>{label}</span>
                <span className="mt-0.5 block text-xs text-gray-400">
                  {formatDateKr(date)}
                </span>
              </button>
            ))}
          </div>

          {/* Custom date */}
          <button
            onClick={() => setShowDateInput(!showDateInput)}
            className={cn(
              "mb-4 flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors",
              showDateInput
                ? "border-purple-600 bg-purple-50 text-purple-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            <Calendar className="h-4 w-4" />
            다른 날짜 선택
          </button>

          {showDateInput && (
            <input
              type="date"
              min={quickDates.today}
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
            />
          )}

          {/* Submit button */}
          <button
            onClick={() => handleSubmit(selectedDate)}
            disabled={isSubmitting}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-colors",
              selectedDate
                ? "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            <CalendarPlus className="h-4 w-4" />
            {isSubmitting
              ? "추가 중..."
              : selectedDate
                ? `${formatDateKr(selectedDate)} 추가하기`
                : "날짜를 선택해주세요"}
          </button>

          {/* Skip date */}
          <button
            onClick={() => handleSubmit(null)}
            disabled={isSubmitting}
            className="mt-3 w-full py-2 text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            나중에 정할게요
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-8 z-[60] -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </>,
    document.body
  );
}

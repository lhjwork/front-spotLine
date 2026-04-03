"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createReport } from "@/lib/api";

interface ReportModalProps {
  targetType: string;
  targetId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const reasons = [
  { value: "SPAM", label: "스팸" },
  { value: "INAPPROPRIATE", label: "부적절한 내용" },
  { value: "HARASSMENT", label: "괴롭힘/욕설" },
  { value: "OTHER", label: "기타" },
];

export default function ReportModal({ targetType, targetId, onClose, onSuccess }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createReport({ targetType, targetId, reason, description: description || undefined });
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 409) {
        setError("이미 신고한 콘텐츠입니다.");
      } else {
        setError("신고에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">신고하기</h3>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 space-y-2">
          {reasons.map((r) => (
            <label
              key={r.value}
              className={cn(
                "flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm",
                reason === r.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="mr-2"
              />
              {r.label}
            </label>
          ))}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="추가 설명 (선택)"
          rows={2}
          maxLength={500}
          className="mb-3 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isSubmitting ? "신고 중..." : "신고하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

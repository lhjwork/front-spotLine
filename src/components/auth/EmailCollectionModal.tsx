"use client";

import { useState } from "react";
import { updateMyEmail } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export interface EmailCollectionModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailCollectionModal({ onComplete, onSkip }: EmailCollectionModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!EMAIL_REGEX.test(email)) {
      setError("올바른 이메일 형식이 아닙니다");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateMyEmail(email);
      useAuthStore.getState().setUser(updated);
      onComplete();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 409
          ? "이미 사용 중인 이메일입니다"
          : "이메일 저장에 실패했습니다. 다시 시도해 주세요",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="mb-2 text-lg font-semibold text-gray-900">환영합니다!</h1>
        <p className="mb-1 text-sm text-gray-600">서비스 이용을 위해 이메일을 입력해 주세요.</p>
        <p className="mb-6 text-xs text-gray-400">알림, 계정 복구 등에 사용됩니다.</p>

        <input
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isSubmitting) handleSubmit();
          }}
          className="mb-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        {error && <p className="mb-3 text-left text-xs text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !email}
          className="mb-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "처리 중..." : "이메일로 시작하기"}
        </button>

        <button
          onClick={onSkip}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          나중에 할게요
        </button>
      </div>
    </div>
  );
}

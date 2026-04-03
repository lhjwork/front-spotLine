"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export default function CommentForm({ onSubmit, placeholder = "댓글을 작성하세요...", autoFocus = false, onCancel }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
        로그인 후 댓글을 작성할 수 있습니다
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={500}
        rows={2}
        className={cn(
          "flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm",
          "placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        )}
      />
      <div className="flex flex-col gap-1">
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className={cn(
            "rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:bg-blue-700 transition-colors"
          )}
        >
          {isSubmitting ? "..." : "작성"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
}

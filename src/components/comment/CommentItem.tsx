"use client";

import { useState } from "react";
import { MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { updateComment, deleteComment } from "@/lib/api";
import type { CommentResponse } from "@/types";
import CommentMenu from "./CommentMenu";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: CommentResponse;
  onReply: (parentId: string, content: string) => Promise<void>;
  onUpdate: (commentId: string, updated: CommentResponse) => void;
  onDelete: (commentId: string) => void;
  isReply?: boolean;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}일 전`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${Math.floor(diffMonth / 12)}년 전`;
}

export default function CommentItem({ comment, onReply, onUpdate, onDelete, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);
  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user?.id;
  const isOwner = currentUserId === comment.userId;

  const handleEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    try {
      const updated = await updateComment(comment.id, { content: trimmed });
      onUpdate(comment.id, updated);
      setIsEditing(false);
    } catch { /* 에러 무시 */ }
  };

  const handleDelete = async () => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
    } catch { /* 에러 무시 */ }
  };

  const handleReply = async (content: string) => {
    await onReply(comment.id, content);
    setShowReplyForm(false);
  };

  if (comment.isDeleted && (!comment.replies || comment.replies.length === 0)) {
    return null;
  }

  return (
    <div className={cn("py-3", isReply && "ml-8 border-l-2 border-gray-100 pl-4")}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
          {comment.userAvatarUrl && !comment.isDeleted ? (
            <img src={comment.userAvatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <User size={16} className="text-gray-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", comment.isDeleted && "text-gray-400")}>
              {comment.isDeleted ? "" : comment.userName}
            </span>
            <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
            {isOwner && !comment.isDeleted && (
              <CommentMenu onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mt-1 flex gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={500}
                rows={2}
                className="flex-1 resize-none rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              />
              <div className="flex flex-col gap-1">
                <button onClick={handleEdit} className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">저장</button>
                <button onClick={() => { setIsEditing(false); setEditContent(comment.content); }} className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100">취소</button>
              </div>
            </div>
          ) : (
            <p className={cn("mt-1 text-sm", comment.isDeleted ? "italic text-gray-400" : "text-gray-800")}>
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!comment.isDeleted && !isReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="mt-1 flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
            >
              <MessageCircle size={12} />
              답글
            </button>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleReply}
                placeholder="답글을 작성하세요..."
                autoFocus
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.length > 2 && !showReplies ? (
            <button
              onClick={() => setShowReplies(true)}
              className="ml-11 text-xs text-blue-600 hover:underline"
            >
              답글 {comment.replies.length}개 보기
            </button>
          ) : (
            <>
              {comment.replies.length > 2 && (
                <button
                  onClick={() => setShowReplies(false)}
                  className="ml-11 text-xs text-gray-500 hover:underline"
                >
                  답글 접기
                </button>
              )}
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  isReply
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { fetchComments, createComment } from "@/lib/api";
import type { CommentResponse, CommentTargetType } from "@/types";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string;
  commentsCount: number;
}

export default function CommentSection({ targetType, targetId, commentsCount }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [totalCount, setTotalCount] = useState(commentsCount);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadComments = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const data = await fetchComments(targetType, targetId, pageNum);
      if (pageNum === 0) {
        setComments(data.content);
      } else {
        setComments((prev) => [...prev, ...data.content]);
      }
      setTotalPages(data.totalPages);
      setTotalCount(data.totalElements);
    } finally {
      setIsLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    loadComments(0);
  }, [loadComments]);

  const handleSubmit = async (content: string) => {
    const newComment = await createComment({
      targetType,
      targetId,
      content,
    });
    setComments((prev) => [newComment, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  const handleReply = async (parentId: string, content: string) => {
    const reply = await createComment({
      targetType,
      targetId,
      content,
      parentId,
    });
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...c.replies, reply] }
          : c
      )
    );
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdate = (commentId: string, updated: CommentResponse) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) return { ...c, content: updated.content, updatedAt: updated.updatedAt };
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId ? { ...r, content: updated.content, updatedAt: updated.updatedAt } : r
          ),
        };
      })
    );
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) return { ...c, isDeleted: true, content: "삭제된 댓글입니다" };
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId ? { ...r, isDeleted: true, content: "삭제된 댓글입니다" } : r
          ),
        };
      })
    );
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage);
  };

  return (
    <section className="mt-6">
      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
        <MessageCircle size={18} />
        댓글 ({totalCount})
      </h3>

      <div className="mt-3">
        <CommentForm onSubmit={handleSubmit} />
      </div>

      <div className="mt-4 divide-y divide-gray-100">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isLoading && (
        <div className="py-4 text-center text-sm text-gray-400">댓글 불러오는 중...</div>
      )}

      {!isLoading && comments.length === 0 && (
        <div className="py-6 text-center text-sm text-gray-400">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </div>
      )}

      {page + 1 < totalPages && !isLoading && (
        <button
          onClick={handleLoadMore}
          className="mt-2 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          더 보기
        </button>
      )}
    </section>
  );
}

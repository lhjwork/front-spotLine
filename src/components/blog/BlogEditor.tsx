"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlogEditorStore } from "@/store/useBlogEditorStore";
import { useShallow } from "zustand/react/shallow";
import { createBlog, getBlogBySlug } from "@/lib/api";
import BlockEditor from "./BlockEditor";
import TransitionBlock from "./TransitionBlock";
import BlockNavigator from "./BlockNavigator";
import BlockNavigatorChips from "./BlockNavigatorChips";
import BlockMediaUpload from "./BlockMediaUpload";
import BlogCoverEditor from "./BlogCoverEditor";
import BlogAutoSaveIndicator from "./BlogAutoSaveIndicator";
import BlogPublishSheet from "./BlogPublishSheet";

interface BlogEditorProps {
  mode: "new" | "edit";
  spotLineId?: string;
  editSlug?: string;
}

export default function BlogEditor({ mode, spotLineId, editSlug }: BlogEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishSheet, setShowPublishSheet] = useState(false);

  const {
    initFromBlog,
    blocks,
    activeBlockId,
    title,
    coverImageUrl,
    status,
    isSaving,
    setTitle,
    setCoverImage,
    setActiveBlock,
    updateBlockContent,
    addBlockMedia,
    removeBlockMedia,
    saveDraft,
  } = useBlogEditorStore(useShallow((s) => ({
    initFromBlog: s.initFromBlog,
    blocks: s.blocks,
    activeBlockId: s.activeBlockId,
    title: s.title,
    coverImageUrl: s.coverImageUrl,
    status: s.status,
    isSaving: s.isSaving,
    setTitle: s.setTitle,
    setCoverImage: s.setCoverImage,
    setActiveBlock: s.setActiveBlock,
    updateBlockContent: s.updateBlockContent,
    addBlockMedia: s.addBlockMedia,
    removeBlockMedia: s.removeBlockMedia,
    saveDraft: s.saveDraft,
  })));

  // Initialize blog
  useEffect(() => {
    const init = async () => {
      try {
        if (mode === "new" && spotLineId) {
          const blog = await createBlog({ spotLineId, title: "새 블로그" });
          initFromBlog(blog);
          // Update URL to edit mode
          router.replace(`/blog/edit/${blog.slug}`);
        } else if (mode === "edit" && editSlug) {
          const blog = await getBlogBySlug(editSlug);
          if (!blog) {
            router.replace("/my-blogs");
            return;
          }
          initFromBlog(blog);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") console.error("블로그 초기화 실패:", err);
        router.replace("/my-blogs");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [mode, spotLineId, editSlug, initFromBlog, router]);

  // Scroll sync: navigator click → scroll to block
  const scrollToBlock = useCallback((blockId: string) => {
    setActiveBlock(blockId);
    const el = document.querySelector(`[data-block-id="${blockId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [setActiveBlock]);

  // Scroll sync: IntersectionObserver → update active block
  useEffect(() => {
    const blockEls = document.querySelectorAll("[data-block-id]");
    if (blockEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio > 0.3)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const blockId = visible[0].target.getAttribute("data-block-id");
          if (blockId) setActiveBlock(blockId);
        }
      },
      { threshold: [0.3, 0.7], rootMargin: "-80px 0px -40% 0px" }
    );

    blockEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [blocks, setActiveBlock]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b bg-white px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="블로그 제목을 입력하세요"
              className="flex-1 text-lg font-bold focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => saveDraft()}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                초안 저장
              </button>
              <button
                onClick={() => setShowPublishSheet(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                {status === "PUBLISHED" ? "수정 발행" : "발행하기"}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile navigator chips */}
        <BlockNavigatorChips
          blocks={blocks}
          activeBlockId={activeBlockId}
          onBlockClick={scrollToBlock}
        />

        {/* Main layout */}
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex gap-6">
            {/* Editor area */}
            <div className="flex-1 space-y-4">
              {/* Cover */}
              <BlogCoverEditor
                coverImageUrl={coverImageUrl}
                onCoverChange={setCoverImage}
              />

              {/* Blocks */}
              {blocks.map((block) => {
                if (block.blockType === "TRANSITION") {
                  return (
                    <TransitionBlock
                      key={block.id}
                      blockId={block.id}
                      content={block.content}
                      isActive={block.id === activeBlockId}
                      onContentChange={updateBlockContent}
                      onFocus={setActiveBlock}
                    />
                  );
                }

                return (
                  <div key={block.id}>
                    <BlockEditor
                      blockId={block.id}
                      blockType={block.blockType}
                      content={block.content}
                      spotTitle={block.spotTitle}
                      isActive={block.id === activeBlockId}
                      onContentChange={updateBlockContent}
                      onFocus={setActiveBlock}
                    />
                    {block.blockType === "SPOT" && (
                      <BlockMediaUpload
                        blockId={block.id}
                        mediaItems={block.mediaItems}
                        onAddMedia={addBlockMedia}
                        onRemoveMedia={removeBlockMedia}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop navigator */}
            <div className="w-56 shrink-0">
              <BlockNavigator
                blocks={blocks}
                activeBlockId={activeBlockId}
                onBlockClick={scrollToBlock}
              />
            </div>
          </div>
        </div>
      </div>

      <BlogAutoSaveIndicator />

      <BlogPublishSheet
        isOpen={showPublishSheet}
        onClose={() => setShowPublishSheet(false)}
      />
    </>
  );
}

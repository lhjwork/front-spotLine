"use client";

import { create } from "zustand";
import {
  saveBlogBlocks,
  updateBlog,
  publishBlog as apiPublishBlog,
} from "@/lib/api";
import type {
  BlogDetailResponse,
  BlogBlockResponse,
  BlogBlockMediaResponse,
  BlogBlockType,
  BlogStatus,
  SpotDetailResponse,
} from "@/types";

export interface EditorBlock {
  id: string;
  blockType: BlogBlockType;
  blockOrder: number;
  spotId: string | null;
  spotTitle: string | null;
  spotCategory: string | null;
  spotArea: string | null;
  content: string | null;
  mediaItems: BlogBlockMediaResponse[];
}

interface BlogEditorState {
  blogId: string | null;
  blogSlug: string | null;
  spotLineId: string | null;
  title: string;
  summary: string;
  coverImageUrl: string | null;
  status: BlogStatus;

  blocks: EditorBlock[];
  activeBlockId: string | null;

  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;

  initFromBlog: (blog: BlogDetailResponse) => void;
  setTitle: (title: string) => void;
  setSummary: (summary: string) => void;
  setCoverImage: (url: string | null) => void;
  setActiveBlock: (blockId: string) => void;
  updateBlockContent: (blockId: string, content: string) => void;
  addBlockMedia: (blockId: string, media: BlogBlockMediaResponse) => void;
  removeBlockMedia: (blockId: string, mediaId: string) => void;

  addSpot: (spot: SpotDetailResponse, afterBlockId?: string) => void;
  removeSpot: (spotId: string) => void;

  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  markDirty: () => void;
}

function blockResponseToEditor(b: BlogBlockResponse): EditorBlock {
  return {
    id: b.id,
    blockType: b.blockType,
    blockOrder: b.blockOrder,
    spotId: b.spotId,
    spotTitle: b.spotTitle,
    spotCategory: b.spotCategory,
    spotArea: b.spotArea,
    content: b.content,
    mediaItems: b.mediaItems,
  };
}

function buildSaveRequest(blocks: EditorBlock[]) {
  return {
    blocks: blocks.map((b) => ({
      id: b.id,
      spotId: b.spotId || undefined,
      blockType: b.blockType,
      blockOrder: b.blockOrder,
      content: b.content,
      mediaItems: b.mediaItems.map((m) => ({
        id: m.id,
        mediaUrl: m.mediaUrl,
        mediaOrder: m.mediaOrder,
        caption: m.caption || undefined,
      })),
    })),
  };
}

export const useBlogEditorStore = create<BlogEditorState>((set, get) => ({
  blogId: null,
  blogSlug: null,
  spotLineId: null,
  title: "",
  summary: "",
  coverImageUrl: null,
  status: "DRAFT",

  blocks: [],
  activeBlockId: null,

  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  saveError: null,

  initFromBlog: (blog) => {
    set({
      blogId: blog.id,
      blogSlug: blog.slug,
      spotLineId: blog.spotLine?.id || null,
      title: blog.title,
      summary: blog.summary || "",
      coverImageUrl: blog.coverImageUrl,
      status: blog.status,
      blocks: blog.blocks.map(blockResponseToEditor),
      activeBlockId: blog.blocks[0]?.id || null,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
      saveError: null,
    });
  },

  setTitle: (title) => set({ title, isDirty: true }),
  setSummary: (summary) => set({ summary, isDirty: true }),
  setCoverImage: (coverImageUrl) => set({ coverImageUrl, isDirty: true }),
  setActiveBlock: (blockId) => set({ activeBlockId: blockId }),

  updateBlockContent: (blockId, content) => {
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === blockId ? { ...b, content } : b
      ),
      isDirty: true,
    }));
  },

  addBlockMedia: (blockId, media) => {
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === blockId
          ? { ...b, mediaItems: [...b.mediaItems, media] }
          : b
      ),
      isDirty: true,
    }));
  },

  removeBlockMedia: (blockId, mediaId) => {
    set((state) => ({
      blocks: state.blocks.map((b) =>
        b.id === blockId
          ? { ...b, mediaItems: b.mediaItems.filter((m) => m.id !== mediaId) }
          : b
      ),
      isDirty: true,
    }));
  },

  addSpot: (spot, afterBlockId) => {
    const { blocks } = get();
    const insertIndex = afterBlockId
      ? blocks.findIndex((b) => b.id === afterBlockId) + 1
      : blocks.length - 1; // before OUTRO

    const tempId = () => crypto.randomUUID();
    const newBlocks = [...blocks];

    // Insert TRANSITION + SPOT
    const transitionBlock: EditorBlock = {
      id: tempId(),
      blockType: "TRANSITION",
      blockOrder: 0,
      spotId: null,
      spotTitle: null,
      spotCategory: null,
      spotArea: null,
      content: null,
      mediaItems: [],
    };
    const spotBlock: EditorBlock = {
      id: tempId(),
      blockType: "SPOT",
      blockOrder: 0,
      spotId: spot.id,
      spotTitle: spot.title,
      spotCategory: spot.category,
      spotArea: spot.area,
      content: null,
      mediaItems: [],
    };

    newBlocks.splice(insertIndex, 0, transitionBlock, spotBlock);

    // Reindex
    const reindexed = newBlocks.map((b, i) => ({ ...b, blockOrder: i }));
    set({ blocks: reindexed, isDirty: true });
  },

  removeSpot: (spotId) => {
    const { blocks } = get();
    const spotIndex = blocks.findIndex(
      (b) => b.blockType === "SPOT" && b.spotId === spotId
    );
    if (spotIndex === -1) return;

    const newBlocks = [...blocks];
    // Remove the SPOT block and adjacent TRANSITION
    newBlocks.splice(spotIndex, 1);
    // Remove preceding TRANSITION if exists
    if (spotIndex > 0 && newBlocks[spotIndex - 1]?.blockType === "TRANSITION") {
      newBlocks.splice(spotIndex - 1, 1);
    }

    const reindexed = newBlocks.map((b, i) => ({ ...b, blockOrder: i }));
    set({ blocks: reindexed, isDirty: true });
  },

  saveDraft: async () => {
    const { blogId, blogSlug, title, summary, coverImageUrl, blocks } = get();
    if (!blogId) return;

    set({ isSaving: true, saveError: null });
    try {
      // Save meta if changed
      if (blogSlug) {
        await updateBlog(blogSlug, { title, summary, coverImageUrl: coverImageUrl || undefined });
      }
      // Save blocks
      await saveBlogBlocks(blogId, buildSaveRequest(blocks));
      set({ isDirty: false, lastSavedAt: new Date(), isSaving: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "저장 실패";
      set({ saveError: message, isSaving: false });
      // Backup to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `blog-backup-${blogId}`,
          JSON.stringify({ title, summary, coverImageUrl, blocks })
        );
      }
    }
  },

  publish: async () => {
    const { blogSlug, saveDraft } = get();
    if (!blogSlug) return;

    // Save first
    await saveDraft();

    set({ isSaving: true });
    try {
      const result = await apiPublishBlog(blogSlug);
      set({ status: result.status, isSaving: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "발행 실패";
      set({ saveError: message, isSaving: false });
    }
  },

  markDirty: () => set({ isDirty: true }),
}));

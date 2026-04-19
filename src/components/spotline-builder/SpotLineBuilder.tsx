"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpotLineBuilderStore } from "@/store/useSpotLineBuilderStore";
import {
  createSpotLine,
  updateSpotLine,
  fetchSpotLineDetail,
  fetchSpotDetail,
} from "@/lib/api";
import SpotSearchPanel from "./SpotSearchPanel";
import SelectedSpotList from "./SelectedSpotList";
import SpotLineMetaForm from "./SpotLineMetaForm";
import ForkBadge from "./ForkBadge";

interface SpotLineBuilderProps {
  mode: "create" | "fork" | "edit";
  forkSlug?: string;
  editSlug?: string;
  spotSlug?: string;
  spotSlugs?: string[];
}

export default function SpotLineBuilder({
  mode,
  forkSlug,
  editSlug,
  spotSlug,
  spotSlugs,
}: SpotLineBuilderProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"search" | "course">("search");
  const [isInitializing, setIsInitializing] = useState(
    mode !== "create" || !!spotSlug || !!spotSlugs?.length
  );

  const spots = useSpotLineBuilderStore((s) => s.spots);
  const isSaving = useSpotLineBuilderStore((s) => s.isSaving);
  const isDirty = useSpotLineBuilderStore((s) => s.isDirty);
  const canSave = useSpotLineBuilderStore((s) => s.canSave);
  const clearAll = useSpotLineBuilderStore((s) => s.clearAll);
  const initFromFork = useSpotLineBuilderStore((s) => s.initFromFork);
  const initFromEdit = useSpotLineBuilderStore((s) => s.initFromEdit);
  const addSpot = useSpotLineBuilderStore((s) => s.addSpot);
  const setIsSaving = useSpotLineBuilderStore((s) => s.setIsSaving);
  const toCreateRequest = useSpotLineBuilderStore((s) => s.toCreateRequest);
  const toUpdateRequest = useSpotLineBuilderStore((s) => s.toUpdateRequest);

  // 초기화
  useEffect(() => {
    const init = async () => {
      if (mode === "fork" && forkSlug) {
        try {
          const spotLine = await fetchSpotLineDetail(forkSlug);
          if (spotLine) initFromFork(spotLine);
        } catch {
          // 원본 없으면 빈 Builder
          clearAll();
        }
      } else if (mode === "edit" && editSlug) {
        try {
          const spotLine = await fetchSpotLineDetail(editSlug);
          if (spotLine) initFromEdit(spotLine);
        } catch {
          router.back();
          return;
        }
      } else if (mode === "create" && spotSlugs?.length) {
        clearAll();
        const results = await Promise.allSettled(
          spotSlugs.map((s) => fetchSpotDetail(s))
        );
        for (const r of results) {
          if (r.status === "fulfilled" && r.value) addSpot(r.value);
        }
      } else if (mode === "create" && spotSlug) {
        clearAll();
        try {
          const spot = await fetchSpotDetail(spotSlug);
          if (spot) addSpot(spot);
        } catch {
          // Spot 로딩 실패 무시
        }
      } else {
        clearAll();
      }
      setIsInitializing(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, forkSlug, editSlug, spotSlug, spotSlugs]);

  // 미저장 경고
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSave = async () => {
    if (!canSave() || isSaving) return;
    setIsSaving(true);
    try {
      if (mode === "edit" && editSlug) {
        await updateSpotLine(editSlug, toUpdateRequest());
        router.push(`/spotline/${editSlug}`);
      } else {
        const result = await createSpotLine(toCreateRequest());
        router.push(`/spotline/${result.slug}`);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "저장에 실패했어요. 다시 시도해주세요";
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const validationErrors: string[] = [];
  if (spots.length < 2) validationErrors.push("최소 2곳 이상 추가해주세요");

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col md:flex-row">
      {/* 모바일 탭 */}
      <div className="flex border-b border-gray-200 md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors",
            activeTab === "search"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500"
          )}
        >
          Spot 검색
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("course")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors",
            activeTab === "course"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-500"
          )}
        >
          내 코스 {spots.length > 0 && `(${spots.length})`}
        </button>
      </div>

      {/* 좌측: 검색 (데스크톱 항상, 모바일 탭) */}
      <div
        className={cn(
          "flex-1 overflow-hidden border-r border-gray-200 md:block md:max-w-[400px]",
          activeTab === "search" ? "block" : "hidden"
        )}
      >
        <SpotSearchPanel />
      </div>

      {/* 우측: 선택된 코스 + 메타 (데스크톱 항상, 모바일 탭) */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden md:block",
          activeTab === "course" ? "block" : "hidden"
        )}
      >
        {/* Fork Badge */}
        {mode === "fork" && <div className="pt-4"><ForkBadge /></div>}

        {/* Selected Spots */}
        <div className="flex-1 overflow-y-auto pt-4">
          <SelectedSpotList />
        </div>

        {/* Meta Form */}
        <SpotLineMetaForm />

        {/* Save Bar */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          {validationErrors.length > 0 && !canSave() && spots.length > 0 && (
            <p className="mb-2 text-center text-xs text-red-500">
              {validationErrors[0]}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {spots.length}/10곳
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave() || isSaving}
              className={cn(
                "rounded-lg px-6 py-2.5 text-sm font-medium transition-colors",
                canSave() && !isSaving
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </span>
              ) : mode === "edit" ? (
                "수정 저장"
              ) : (
                "SpotLine 저장"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

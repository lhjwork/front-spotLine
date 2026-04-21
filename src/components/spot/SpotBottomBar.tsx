"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, MapPinCheck, Share2, Navigation2, ChevronDown, ChevronUp, Route, Flag, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import SpotShareSheet from "@/components/spot/SpotShareSheet";
import CheckinMemoModal from "@/components/spot/CheckinMemoModal";
import ExternalMapButtons from "@/components/map/ExternalMapButtons";
import ReportModal from "@/components/comment/ReportModal";
import AddToSpotLineSheet from "@/components/qr/AddToSpotLineSheet";
import type { SpotDetailResponse } from "@/types";

interface SpotBottomBarProps {
  spot: SpotDetailResponse;
  spotLinesCount?: number;
  isQrMode?: boolean;
}

export default function SpotBottomBar({ spot, spotLinesCount = 0, isQrMode = false }: SpotBottomBarProps) {
  const item = useSocialStore((s) => s.getItem("spot", spot.id));
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const toggleSave = useSocialStore((s) => s.toggleSave);
  const checkin = useSocialStore((s) => s.checkin);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const session = useAuthStore((s) => s.session);
  const isOwner = session?.user?.id === spot.creatorId;

  const [showMap, setShowMap] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const liked = item?.liked ?? false;
  const saved = item?.saved ?? false;
  const visited = item?.visited ?? false;
  const likesCount = item?.likesCount ?? spot.likesCount;

  const handleLike = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 좋아요를 남겨보세요");
      setShowLogin(true);
      return;
    }
    toggleLike("spot", spot.id);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 이 장소를 저장해보세요");
      setShowLogin(true);
      return;
    }
    toggleSave("spot", spot.id);
  };

  const handleCheckin = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 체크인 해보세요");
      setShowLogin(true);
      return;
    }
    setShowCheckinModal(true);
  };

  const handleCheckinSubmit = async (data: { latitude?: number; longitude?: number; memo?: string }) => {
    await checkin(spot.id, data);
    setShowCheckinModal(false);
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              liked
                ? "bg-red-50 text-red-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
            <span>{likesCount.toLocaleString()}</span>
          </button>

          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              saved
                ? "bg-amber-50 text-amber-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-amber-500")} />
            <span>{saved ? "저장됨" : "저장"}</span>
          </button>

          <button
            onClick={handleCheckin}
            className={cn(
              "flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              visited
                ? "bg-green-50 text-green-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <MapPinCheck className={cn("h-4 w-4", visited && "fill-green-500")} />
            <span>체크인</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Share2 className="h-4 w-4" />
            <span>{spot.sharesCount > 0 ? spot.sharesCount : "공유"}</span>
          </button>

          {isAuthenticated && !isOwner && (
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center rounded-xl px-2 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
              title="신고"
            >
              <Flag className="h-4 w-4" />
            </button>
          )}

          {isQrMode && (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setLoginMessage("로그인하고 SpotLine에 추가해보세요");
                  setShowLogin(true);
                  return;
                }
                setShowAddSheet(true);
              }}
              className="flex items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">추가</span>
            </button>
          )}

          {spotLinesCount > 0 ? (
            <button
              onClick={() => document.getElementById("spotlines")?.scrollIntoView({ behavior: "smooth" })}
              className="relative flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
            >
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">코스</span>
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-bold text-white">
                {spotLinesCount}
              </span>
            </button>
          ) : (
            <Link
              href={`/create-spotline?spot=${spot.slug}`}
              className="flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
            >
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">코스</span>
            </Link>
          )}

          <button
            onClick={() => setShowMap(!showMap)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            <Navigation2 className="h-4 w-4" />
            길찾기
            {showMap ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Map buttons expansion */}
        <div
          className={cn(
            "grid transition-all duration-200 ease-out",
            showMap ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="mx-auto max-w-lg">
                <ExternalMapButtons
                  storeName={spot.title}
                  address={spot.address}
                  lat={spot.latitude}
                  lng={spot.longitude}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message={loginMessage}
      />

      <SpotShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        spot={spot}
      />

      {showCheckinModal && (
        <CheckinMemoModal
          spotTitle={spot.title}
          onSubmit={handleCheckinSubmit}
          onClose={() => setShowCheckinModal(false)}
        />
      )}

      {showReport && (
        <ReportModal
          targetType="SPOT"
          targetId={spot.id}
          onClose={() => setShowReport(false)}
          onSuccess={() => setShowReport(false)}
        />
      )}

      <AddToSpotLineSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        spotSlug={spot.slug}
      />
    </>
  );
}

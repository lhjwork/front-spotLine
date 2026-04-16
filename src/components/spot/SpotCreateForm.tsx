"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSpot, updateSpot } from "@/lib/api";
import { cn } from "@/lib/utils";
import CategorySelector from "./CategorySelector";
import AddressSearch from "./AddressSearch";
import TagInput from "./TagInput";
import CreateFormPhotoUpload from "./CreateFormPhotoUpload";
import type { SpotCategory, SpotDetailResponse, CreateSpotRequest, MediaItemRequest } from "@/types";

interface AddressData {
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  sido: string;
  sigungu: string;
  dong: string;
}

interface SpotCreateFormProps {
  editData?: SpotDetailResponse;
}

export default function SpotCreateForm({ editData }: SpotCreateFormProps) {
  const router = useRouter();
  const isEditMode = !!editData;

  const [title, setTitle] = useState(editData?.title || "");
  const [category, setCategory] = useState<SpotCategory | null>(
    editData?.category || null
  );
  const [addressData, setAddressData] = useState<AddressData | null>(
    editData
      ? {
          address: editData.address,
          latitude: editData.latitude,
          longitude: editData.longitude,
          area: editData.area,
          sido: editData.sido || "",
          sigungu: editData.sigungu || "",
          dong: editData.dong || "",
        }
      : null
  );
  const [description, setDescription] = useState(editData?.description || "");
  const [tags, setTags] = useState<string[]>(editData?.tags || []);
  const [blogUrl, setBlogUrl] = useState(editData?.blogUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(editData?.instagramUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(editData?.websiteUrl || "");

  const [mediaItems, setMediaItems] = useState<MediaItemRequest[]>(
    editData?.mediaItems?.map((m) => ({ url: m.url, mediaType: m.mediaType })) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "장소 이름을 입력해주세요";
    if (!category) newErrors.category = "카테고리를 선택해주세요";
    if (!addressData) newErrors.address = "주소를 검색해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !addressData) return;

    setIsSubmitting(true);
    try {
      const request: CreateSpotRequest = {
        title: title.trim(),
        category: category!,
        source: "USER",
        address: addressData.address,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        area: addressData.area,
        sido: addressData.sido,
        sigungu: addressData.sigungu,
        dong: addressData.dong,
        ...(description.trim() && { description: description.trim() }),
        ...(tags.length > 0 && { tags }),
        ...(blogUrl.trim() && { blogUrl: blogUrl.trim() }),
        ...(instagramUrl.trim() && { instagramUrl: instagramUrl.trim() }),
        ...(websiteUrl.trim() && { websiteUrl: websiteUrl.trim() }),
        ...(mediaItems.length > 0 && { mediaItems }),
      };

      if (isEditMode) {
        await updateSpot(editData.slug, request);
        router.push(`/my-spots`);
      } else {
        const result = await createSpot(request);
        router.push(`/spot/${result.slug}`);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || (isEditMode ? "Spot 수정에 실패했습니다. 다시 시도해주세요." : "Spot 등록에 실패했습니다. 다시 시도해주세요.");
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-4">
      {/* 장소 이름 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">
          장소 이름 <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="예: 성수동 카페 123"
          className={cn(
            "w-full rounded-lg border px-4 py-3 text-sm focus:outline-none",
            errors.title ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
          )}
        />
        <div className="mt-1 flex justify-between text-xs">
          {errors.title && <span className="text-red-500">{errors.title}</span>}
          <span className="ml-auto text-gray-400">{title.length}/100</span>
        </div>
      </div>

      {/* 카테고리 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <CategorySelector value={category} onChange={setCategory} />
        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
      </div>

      {/* 주소 검색 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">
          주소 <span className="text-red-500">*</span>
        </label>
        <AddressSearch value={addressData} onChange={setAddressData} />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
      </div>

      {/* 설명 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="이 장소를 소개해주세요 (선택)"
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{description.length}/500</p>
      </div>

      {/* 사진 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">사진</label>
        <CreateFormPhotoUpload
          mediaItems={mediaItems}
          onMediaItemsChange={setMediaItems}
        />
        <p className="mt-1 text-xs text-gray-400">
          JPEG, PNG, WebP · 최대 10MB · 최대 5장
        </p>
      </div>

      {/* 태그 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">태그</label>
        <TagInput tags={tags} onChange={setTags} />
      </div>

      {/* 외부 링크 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-900">외부 링크</label>
        <div className="space-y-2">
          {[
            { label: "블로그", value: blogUrl, setter: setBlogUrl, placeholder: "https://blog.naver.com/..." },
            { label: "인스타그램", value: instagramUrl, setter: setInstagramUrl, placeholder: "https://instagram.com/..." },
            { label: "웹사이트", value: websiteUrl, setter: setWebsiteUrl, placeholder: "https://..." },
          ].map(({ label, value: val, setter, placeholder }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-gray-500">{label}</span>
              <input
                value={val}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors",
          isSubmitting ? "cursor-not-allowed bg-blue-400" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isEditMode ? "수정 중..." : "등록 중..."}
          </span>
        ) : (
          isEditMode ? "Spot 수정하기" : "Spot 등록하기"
        )}
      </button>
    </form>
  );
}

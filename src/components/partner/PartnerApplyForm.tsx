"use client";

import { useState, useCallback } from "react";
import { Search, Store, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchSpots, submitPartnerApplication } from "@/lib/api";
import type { PartnerTier, SpotDetailResponse } from "@/types";

interface FormState {
  spotId: string;
  spotTitle: string;
  businessName: string;
  contactPhone: string;
  contactEmail: string;
  benefitText: string;
  brandColor: string;
  tier: PartnerTier;
}

const initialForm: FormState = {
  spotId: "",
  spotTitle: "",
  businessName: "",
  contactPhone: "",
  contactEmail: "",
  benefitText: "",
  brandColor: "#3B82F6",
  tier: "BASIC",
};

interface ValidationErrors {
  spotId?: string;
  businessName?: string;
  contactPhone?: string;
  contactEmail?: string;
  benefitText?: string;
}

function validate(form: FormState): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.spotId) errors.spotId = "Spot을 선택해주세요";
  if (!form.businessName || form.businessName.length < 2 || form.businessName.length > 50) {
    errors.businessName = "사업자명은 2~50자로 입력해주세요";
  }
  if (!form.contactPhone || !/^0\d{1,2}-\d{3,4}-\d{4}$/.test(form.contactPhone)) {
    errors.contactPhone = "전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)";
  }
  if (!form.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
    errors.contactEmail = "이메일 형식이 올바르지 않습니다";
  }
  if (!form.benefitText || form.benefitText.length < 5 || form.benefitText.length > 100) {
    errors.benefitText = "혜택 설명은 5~100자로 입력해주세요";
  }
  return errors;
}

export default function PartnerApplyForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotDetailResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const result = await searchSpots({ keyword: searchQuery, page: 0, size: 10 });
      setSearchResults(result.content);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const selectSpot = useCallback((spot: SpotDetailResponse) => {
    setForm((prev) => ({ ...prev, spotId: spot.id, spotTitle: spot.title }));
    setSearchResults([]);
    setSearchQuery("");
    setErrors((prev) => ({ ...prev, spotId: undefined }));
  }, []);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitPartnerApplication({
        spotId: form.spotId,
        businessName: form.businessName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        benefitText: form.benefitText,
        brandColor: form.brandColor,
        tier: form.tier,
      });
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(result.message || "신청에 실패했습니다. 다시 시도해주세요.");
      }
    } catch {
      setSubmitError("신청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
        <h2 className="mb-2 text-lg font-bold text-gray-900">신청이 접수되었습니다</h2>
        <p className="text-sm text-gray-600">
          관리자가 확인 후 연락드리겠습니다. 승인 후 대시보드 링크를 전달받으실 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Spot 검색/선택 */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">매장 선택</legend>
        {form.spotId ? (
          <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{form.spotTitle}</span>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, spotId: "", spotTitle: "" }))}
              className="text-xs text-blue-600 hover:underline"
            >
              변경
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="매장 이름으로 검색"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                검색
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200">
                {searchResults.map((spot) => (
                  <li key={spot.id}>
                    <button
                      type="button"
                      onClick={() => selectSpot(spot)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <Store className="h-4 w-4 shrink-0 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{spot.title}</p>
                        <p className="text-xs text-gray-500">{spot.address}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.spotId && (
              <p className="mt-1 text-xs text-red-500" aria-live="polite">{errors.spotId}</p>
            )}
          </div>
        )}
      </fieldset>

      {/* 비즈니스 정보 */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">비즈니스 정보</legend>
        <div className="space-y-3">
          <div>
            <label htmlFor="businessName" className="mb-1 block text-xs font-medium text-gray-600">
              사업자명
            </label>
            <input
              id="businessName"
              type="text"
              value={form.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              placeholder="사업자명 입력"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.businessName && (
              <p className="mt-1 text-xs text-red-500" aria-live="polite">{errors.businessName}</p>
            )}
          </div>
          <div>
            <label htmlFor="contactPhone" className="mb-1 block text-xs font-medium text-gray-600">
              연락처
            </label>
            <input
              id="contactPhone"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
              placeholder="010-1234-5678"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.contactPhone && (
              <p className="mt-1 text-xs text-red-500" aria-live="polite">{errors.contactPhone}</p>
            )}
          </div>
          <div>
            <label htmlFor="contactEmail" className="mb-1 block text-xs font-medium text-gray-600">
              이메일
            </label>
            <input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              placeholder="partner@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-xs text-red-500" aria-live="polite">{errors.contactEmail}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* 혜택 정보 */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">혜택 정보</legend>
        <div className="space-y-3">
          <div>
            <label htmlFor="benefitText" className="mb-1 block text-xs font-medium text-gray-600">
              혜택 설명
            </label>
            <textarea
              id="benefitText"
              value={form.benefitText}
              onChange={(e) => updateField("benefitText", e.target.value)}
              placeholder="예: QR 스캔 시 아메리카노 10% 할인"
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-between">
              {errors.benefitText ? (
                <p className="text-xs text-red-500" aria-live="polite">{errors.benefitText}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">{form.benefitText.length}/100</span>
            </div>
          </div>
          <div>
            <label htmlFor="brandColor" className="mb-1 block text-xs font-medium text-gray-600">
              브랜드 색상
            </label>
            <div className="flex items-center gap-3">
              <input
                id="brandColor"
                type="color"
                value={form.brandColor}
                onChange={(e) => updateField("brandColor", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-gray-300"
              />
              <span className="text-sm text-gray-500">{form.brandColor}</span>
            </div>
          </div>
        </div>
      </fieldset>

      {/* 티어 선택 */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-gray-700">파트너 티어</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["BASIC", "PREMIUM"] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => updateField("tier", tier)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-colors",
                form.tier === tier
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <p className="text-sm font-bold text-gray-900">{tier === "BASIC" ? "Basic" : "Premium"}</p>
              <p className="mt-1 text-xs text-gray-500">
                {tier === "BASIC"
                  ? "기본 QR 코드 + 혜택 표시"
                  : "프리미엄 배치 + 우선 노출 + 분석 리포트"}
              </p>
            </button>
          ))}
        </div>
      </fieldset>

      {/* 제출 */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "제출 중..." : "파트너 신청하기"}
      </button>
    </div>
  );
}

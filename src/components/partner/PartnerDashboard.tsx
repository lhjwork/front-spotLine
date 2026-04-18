"use client";

import { useEffect, useState, useCallback } from "react";
import { ScanLine, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPartnerDashboard, fetchPartnerTrends } from "@/lib/api";
import type { PartnerDashboardData, PartnerDailyTrend } from "@/types";
import PartnerAnalyticsChart from "./PartnerAnalyticsChart";
import dynamic from "next/dynamic";

const QrCodeGenerator = dynamic(() => import("./QrCodeGenerator"), { ssr: false });

export interface PartnerDashboardProps {
  token: string;
}

type Period = "7d" | "30d" | "90d";

export default function PartnerDashboard({ token }: PartnerDashboardProps) {
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [trends, setTrends] = useState<PartnerDailyTrend[]>([]);
  const [period, setPeriod] = useState<Period>("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQr, setExpandedQr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const result = await fetchPartnerDashboard(token);
      if (cancelled) return;
      if (!result) {
        setError("대시보드 데이터를 불러올 수 없습니다. 링크를 확인해주세요.");
        setIsLoading(false);
        return;
      }
      setData(result);
      setTrends(result.dailyTrends);
      setIsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  const handlePeriodChange = useCallback(async (newPeriod: Period) => {
    setPeriod(newPeriod);
    const result = await fetchPartnerTrends(token, newPeriod);
    setTrends(result);
  }, [token]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-lg font-bold text-gray-900">접근할 수 없습니다</h2>
        <p className="text-sm text-gray-500">{error || "파트너 데이터를 찾을 수 없습니다."}</p>
      </div>
    );
  }

  const { summary } = data;
  const weeklyChangePositive = summary.weeklyChange >= 0;

  const statCards = [
    { label: "총 스캔", value: summary.totalScans.toLocaleString(), icon: ScanLine, color: "text-blue-600" },
    { label: "고유 방문자", value: summary.uniqueVisitors.toLocaleString(), icon: Users, color: "text-green-600" },
    { label: "전환율", value: `${summary.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: "text-purple-600" },
    {
      label: "주간 변화",
      value: `${weeklyChangePositive ? "+" : ""}${summary.weeklyChange.toFixed(1)}%`,
      icon: weeklyChangePositive ? ArrowUpRight : ArrowDownRight,
      color: weeklyChangePositive ? "text-green-600" : "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{data.businessName}</h1>
        <p className="text-sm text-gray-500">{data.spotTitle}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <card.icon className={cn("h-4 w-4", card.color)} />
              <span className="text-xs text-gray-500">{card.label}</span>
            </div>
            <p className={cn("mt-2 text-xl font-bold", card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Period tabs */}
      <div className="flex gap-2">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handlePeriodChange(p)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              period === p
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            {p === "7d" ? "7일" : p === "30d" ? "30일" : "90일"}
          </button>
        ))}
      </div>

      {/* Chart */}
      <PartnerAnalyticsChart data={trends} brandColor={data.brandColor} />

      {/* QR codes */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">QR 코드 관리</h2>
        {data.qrCodes.map((qr) => (
          <div key={qr.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{qr.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  스캔 {qr.scans.toLocaleString()}회 · {qr.isActive ? "활성" : "비활성"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedQr(expandedQr === qr.id ? null : qr.id)}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                {expandedQr === qr.id ? "닫기" : "QR 다운로드"}
              </button>
            </div>
            {expandedQr === qr.id && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <QrCodeGenerator
                  qrUrl={qr.qrUrl}
                  label={qr.label}
                  brandColor={data.brandColor}
                  size={200}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

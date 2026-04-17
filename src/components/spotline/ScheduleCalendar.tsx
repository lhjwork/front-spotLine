"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  format,
  isSameDay,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { MySpotLine } from "@/types";

export interface ScheduleCalendarProps {
  spotLines: MySpotLine[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function ScheduleCalendar({
  spotLines,
  selectedDate,
  onDateSelect,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // 일정 있는 날짜 Set
  const scheduledDates = new Set(
    spotLines
      .filter((s) => s.scheduledDate && s.status === "scheduled")
      .map((s) => s.scheduledDate!)
  );

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (selectedDate === dateStr) {
      onDateSelect(null); // 토글 해제
    } else {
      onDateSelect(dateStr);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((day, i) => (
          <span
            key={day}
            className={cn(
              "text-xs font-medium",
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            )}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Empty cells for start offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}

        {days.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const isSelected = selectedDate === dateStr;
          const hasSchedule = scheduledDates.has(dateStr);
          const today = isToday(date);

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={cn(
                "relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm transition-colors",
                isSelected
                  ? "bg-purple-600 text-white"
                  : today
                    ? "ring-1 ring-purple-300 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {date.getDate()}
              {hasSchedule && (
                <span
                  className={cn(
                    "absolute bottom-0.5 h-1 w-1 rounded-full",
                    isSelected ? "bg-white" : "bg-purple-500"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

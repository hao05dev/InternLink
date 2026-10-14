"use client";

import { StatePill } from "./journal-state-pill";
import { dateLabel, fieldClass, todayVN } from "../../types";
import type { Journal, Overview, WeekSummary } from "../../types";

interface JournalDayNavBarProps {
  overview: Overview;
  week?: WeekSummary;
  date: string;
  days: Journal[];
  dates: string[];
  onSelectDate: (d: string) => void;
}

export function JournalDayNavBar({
  overview,
  week,
  date,
  days,
  dates,
  onSelectDate,
}: JournalDayNavBarProps) {
  const p = overview.placement;

  return (
    <aside className="space-y-3 rounded-xl border bg-white p-4 self-start">
      <label className="block text-sm font-semibold">
        Tuần thực tập
        <select
          className={`${fieldClass} mt-2`}
          value={week?.number || 1}
          onChange={(e) => {
            const selectedWeek = overview.weeks.find(
              (w) => w.number === Number(e.target.value),
            );
            if (selectedWeek) onSelectDate(selectedWeek.start);
          }}
        >
          {overview.weeks.map((w) => (
            <option key={w.number} value={w.number}>
              Tuần {w.number} · {dateLabel(w.start)}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-semibold">
        Chọn ngày
        <input
          className={`${fieldClass} mt-2`}
          type="date"
          min={p.startDate}
          max={p.endDate}
          value={date}
          onChange={(e) => {
            if (e.target.value >= p.startDate && e.target.value <= p.endDate) {
              onSelectDate(e.target.value);
            }
          }}
        />
      </label>

      <div className="space-y-2">
        {dates.map((day) => {
          const entry = days.find((j) => j.workDate === day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-pressed={day === date}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                day === date
                  ? "border-sky-400 bg-sky-50"
                  : "border-slate-100 hover:bg-slate-50"
              }`}
            >
              <span className="mb-1 block text-sm font-semibold">
                {new Date(`${day}T12:00:00`).toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
              {entry ? (
                <StatePill status={entry.status} />
              ) : (
                <span className="text-xs text-slate-500">
                  {day > todayVN() ? "Chưa đến ngày" : "Chưa ghi nhận"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        Ngày chưa có nhật ký chưa được xác định là vắng. Trong chế độ theo dõi học thuật,
        nhật ký ngày đã gửi sẽ được tổng hợp vào báo cáo tuần.
      </p>
    </aside>
  );
}

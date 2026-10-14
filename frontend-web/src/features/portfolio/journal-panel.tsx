"use client";

import { useCallback, useState } from "react";
import { PortfolioMediaScope } from "./media-upload-scope";
import { SafeRichText } from "./rich-editor";
import { todayVN } from "./types";
import type { Journal, Overview } from "./types";
import { StatePill } from "./components/journal/journal-state-pill";
import { JournalDayNavBar } from "./components/journal/journal-day-nav-bar";
import { JournalEditor } from "./components/journal/journal-editor";

export { StatePill };

export default function JournalPanel({
  overview,
  days,
  userId,
  onRefresh,
}: {
  overview: Overview;
  days: Journal[];
  userId: string;
  onRefresh: () => Promise<void>;
}) {
  const p = overview.placement;
  const initialDate =
    todayVN() < p.startDate
      ? p.startDate
      : todayVN() > p.endDate
        ? p.endDate
        : todayVN();

  const [date, setDate] = useState(initialDate);
  const [uploadCount, setUploadCount] = useState(0);

  const uploadState = useCallback((uploading: boolean) => {
    setUploadCount((n) => Math.max(0, n + (uploading ? 1 : -1)));
  }, []);

  const week =
    overview.weeks.find((w) => date >= w.start && date <= w.end) ||
    overview.weeks[0];
  const selected = days.find((day) => day.workDate === date);

  const dates: string[] = [];
  if (week) {
    for (
      let cursor = new Date(`${week.start}T12:00:00`);
      cursor <= new Date(`${week.end}T12:00:00`);
      cursor.setDate(cursor.getDate() + 1)
    ) {
      dates.push(
        `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`,
      );
    }
  }

  const plan = overview.forms
    .find((f) => f.kind === "M01")
    ?.content?.weeks?.find((row) => row.week === week?.number);

  return (
    <PortfolioMediaScope.Provider
      value={{
        purpose: "PORTFOLIO_IMAGE",
        contextId: p.id,
        scope: "DAILY",
        uploading: uploadCount > 0,
        onUploadStateChange: uploadState,
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <JournalDayNavBar
          overview={overview}
          week={week}
          date={date}
          days={days}
          dates={dates}
          onSelectDate={setDate}
        />

        <div className="space-y-4">
          {plan?.tasks && (
            <details className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-sky-900">
                Công việc được giao trong tuần {week?.number}
              </summary>
              <SafeRichText html={plan.tasks} className="mt-3" />
            </details>
          )}

          <JournalEditor
            key={`${p.id}:${date}:${selected?.status || "DRAFT"}`}
            date={date}
            entry={selected}
            overview={overview}
            userId={userId}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </PortfolioMediaScope.Provider>
  );
}

"use client";

import { useState } from "react";
import RichEditor, { SafeRichText } from "../../rich-editor";
import { fieldClass } from "../../types";
import type { FormContent, WeekRow } from "../../types";
import { plain } from "./form-utils";

export function WeeklyForm({
  content,
  editable,
  following,
  patch,
}: {
  content: FormContent;
  editable: boolean;
  following: boolean;
  patch: (v: Partial<FormContent>) => void;
}) {
  const [selected, setSelected] = useState(1);
  const row = content.weeks?.find((r) => r.week === selected);

  function update(change: Partial<WeekRow>) {
    patch({
      weeks: content.weeks?.map((r) =>
        r.week === selected ? { ...r, ...change } : r,
      ),
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
      <div className="flex flex-wrap gap-2 self-start rounded-xl border bg-white p-3 lg:flex-col">
        {content.weeks?.map((r) => (
          <button
            key={r.week}
            type="button"
            onClick={() => setSelected(r.week)}
            aria-pressed={selected === r.week}
            className={`rounded-lg px-3 py-2 text-left text-sm ${
              selected === r.week
                ? "bg-sky-100 font-semibold text-sky-900"
                : "hover:bg-slate-50"
            }`}
          >
            Tuần {r.week} {plain(following ? r.comment : r.tasks) ? "✓" : ""}
          </button>
        ))}
      </div>
      <div className="space-y-4 rounded-xl border bg-white p-5">
        {row ? (
          <>
            <h3 className="font-semibold">Tuần {selected}</h3>
            {following && (
              <p className="text-sm text-slate-500">
                Công việc lấy từ M-TT-01; số buổi và giờ lấy từ nhật ký ngày đã
                xác nhận khi lưu phiếu.
              </p>
            )}
            {editable && !following ? (
              <RichEditor
                label="Nội dung công việc được giao"
                value={row.tasks}
                onChange={(tasks) => update({ tasks })}
                compact
              />
            ) : (
              <div>
                <h4 className="text-sm font-semibold">Công việc được giao</h4>
                <SafeRichText
                  html={row.tasks || "<p>Chưa lập kế hoạch giao việc.</p>"}
                />
              </div>
            )}
            {following &&
              (editable ? (
                <RichEditor
                  label="Nhận xét chính thức của cán bộ hướng dẫn"
                  value={row.comment}
                  onChange={(comment) => update({ comment })}
                  compact
                />
              ) : (
                <div>
                  <h4 className="text-sm font-semibold">
                    Nhận xét cán bộ hướng dẫn
                  </h4>
                  <SafeRichText html={row.comment} />
                </div>
              ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Số buổi {following ? "đã xác nhận" : "dự kiến"}
                <input
                  type="number"
                  min="0"
                  max="14"
                  className={`${fieldClass} mt-1`}
                  value={row.sessions}
                  disabled={!editable || following}
                  onChange={(e) => update({ sessions: Number(e.target.value) })}
                />
              </label>
              <label className="text-sm">
                Số giờ {following ? "đã xác nhận" : "dự kiến"}
                <input
                  type="number"
                  min="0"
                  max="168"
                  step="0.25"
                  className={`${fieldClass} mt-1`}
                  value={row.hours}
                  disabled={!editable || following}
                  onChange={(e) => update({ hours: Number(e.target.value) })}
                />
              </label>
            </div>
          </>
        ) : (
          <p>Chưa có dữ liệu tuần.</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import RichEditor from "../../rich-editor";
import { SECTION_TITLES, fieldClass } from "../../types";
import type { FormContent, Overview } from "../../types";
import { escape, plain } from "./form-utils";

export function ReportEditor({
  content,
  editable,
  patch,
  overview,
}: {
  content: FormContent;
  editable: boolean;
  patch: (v: Partial<FormContent>) => void;
  overview: Overview;
}) {
  const [section, setSection] = useState("thanks");
  const [week, setWeek] = useState(1);
  const sections = content.sections || {};
  const source = overview.weeks.find((w) => w.number === week);
  const p = overview.placement;

  function insertWeek() {
    if (!source) return;
    const text =
      section === "outcomes"
        ? source.results
        : section === "method"
          ? source.reflection
          : source.tasks;
    patch({
      sections: {
        ...sections,
        [section]:
          (sections[section] || "") +
          `<p><strong>Tuần ${week}</strong></p>` +
          text
            .split("\n")
            .map((line) => `<p>${escape(line)}</p>`)
            .join(""),
      },
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="space-y-3 rounded-xl border bg-white p-4 self-start">
        <h3 className="text-sm font-semibold">Mục lục báo cáo</h3>
        <p className="text-xs text-slate-500">
          Bìa và thông tin sinh viên được điền tự động. Phiếu chấm M-TT-04 được
          chèn với ô điểm trống.
        </p>
        <div className="space-y-1">
          {Object.entries(SECTION_TITLES).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={section === key}
              onClick={() => setSection(key)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                section === key
                  ? "bg-sky-100 font-semibold text-sky-900"
                  : "hover:bg-slate-50"
              }`}
            >
              {label} {plain(sections[key] || "") ? "✓" : ""}
            </button>
          ))}
        </div>
        <p className="border-t pt-3 text-xs text-slate-500">
          Đã viết{" "}
          {
            Object.keys(SECTION_TITLES).filter((key) =>
              plain(sections[key] || ""),
            ).length
          }
          /5 mục
        </p>
        <label className="block text-xs">
          Khổ giấy
          <select
            className={`${fieldClass} mt-1`}
            disabled={!editable}
            value={content.paperSize || "LETTER"}
            onChange={(e) =>
              patch({ paperSize: e.target.value as "A4" | "LETTER" })
            }
          >
            <option value="LETTER">Letter (file tham khảo)</option>
            <option value="A4">A4</option>
          </select>
        </label>
      </aside>
      <div className="space-y-4 rounded-xl border bg-white p-4 sm:p-6">
        <details>
          <summary className="cursor-pointer text-sm font-semibold">
            Thông tin trang bìa
          </summary>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              {p.studentName} · {p.studentCode}
            </p>
            <p>{p.companyName}</p>
            <p>
              CBHD: {p.mentorName} · GVHD: {p.lecturerName}
            </p>
            <label className="block">
              Tên học phần
              <input
                className={`${fieldClass} mt-1`}
                value={content.courseName || ""}
                disabled={!editable}
                onChange={(e) => patch({ courseName: e.target.value })}
                placeholder="Thực tập doanh nghiệp"
              />
            </label>
          </div>
        </details>
        {editable && (
          <details className="rounded-lg bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-medium">
              Đưa nội dung từ nhật ký vào mục đang viết
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              <select
                aria-label="Tuần cần đưa vào báo cáo"
                className={`${fieldClass} max-w-44`}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
              >
                {overview.weeks.map((w) => (
                  <option key={w.number} value={w.number}>
                    Tuần {w.number}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                disabled={!source?.confirmedDays && !source?.submittedDays}
                onClick={insertWeek}
              >
                Chèn nội dung đã ghi nhận
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Bạn có thể biên tập lại nội dung sau khi chèn.
            </p>
          </details>
        )}
        <RichEditor
          key={section}
          label={SECTION_TITLES[section]}
          value={sections[section] || ""}
          onChange={(html) =>
            patch({ sections: { ...sections, [section]: html } })
          }
          disabled={!editable}
        />
      </div>
    </div>
  );
}

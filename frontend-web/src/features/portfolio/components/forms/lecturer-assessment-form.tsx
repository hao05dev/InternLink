"use client";

import RichEditor from "../../rich-editor";
import { fieldClass } from "../../types";
import type { FormContent, Overview } from "../../types";

export function AcademicScores({
  content,
  editable,
  patch,
  overview,
  role,
}: {
  content: FormContent;
  editable: boolean;
  patch: (v: Partial<FormContent>) => void;
  overview: Overview;
  role: string;
}) {
  const components = overview.placement.components.filter(
    (c) => c.assessorRole === role,
  );

  function update(code: string, criterion: string | null, value: string) {
    const previous = content.academicScores?.[code] || {};
    patch({
      academicScores: {
        ...content.academicScores,
        [code]: criterion
          ? {
              ...previous,
              criteriaScores: {
                ...previous.criteriaScores,
                [criterion]: value,
              },
            }
          : { ...previous, score: value },
      },
    });
  }

  return (
    <section className="space-y-4 rounded-xl border bg-white p-5">
      <h3 className="font-semibold">Điểm học phần theo phương án được duyệt</h3>
      <p className="text-sm text-slate-500">
        {overview.placement.schemeReference ||
          "Chưa được gán phương án đánh giá."}{" "}
        Điểm được ghi nhận khi hoàn thành phiếu và khóa theo quy trình chấm điểm.
      </p>
      {components.length === 0 && (
        <p className="text-sm text-slate-500">
          Chưa có thành phần điểm được giao.
        </p>
      )}
      {components.map((c) => (
        <fieldset key={c.code} className="space-y-3 rounded-lg border p-4">
          <legend className="px-1 text-sm font-semibold">
            {c.name} · {Math.round(c.weight * 100)}%
          </legend>
          {c.criteria?.length ? (
            c.criteria.map((criterion) => (
              <label
                key={criterion.code}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span>
                  {criterion.name} · {Math.round(criterion.weight * 100)}%
                </span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className={`${fieldClass} max-w-28`}
                  value={
                    content.academicScores?.[c.code]?.criteriaScores?.[
                      criterion.code
                    ] ?? ""
                  }
                  disabled={!editable}
                  onChange={(e) =>
                    update(c.code, criterion.code, e.target.value)
                  }
                />
              </label>
            ))
          ) : (
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Điểm thành phần (0–10)</span>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                className={`${fieldClass} max-w-28`}
                value={
                  content.academicScores?.[c.code]?.score ??
                  content.academicTotals?.[c.code] ??
                  ""
                }
                disabled={!editable}
                onChange={(e) => update(c.code, null, e.target.value)}
              />
            </label>
          )}
          {content.academicTotals?.[c.code] !== undefined && (
            <p className="text-sm font-semibold text-emerald-800">
              Điểm đã ghi nhận: {content.academicTotals[c.code]}/10
            </p>
          )}
        </fieldset>
      ))}
    </section>
  );
}

export function LecturerAssessment({
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
  return (
    <div className="space-y-4">
      <AcademicScores
        content={content}
        editable={editable}
        patch={patch}
        overview={overview}
        role="LECTURER"
      />
      <div className="rounded-xl border bg-white p-5">
        <RichEditor
          label="Nhận xét báo cáo của giảng viên"
          value={content.comment || ""}
          onChange={(comment) => patch({ comment })}
          disabled={!editable}
          compact
        />
      </div>
    </div>
  );
}

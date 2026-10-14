"use client";

import RichEditor from "../../rich-editor";
import { CRITERIA, TRAINING, fieldClass } from "../../types";
import type { FormContent } from "../../types";

export function CompanyAssessment({
  content,
  editable,
  patch,
}: {
  content: FormContent;
  editable: boolean;
  patch: (v: Partial<FormContent>) => void;
}) {
  const scores = content.scores || {};
  const applicable = CRITERIA.map((_, i) => i).filter(
    (i) => !content.remote || i >= 3,
  );
  const total = applicable.reduce(
    (sum, i) => sum + Number(scores[String(i)] || 0),
    0,
  );

  return (
    <div className="space-y-5 rounded-xl border bg-white p-5">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!content.remote}
          disabled={!editable}
          onChange={(e) => patch({ remote: e.target.checked })}
        />
        Thực tập online: không chấm ba tiêu chí I.1–I.3 theo mẫu
      </label>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 text-left">Nội dung đánh giá</th>
              <th className="w-32 p-3">Điểm 1–10</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((label, i) => (
              <tr key={label} className="border-t">
                <td className="p-3">{label}</td>
                <td className="p-2">
                  {content.remote && i < 3 ? (
                    <span className="text-xs text-slate-500">
                      Không áp dụng
                    </span>
                  ) : (
                    <input
                      type="number"
                      aria-label={label}
                      min="1"
                      max="10"
                      step="0.5"
                      value={scores[String(i)] ?? ""}
                      disabled={!editable}
                      onChange={(e) =>
                        patch({
                          scores: { ...scores, [String(i)]: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-sky-50 font-semibold">
              <td className="p-3">Tổng các tiêu chí áp dụng</td>
              <td className="p-3">
                {total} / {applicable.length * 10}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Điểm học phần được tổng hợp theo phương án khoa phê duyệt. Tổng trên
        phiếu là điểm các tiêu chí áp dụng.
      </p>
      <RichEditor
        label="Nhận xét khác về sinh viên"
        value={content.comment || ""}
        onChange={(comment) => patch({ comment })}
        compact
        disabled={!editable}
      />
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">
          Đánh giá về chương trình đào tạo
        </legend>
        {TRAINING.map((label) => (
          <label key={label} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={!editable}
              checked={content.trainingFeedback?.includes(label) || false}
              onChange={(e) =>
                patch({
                  trainingFeedback: e.target.checked
                    ? [...(content.trainingFeedback || []), label]
                    : content.trainingFeedback?.filter(
                        (item) => item !== label,
                      ),
                })
              }
            />
            {label}
          </label>
        ))}
      </fieldset>
      <RichEditor
        label="Đề xuất góp ý về chương trình đào tạo"
        value={content.suggestions || ""}
        onChange={(suggestions) => patch({ suggestions })}
        compact
        disabled={!editable}
      />
    </div>
  );
}

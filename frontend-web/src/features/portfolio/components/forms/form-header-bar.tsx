"use client";

import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatePill } from "../journal/journal-state-pill";
import { TemplateQuickDownload } from "@/features/organization/components/templates/template-quick-download";
import { FORM_NAMES } from "../../types";
import type { FormView } from "../../types";

interface FormHeaderBarProps {
  form: FormView;
  current: FormView;
  busy: boolean;
  draftSaving: boolean;
  uploadCount: number;
  termId?: string;
  onPreview: () => void;
  onDownload: () => void;
}

export function FormHeaderBar({
  form,
  current,
  busy,
  draftSaving,
  uploadCount,
  termId,
  onPreview,
  onDownload,
}: FormHeaderBarProps) {
  const isActionDisabled = busy || draftSaving || uploadCount > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5">
      <div>
        <h2 className="font-bold text-slate-900">
          {FORM_NAMES[form.kind]}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatePill status={current.status} />
          <span className="text-xs text-slate-500">
            {["M02", "M03", "M04"].includes(form.kind)
              ? current.published
                ? "Đã được phép công bố"
                : "Chưa công bố"
              : "Hồ sơ thực tập"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TemplateQuickDownload
          reportType={form.kind === "M05" ? "M05_REPORT_GUIDELINE" : form.kind}
          termId={termId}
          label={`Tải mẫu gốc ${form.kind} (.doc)`}
          variant="pill"
        />

        {current.canRead && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={isActionDisabled}
              onClick={onPreview}
            >
              <Eye className="mr-2 h-4 w-4" />
              Xem trước DOCX
            </Button>
            <Button
              size="sm"
              disabled={isActionDisabled}
              onClick={onDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Tải DOCX
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

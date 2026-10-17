"use client";

import { RefObject } from "react";
import { Download, FileCheck2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { portfolioApi, downloadFile } from "../../api";
import type { FormView, Overview } from "../../types";

interface FormRevisionsCardProps {
  form: FormView;
  current: FormView;
  overview: Overview;
  busy: boolean;
  signedInput: RefObject<HTMLInputElement>;
  onUpload: (file?: File) => Promise<void>;
  onExportDocx: (revisionId?: string, showPreview?: boolean) => Promise<void>;
}

export function FormRevisionsCard({
  form,
  current,
  overview,
  busy,
  signedInput,
  onUpload,
  onExportDocx,
}: FormRevisionsCardProps) {
  const p = overview.placement;
  const isTermClosed = p.termStatus === "CLOSED";
  const offlineOriginal =
    !p.hasMentor &&
    overview.canConfirmJournal &&
    ["M01", "M02", "M03"].includes(form.kind);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="space-y-3 rounded-xl border bg-white p-5">
        <h3 className="flex items-center gap-2 font-semibold">
          <FileCheck2 className="h-4 w-4" />
          Bản đã ký
        </h3>
        <p className="text-xs text-slate-500">
          Lưu bản scan PDF/PNG/JPEG, tối đa 10 MB. Mỗi bản ký gắn với phiên bản nội dung tương ứng.
        </p>
        {!isTermClosed &&
          !current.published &&
          (offlineOriginal ||
            (current.canEdit &&
              ["COMPLETED", "SUBMITTED", "APPROVED"].includes(current.status))) && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => signedInput.current?.click()}
              >
                {offlineOriginal
                  ? "Tiếp nhận phiếu gốc của cơ quan"
                  : "Tải lên bản đã ký"}
              </Button>
              <input
                ref={signedInput}
                type="file"
                className="hidden"
                accept="application/pdf,image/png,image/jpeg"
                aria-label="Tải bản đã ký"
                onChange={(e) => {
                  void onUpload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </>
          )}
        {form.signedFiles.length === 0 && (
          <p className="text-sm text-slate-500">Chưa có bản ký được tải lên.</p>
        )}
        <ul className="space-y-2">
          {form.signedFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between rounded-lg border p-2 text-sm"
            >
              <span className="truncate pr-2">{file.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  void downloadFile(
                    portfolioApi.signedUrl(p.id, form.kind, file.id),
                    file.name,
                  )
                }
              >
                <Download className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 rounded-xl border bg-white p-5">
        <h3 className="flex items-center gap-2 font-semibold">
          <History className="h-4 w-4" />
          Lịch sử phiên bản
        </h3>
        <p className="text-xs text-slate-500">
          Ghi nhận mọi lần lưu nháp, gửi báo cáo hoặc đánh giá.
        </p>
        <ul className="space-y-2">
          {form.revisions.map((rev) => (
            <li
              key={rev.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-xs"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {rev.action} · {rev.actor}
                </p>
                <p className="text-slate-500">
                  {new Date(rev.createdAt).toLocaleString("vi-VN")}
                </p>
                {rev.note && <p className="italic text-slate-600">{rev.note}</p>}
              </div>
              {rev.downloadable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void onExportDocx(rev.id)}
                >
                  <Download className="mr-1 h-3.5 w-3.5" />
                  DOCX
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

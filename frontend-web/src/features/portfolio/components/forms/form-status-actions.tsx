"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "../../types";
import type { FormView, Overview } from "../../types";

interface FormEditActionsBarProps {
  formKind: string;
  message?: string;
  busy: boolean;
  draftSaving: boolean;
  uploadCount: number;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export function FormEditActionsBar({
  formKind,
  message,
  busy,
  draftSaving,
  uploadCount,
  onSaveDraft,
  onSubmit,
}: FormEditActionsBarProps) {
  const isSaveDisabled = busy || draftSaving || uploadCount > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
      <span role="status" className="text-xs text-slate-500">
        {message || "Nội dung tự lưu khi bạn nhập"}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={isSaveDisabled}
          onClick={onSaveDraft}
        >
          Lưu nháp
        </Button>
        <Button
          isLoading={busy}
          disabled={draftSaving || uploadCount > 0}
          onClick={onSubmit}
        >
          {formKind === "M05" ? "Gửi báo cáo cho giảng viên" : "Hoàn thành phiếu"}
        </Button>
      </div>
    </div>
  );
}

interface FormReviewCardProps {
  busy: boolean;
  onAction: (name: string, noteText: string) => Promise<void>;
}

export function FormReviewCard({ busy, onAction }: FormReviewCardProps) {
  const [note, setNote] = useState("");

  return (
    <div className="space-y-3 rounded-xl border bg-white p-5">
      <label className="block text-sm font-semibold">
        Nhận xét báo cáo
        <textarea
          className={`${fieldClass} mt-2`}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập nhận xét hoặc yêu cầu chỉnh sửa..."
        />
      </label>
      <div className="flex gap-2">
        <Button isLoading={busy} onClick={() => void onAction("APPROVE", note)}>
          Duyệt báo cáo
        </Button>
        <Button
          variant="outline"
          disabled={busy || !note.trim()}
          onClick={() => void onAction("REVISION_REQUIRED", note)}
        >
          Yêu cầu chỉnh sửa
        </Button>
      </div>
    </div>
  );
}

interface FormReopenCardProps {
  busy: boolean;
  onAction: (name: string, noteText: string) => Promise<void>;
}

export function FormReopenCard({ busy, onAction }: FormReopenCardProps) {
  const [note, setNote] = useState("");

  return (
    <details className="rounded-xl border bg-white p-4">
      <summary className="cursor-pointer text-sm font-medium">
        Mở lại phiếu để chỉnh sửa
      </summary>
      <label className="mt-3 block text-sm">
        Lý do mở lại
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={fieldClass}
          placeholder="Nhập lý do cần mở lại bản nháp..."
        />
      </label>
      <Button
        className="mt-2"
        variant="outline"
        disabled={busy || !note.trim()}
        onClick={() => void onAction("REOPEN", note)}
      >
        Mở lại bản nháp
      </Button>
    </details>
  );
}

interface FormPublishCardProps {
  current: FormView;
  busy: boolean;
  onTogglePublish: () => void;
}

export function FormPublishCard({
  current,
  busy,
  onTogglePublish,
}: FormPublishCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
      <p className="text-sm">
        Quyền công bố cho sinh viên do Ban quản lý thực tập quyết định.
      </p>
      <Button disabled={busy} onClick={onTogglePublish}>
        {current.published ? "Thu hồi công bố" : "Cho phép sinh viên xem"}
      </Button>
    </div>
  );
}

"use client";

import { RefObject } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormPreviewDialogProps {
  open: boolean;
  previewNode: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export function FormPreviewDialog({
  open,
  previewNode,
  onClose,
}: FormPreviewDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-semibold text-slate-900">
            Bản xem trước DOCX
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div
          ref={previewNode}
          className="mt-4 flex-1 overflow-auto rounded-lg border bg-slate-50 p-4 text-xs"
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "../../types";
import type { Journal } from "../../types";

interface JournalReviewPanelProps {
  entry: Journal;
  busy: boolean;
  onReview: (decision: string, note: string) => Promise<void>;
}

export function JournalReviewPanel({
  entry,
  busy,
  onReview,
}: JournalReviewPanelProps) {
  const [reviewNote, setReviewNote] = useState("");

  return (
    <div className="space-y-3 border-t pt-4">
      <label className="block text-sm font-semibold">
        Phản hồi cho sinh viên
        <textarea
          rows={3}
          className={`${fieldClass} mt-1`}
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder="Nội dung cần bổ sung hoặc phản hồi về ngày thực tập."
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {entry.status === "SUBMITTED" && (
          <Button
            isLoading={busy}
            onClick={() => void onReview("CONFIRMED", reviewNote)}
          >
            Xác nhận nhật ký và tham gia
          </Button>
        )}
        <Button
          variant="outline"
          disabled={busy || !reviewNote.trim()}
          onClick={() => void onReview("REVISION_REQUIRED", reviewNote)}
        >
          Yêu cầu bổ sung
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { PortfolioMediaScope } from "../../media-upload-scope";
import RichEditor, { SafeRichText } from "../../rich-editor";
import { errorText, portfolioApi } from "../../api";
import { useDraft } from "../../use-draft";
import { dateLabel, fieldClass, todayVN } from "../../types";
import type { Journal, JournalInput, Overview } from "../../types";
import { StatePill, VerificationSourceBadge } from "./journal-state-pill";
import { JournalAttendanceFields } from "./journal-attendance-fields";
import { JournalReviewPanel } from "./journal-review-panel";

export function JournalEditor({
  date,
  entry,
  overview,
  userId,
  onRefresh,
}: {
  date: string;
  entry?: Journal;
  overview: Overview;
  userId: string;
  onRefresh: () => Promise<void>;
}) {
  const uploading = useContext(PortfolioMediaScope)?.uploading;
  const p = overview.placement;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isTermClosed = p.termStatus === "CLOSED";
  const editable =
    !isTermClosed &&
    overview.canWriteJournal &&
    p.status === "ACTIVE" &&
    date <= todayVN() &&
    (!entry || ["DRAFT", "REVISION_REQUIRED"].includes(entry.status));

  const initial: JournalInput = entry
    ? {
        attendance: entry.attendance,
        startTime: entry.startTime,
        endTime: entry.endTime,
        breakMinutes: entry.breakMinutes,
        sessions: entry.sessions,
        tasks: entry.tasks,
        results: entry.results,
        reflection: entry.reflection,
        evidence: entry.evidence,
      }
    : {
        attendance: "PRESENT",
        startTime: "08:00",
        endTime: "17:00",
        breakMinutes: 60,
        sessions: 2,
        tasks: "",
        results: "",
        reflection: "",
        evidence: "",
      };

  const save = useCallback(
    async (value: JournalInput, version: number | null) => {
      const result = (await portfolioApi.saveDay(p.id, date, value, version)).data!;
      await onRefresh().catch(() => undefined);
      return result;
    },
    [p.id, date, onRefresh],
  );

  const draft = useDraft(
    `internlink:journal:${userId}:${p.id}:${date}`,
    initial,
    entry?.version ?? null,
    editable && !busy && !uploading,
    save,
  );

  const value = draft.value;
  const working = ["PRESENT", "REMOTE"].includes(value.attendance);
  const update = (patch: Partial<JournalInput>) => draft.change({ ...value, ...patch });

  async function submit() {
    if (uploading) {
      setError("Chờ ảnh tải xong trước khi gửi nhật ký.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await draft.flush();
      await portfolioApi.saveDay(p.id, date, draft.value, saved.version, true);
      await onRefresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleReview(decision: string, note: string) {
    if (!entry) return;
    setBusy(true);
    setError("");
    try {
      await portfolioApi.reviewDay(p.id, date, decision, note, entry.version);
      await onRefresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5 rounded-xl border bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Nhật ký ngày {dateLabel(date)}
          </h2>
          <p className="text-sm text-slate-500">
            Ghi lại công việc, kết quả và tình trạng tham gia trong ngày.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VerificationSourceBadge source={entry?.verificationSource} />
          <StatePill status={entry?.status || "DRAFT"} />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {draft.recovery && editable && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-3 text-sm">
          <span>Có bản nháp chưa đồng bộ trên thiết bị.</span>
          <Button size="sm" onClick={draft.recovery}>Khôi phục</Button>
          <Button size="sm" variant="ghost" onClick={draft.discardRecovery}>Bỏ bản dự phòng</Button>
        </div>
      )}

      {!entry && !overview.canWriteJournal ? (
        <p className="py-8 text-center text-slate-500">
          Sinh viên chưa ghi nhật ký cho ngày này.
        </p>
      ) : (
        <>
          <JournalAttendanceFields
            value={value}
            editable={editable}
            busy={busy}
            working={working}
            onUpdate={update}
          />

          {editable ? (
            <>
              <RichEditor
                label="Công việc đã làm trong ngày"
                value={value.tasks}
                onChange={(tasks) => update({ tasks })}
                compact
                disabled={busy}
              />
              <RichEditor
                label="Kết quả và tiến độ đạt được"
                value={value.results}
                onChange={(results) => update({ results })}
                compact
                disabled={busy}
              />
              <RichEditor
                label={working ? "Khó khăn, bài học và nội dung cần hỗ trợ" : "Lý do nghỉ/vắng và ghi chú"}
                value={value.reflection}
                onChange={(reflection) => update({ reflection })}
                compact
                disabled={busy}
              />
              <label className="block text-sm font-semibold">
                Liên kết minh chứng
                <textarea
                  rows={2}
                  className={`${fieldClass} mt-1`}
                  value={value.evidence}
                  onChange={(e) => update({ evidence: e.target.value })}
                  disabled={busy}
                  placeholder="Liên kết sản phẩm, nhiệm vụ hoặc tài liệu; có thể chèn ảnh trong nội dung trên."
                />
              </label>
            </>
          ) : (
            <div className="space-y-5">
              {[
                ["Công việc đã làm", value.tasks],
                ["Kết quả đạt được", value.results],
                ["Bài học và ghi chú", value.reflection],
              ].map(([label, html]) => (
                <div key={label}>
                  <h3 className="mb-2 text-sm font-semibold">{label}</h3>
                  <SafeRichText html={html || "<p>Chưa có nội dung.</p>"} />
                </div>
              ))}
              {value.evidence && (
                <p className="whitespace-pre-wrap break-words text-sm">
                  Minh chứng: {value.evidence}
                </p>
              )}
            </div>
          )}

          {entry?.reviewNote && (
            <div className="rounded-lg bg-sky-50 p-3 text-sm">
              <strong>Phản hồi về nhật ký:</strong>
              <p className="whitespace-pre-wrap">{entry.reviewNote}</p>
              {entry.reviewer && (
                <p className="mt-1 text-xs text-slate-500">{entry.reviewer}</p>
              )}
            </div>
          )}

          {editable && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <span role="status" className="text-xs text-slate-500">
                {draft.message || "Bản nháp tự lưu khi bạn nhập nội dung"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={busy || draft.saving || uploading}
                  onClick={() => void draft.flush().catch((e) => setError(errorText(e)))}
                >
                  Lưu nháp
                </Button>
                <Button
                  isLoading={busy}
                  disabled={draft.saving || uploading}
                  onClick={() => void submit()}
                >
                  Gửi nhật ký ngày
                </Button>
              </div>
            </div>
          )}

          {overview.canConfirmJournal &&
            !isTermClosed &&
            entry &&
            ["SUBMITTED", "CONFIRMED"].includes(entry.status) &&
            p.status === "ACTIVE" && (
              <JournalReviewPanel
                entry={entry}
                busy={busy}
                onReview={handleReview}
              />
            )}
        </>
      )}
    </section>
  );
}

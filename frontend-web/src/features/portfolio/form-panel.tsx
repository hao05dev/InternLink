"use client";

import { useCallback, useRef, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioMediaScope } from "./media-upload-scope";
import { useDraft } from "./use-draft";
import { portfolioApi, downloadFile, errorText } from "./api";
import type { FormContent, FormView, Overview } from "./types";

import { FormHeaderBar } from "./components/forms/form-header-bar";
import { WeeklyForm } from "./components/forms/weekly-form";
import { CompanyAssessment } from "./components/forms/company-assessment-form";
import { LecturerAssessment, AcademicScores } from "./components/forms/lecturer-assessment-form";
import { ReportEditor } from "./components/forms/final-report-form";
import { FormRevisionsCard } from "./components/forms/form-revisions-card";
import { FormPreviewDialog } from "./components/forms/form-preview-dialog";
import {
  FormEditActionsBar,
  FormReviewCard,
  FormReopenCard,
  FormPublishCard,
} from "./components/forms/form-status-actions";

export default function FormPanel({
  form,
  overview,
  userId,
  onRefresh,
}: {
  form: FormView;
  overview: Overview;
  userId: string;
  onRefresh: () => Promise<void>;
}) {
  const p = overview.placement;
  const [current, setCurrent] = useState(form);
  const [busy, setBusy] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const uploadState = useCallback((uploading: boolean) => {
    setUploadCount((n) => Math.max(0, n + (uploading ? 1 : -1)));
  }, []);

  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const previewNode = useRef<HTMLDivElement>(null);
  const signedInput = useRef<HTMLInputElement>(null);

  const isTermClosed = p.termStatus === "CLOSED";
  const editable =
    !isTermClosed &&
    current.canEdit &&
    ["DRAFT", "REVISION_REQUIRED"].includes(current.status) &&
    !current.published &&
    p.status === "ACTIVE";

  const save = useCallback(
    async (content: FormContent, version: number | null) => {
      const result = (
        await portfolioApi.saveForm(p.id, form.kind, content, version)
      ).data!;
      setCurrent(result);
      await onRefresh().catch(() => undefined);
      return result;
    },
    [p.id, form.kind, onRefresh],
  );

  const draft = useDraft(
    `internlink:form:${userId}:${p.id}:${form.kind}`,
    form.content || {},
    form.version,
    editable && !busy && uploadCount === 0,
    save,
  );

  const content = draft.value;
  const patch = (change: Partial<FormContent>) =>
    draft.change({ ...content, ...change });

  async function action(name: string, noteText = "") {
    if (uploadCount) {
      setNotice("Chờ ảnh tải xong trước khi gửi biểu mẫu.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const version = editable ? (await draft.flush()).version : current.version;
      if (version === null) throw new Error("Hãy lưu biểu mẫu trước.");
      const result = (
        await portfolioApi.action(p.id, form.kind, name, version, noteText)
      ).data!;
      setCurrent(result);
      await onRefresh();
    } catch (error) {
      setNotice(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  async function exportDocx(revisionId?: string, showPreview = false) {
    if (uploadCount) {
      setNotice("Chờ ảnh tải xong trước khi xuất biểu mẫu.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      if (editable) await draft.flush();
      const url = portfolioApi.exportUrl(p.id, form.kind, revisionId);
      if (!showPreview) {
        await downloadFile(
          url,
          `M-TT-${form.kind.slice(1)}_${p.studentCode || "SinhVien"}.docx`,
        );
      } else {
        setPreview(true);
        const response = await fetch(url, { credentials: "include", cache: "no-store" });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || "Không tạo được bản xem trước.");
        }
        const data = await response.blob();
        const { renderAsync } = await import("docx-preview");
        if (previewNode.current) {
          await renderAsync(data, previewNode.current, undefined, {
            inWrapper: true,
            ignoreLastRenderedPageBreak: false,
            renderHeaders: true,
            renderFooters: true,
          });
        }
      }
    } catch (error) {
      setNotice(errorText(error));
      setPreview(false);
    } finally {
      setBusy(false);
    }
  }

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setNotice("");
    try {
      await portfolioApi.uploadSigned(
        p.id,
        form.kind,
        file,
        current.revisions.find((r) => r.downloadable)?.id,
      );
      await onRefresh();
      setNotice("Đã lưu bản có chữ ký.");
    } catch (error) {
      setNotice(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortfolioMediaScope.Provider
      value={{
        purpose: "PORTFOLIO_IMAGE",
        contextId: overview.placement.id,
        scope: form.kind,
        uploading: uploadCount > 0,
        onUploadStateChange: uploadState,
      }}
    >
      <section className="space-y-5">
        <FormHeaderBar
          form={form}
          current={current}
          busy={busy}
          draftSaving={draft.saving}
          uploadCount={uploadCount}
          termId={overview.placement.termId}
          onPreview={() => void exportDocx(undefined, true)}
          onDownload={() => void exportDocx()}
        />

        {notice && (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            {notice}
          </p>
        )}

        {!current.canRead ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <LockKeyhole className="mx-auto mb-3 h-9 w-9 text-slate-400" />
            <p className="font-semibold">Phiếu chưa được công bố</p>
            <p className="mt-2 text-sm text-slate-500">
              Bạn có thể theo dõi trạng thái hoàn thành. Nội dung, nhận xét và
              điểm sẽ hiển thị sau khi được phép công bố.
            </p>
          </div>
        ) : (
          <>
            {draft.recovery && editable && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-3 text-sm">
                <span>Có bản nháp trên thiết bị chưa đồng bộ.</span>
                <Button size="sm" onClick={draft.recovery}>Khôi phục</Button>
                <Button variant="ghost" size="sm" onClick={draft.discardRecovery}>
                  Bỏ bản dự phòng
                </Button>
              </div>
            )}

            {current.feedback && (
              <div className="rounded-xl bg-sky-50 p-4 text-sm">
                <strong>Góp ý của giảng viên</strong>
                <p className="mt-1 whitespace-pre-wrap">{current.feedback}</p>
              </div>
            )}

            {["M01", "M02"].includes(form.kind) && (
              <WeeklyForm
                content={content}
                editable={editable && !busy}
                following={form.kind === "M02"}
                patch={patch}
              />
            )}

            {form.kind === "M03" && (
              <>
                <CompanyAssessment
                  content={content}
                  editable={editable && !busy}
                  patch={patch}
                />
                <AcademicScores
                  content={content}
                  editable={editable && !busy}
                  patch={patch}
                  overview={overview}
                  role="COMPANY_MENTOR"
                />
              </>
            )}

            {form.kind === "M04" && (
              <LecturerAssessment
                content={content}
                editable={editable && !busy}
                patch={patch}
                overview={overview}
              />
            )}

            {form.kind === "M05" && (
              <ReportEditor
                content={content}
                editable={editable && !busy}
                patch={patch}
                overview={overview}
              />
            )}

            {editable && (
              <FormEditActionsBar
                formKind={form.kind}
                message={draft.message}
                busy={busy}
                draftSaving={draft.saving}
                uploadCount={uploadCount}
                onSaveDraft={() =>
                  void draft.flush().catch((error) => setNotice(errorText(error)))
                }
                onSubmit={() =>
                  void action(form.kind === "M05" ? "SUBMIT" : "COMPLETE")
                }
              />
            )}

            {current.canReview && !isTermClosed && current.status === "SUBMITTED" && (
              <FormReviewCard
                busy={busy}
                onAction={(name, noteText) => action(name, noteText)}
              />
            )}

            {current.canEdit && !isTermClosed && current.status === "COMPLETED" && !current.published && p.status === "ACTIVE" && (
              <FormReopenCard
                busy={busy}
                onAction={(name, noteText) => action(name, noteText)}
              />
            )}

            {current.canPublish && !isTermClosed && ["M02", "M03", "M04"].includes(form.kind) && ["COMPLETED", "APPROVED"].includes(current.status) && (
              <FormPublishCard
                current={current}
                busy={busy}
                onTogglePublish={() =>
                  void action(current.published ? "UNPUBLISH" : "PUBLISH")
                }
              />
            )}

            <FormRevisionsCard
              form={form}
              current={current}
              overview={overview}
              busy={busy}
              signedInput={signedInput}
              onUpload={upload}
              onExportDocx={exportDocx}
            />

            <FormPreviewDialog
              open={preview}
              previewNode={previewNode}
              onClose={() => setPreview(false)}
            />
          </>
        )}
      </section>
    </PortfolioMediaScope.Provider>
  );
}

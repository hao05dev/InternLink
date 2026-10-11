"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import { AlertCircle, Sparkles, X } from "lucide-react";
import { UploadedFileItem } from "@/components/ui/file-uploader";
import { JobBasicInfoSection } from "../components/company/form/job-basic-info-section";
import { JobDescriptionSection } from "../components/company/form/job-description-section";
import { JobMediaSection } from "../components/company/form/job-media-section";
import { JobFormActions } from "../components/company/form/job-form-actions";
import { useJobFormDraft, JobFormDraftValues } from "../hooks/use-job-form-draft";

const DEFAULT_LOCATION = "KDC Nam Long, P. Hưng Thạnh, Q. Cái Răng, TP. Cần Thơ";
const DEFAULT_SKILLS = "Java, Spring Boot, Git";

interface CompanyJobFormViewProps {
  mode: "create" | "edit";
  jobId?: string;
}

export function CompanyJobFormView({ mode, jobId }: CompanyJobFormViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const uploadState = useCallback(
    (busy: boolean) =>
      setUploadCount((count) => Math.max(0, count + (busy ? 1 : -1))),
    [],
  );
  const [formError, setFormError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");

  const [title, setTitle] = useState("");
  const [workFormat, setWorkFormat] = useState("ONSITE");
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [vacancies, setVacancies] = useState("3");
  const [stipendAmount, setStipendAmount] = useState("4000000");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [description, setDescription] = useState("");
  const [skillsText, setSkillsText] = useState(DEFAULT_SKILLS);
  const [benefitsText, setBenefitsText] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState<UploadedFileItem[]>([]);

  // Hook quản lý lưu nháp localStorage & cảnh báo beforeunload
  const {
    hasRestoredDraft,
    restoredTime,
    clearDraft,
    removeDraftOnSuccess,
    dismissBanner,
  } = useJobFormDraft({
    mode,
    companyId: user?.companyId,
    isLoading,
    isSubmitting,
    values: {
      title,
      workFormat,
      location,
      vacancies,
      stipendAmount,
      isNegotiable,
      description,
      skillsText,
      benefitsText,
      bannerUrl,
      attachmentUrls,
      selectedDeptId,
      selectedTermId,
    },
    onRestore: useCallback((draft: Partial<JobFormDraftValues>) => {
      if (draft.title) setTitle(draft.title);
      if (draft.workFormat) setWorkFormat(draft.workFormat);
      if (draft.location) setLocation(draft.location);
      if (draft.vacancies) setVacancies(draft.vacancies);
      if (draft.stipendAmount !== undefined) setStipendAmount(draft.stipendAmount);
      if (draft.isNegotiable !== undefined) setIsNegotiable(draft.isNegotiable);
      if (draft.description) setDescription(draft.description);
      if (draft.skillsText) setSkillsText(draft.skillsText);
      if (draft.benefitsText) setBenefitsText(draft.benefitsText);
      if (draft.bannerUrl) setBannerUrl(draft.bannerUrl);
      if (draft.attachmentUrls) setAttachmentUrls(draft.attachmentUrls);
      if (draft.selectedDeptId) setSelectedDeptId(draft.selectedDeptId);
      if (draft.selectedTermId) setSelectedTermId(draft.selectedTermId);
    }, []),
    onResetToDefault: useCallback(() => {
      setTitle("");
      setWorkFormat("ONSITE");
      setLocation(DEFAULT_LOCATION);
      setVacancies("3");
      setStipendAmount("4000000");
      setIsNegotiable(false);
      setDescription("");
      setSkillsText(DEFAULT_SKILLS);
      setBenefitsText("");
      setBannerUrl("");
      setAttachmentUrls([]);
    }, []),
  });

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [deptRes, compRes] = await Promise.all([
          apiClient.get<any[]>("/api/v1/departments"),
          apiClient.get<any[]>("/api/v1/companies"),
        ]);
        if (deptRes.data && deptRes.data.length > 0) {
          setDepartments(deptRes.data);
          const defaultDept = deptRes.data[0].id;
          setSelectedDeptId((prev) => prev || defaultDept);
          const termRes = await apiClient.get<any[]>(
            `/api/v1/terms/by-department/${defaultDept}`,
          );
          if (termRes.data && termRes.data.length > 0) {
            setTerms(termRes.data);
            setSelectedTermId((prev) => prev || termRes.data[0].id);
          }
        }
        if (compRes.data && compRes.data.length > 0) {
          setCompanyId(
            user?.companyId ||
              (user?.role === "ADMIN" ? compRes.data[0].id : ""),
          );
        }

        if (mode === "edit" && jobId) {
          const jobRes = await apiClient.get<any>(`/api/v1/jobs/${jobId}`);
          if (jobRes.data) {
            const j = jobRes.data;
            setCompanyId(j.companyId || "");
            setTitle(j.title || "");
            setWorkFormat(j.workFormat || "ONSITE");
            setLocation(j.location || "");
            setVacancies(String(j.vacancies || 1));
            const amt = j.stipendAmount;
            if (amt == null || Number(amt) === 0) {
              setIsNegotiable(true);
              setStipendAmount("");
            } else {
              setIsNegotiable(false);
              setStipendAmount(String(amt));
            }
            setDescription(j.description || "");
            setBannerUrl(j.bannerUrl || "");
            setAttachmentUrls(j.attachmentUrls || []);
            setSelectedDeptId(j.departmentId || "");
            setSelectedTermId(j.termId || "");
            if (j.skills && j.skills.length > 0) {
              setSkillsText(j.skills.map((s: { skillName?: string; skillId?: string }) => s.skillName || s.skillId).join(", "));
            } else if (j.mandatorySkillIds) {
              setSkillsText(j.mandatorySkillIds.join(", "));
            }
            if (j.benefits) setBenefitsText(j.benefits.join(", "));
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadMetadata();
  }, [mode, jobId, user?.companyId, user?.role]);

  const activeTerm = terms.find((t) => t.id === selectedTermId);
  const isTermClosed = activeTerm?.status === "CLOSED";

  const handleSave = async (submitAfterSave = false) => {
    setFormError(null);
    if (uploadCount) {
      setFormError("Chờ tải ảnh/tệp hoàn tất trước khi lưu.");
      return;
    }
    if (isTermClosed) {
      setFormError(
        "Kỳ thực tập đã kết thúc (CLOSED). Không thể đăng hoặc lưu tin.",
      );
      return;
    }
    if (!companyId) {
      setFormError("Tài khoản chưa được gắn doanh nghiệp.");
      return;
    }
    if (!title.trim() || !description.trim() || !location.trim()) {
      setFormError("Vui lòng điền đầy đủ Tiêu đề, Mô tả và Địa điểm làm việc.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        companyId,
        departmentId: selectedDeptId || departments[0]?.id,
        termId: selectedTermId || terms[0]?.id,
        title: title.trim(),
        workFormat,
        location: location.trim(),
        vacancies: parseInt(vacancies, 10) || 1,
        stipendAmount: isNegotiable ? 0 : parseFloat(stipendAmount) || 0,
        bannerUrl: bannerUrl.trim() || undefined,
        attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
        description: description.trim(),
        mandatorySkillIds: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        benefits: benefitsText
          ? benefitsText
              .split(",")
              .map((b) => b.trim())
              .filter(Boolean)
          : undefined,
      };

      let savedJobId = jobId;
      if (mode === "create") {
        const res = await apiClient.post<any>("/api/v1/jobs", payload);
        savedJobId = res.data?.id;
      } else if (jobId) {
        await apiClient.put(`/api/v1/jobs/${jobId}`, payload);
      }

      if (submitAfterSave && savedJobId) {
        await apiClient.patch(`/api/v1/jobs/${savedJobId}/submit`);
      }

      // Xóa bản nháp lưu tạm khi lưu thành công
      removeDraftOnSuccess();
      router.push("/company/jobs");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi lưu tin tuyển dụng.";
      setFormError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Đang tải biểu mẫu...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {mode === "edit"
            ? "Chỉnh Sửa Tin Tuyển Dụng"
            : "Đăng Tin Tuyển Dụng Mới"}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Điền đầy đủ thông tin vị trí thực tập để gửi Ban Quản lý Khoa thẩm
          định chuyên môn.
        </p>
      </div>

      {hasRestoredDraft && (
        <div className="p-3.5 bg-sky-50 text-sky-900 border border-sky-200 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Hệ thống đã tự động khôi phục bản nháp bạn đang nhập dở trước đó{restoredTime ? ` (lúc ${restoredTime})` : ""}.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={clearDraft}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 underline cursor-pointer"
            >
              Xóa bản nháp & làm mới
            </button>
            <button
              type="button"
              onClick={dismissBanner}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {formError && (
        <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <JobBasicInfoSection
        terms={terms}
        departments={departments}
        selectedTermId={selectedTermId}
        onTermChange={setSelectedTermId}
        selectedDeptId={selectedDeptId}
        onDeptChange={setSelectedDeptId}
        title={title}
        onTitleChange={setTitle}
        workFormat={workFormat}
        onWorkFormatChange={setWorkFormat}
        location={location}
        onLocationChange={setLocation}
        vacancies={vacancies}
        onVacanciesChange={setVacancies}
        stipendAmount={stipendAmount}
        onStipendChange={setStipendAmount}
        isNegotiable={isNegotiable}
        onNegotiableChange={setIsNegotiable}
        isTermClosed={isTermClosed}
      />

      <JobDescriptionSection
        companyId={companyId}
        onUploadStateChange={uploadState}
        description={description}
        onDescriptionChange={setDescription}
        skillsText={skillsText}
        onSkillsChange={setSkillsText}
        benefitsText={benefitsText}
        onBenefitsChange={setBenefitsText}
      />

      <JobMediaSection
        companyId={companyId}
        disabled={isSubmitting || isTermClosed}
        onUploadStateChange={uploadState}
        bannerUrl={bannerUrl}
        onBannerUrlChange={setBannerUrl}
        attachmentUrls={attachmentUrls}
        onAttachmentsChange={setAttachmentUrls}
      />

      <JobFormActions
        mode={mode}
        isSubmitting={isSubmitting}
        isTermClosed={isTermClosed}
        onSaveDraft={() => handleSave(false)}
        onSubmitReview={() => handleSave(true)}
      />
    </div>
  );
}

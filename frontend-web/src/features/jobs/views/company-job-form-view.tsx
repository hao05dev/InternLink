"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCompanyProfile } from "@/features/companies/hooks/use-company-profile";
import { CompanyProfileEditModal } from "@/features/companies/components/modals/company-profile-edit-modal";
import { useJobForm } from "../hooks/use-job-form";
import { useJobFormSubmit } from "../hooks/use-job-form-submit";
import { useJobFormDraft } from "../hooks/use-job-form-draft";
import { JobBasicInfoSection } from "../components/company/form/job-basic-info-section";
import { JobDescriptionSection } from "../components/company/form/job-description-section";
import { JobMediaSection } from "../components/company/form/job-media-section";
import { JobFormActions } from "../components/company/form/job-form-actions";
import { JobLocationSection } from "../components/company/form/job-location-section";
import { JobCompanyProfileSection } from "../components/company/form/job-company-profile-section";
import { JobDraftNotice } from "../components/company/form/job-draft-notice";
import type { WorkFormat } from "../types/job.types";

export function CompanyJobFormView({ mode, jobId }: { mode: "create" | "edit"; jobId?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const form = useJobForm(mode, jobId, user?.companyId);
  const profile = useCompanyProfile();
  const [editingProfile, setEditingProfile] = useState(false);
  const clearDraftOnSuccess = useRef<() => void>(() => {});
  const submission = useJobFormSubmit({ companyId: form.companyId, jobId, values: form.values,
    blocked: form.loading || form.termsLoading || form.isTermClosed || !!form.uploads || !!form.error,
    onSuccess: () => { clearDraftOnSuccess.current(); router.push("/company/jobs"); } });
  const draft = useJobFormDraft({ mode, companyId: form.companyId, isLoading: form.loading,
    isSubmitting: submission.submitting, values: form.values, onRestore: form.restore, onResetToDefault: form.reset });
  useEffect(() => { clearDraftOnSuccess.current = draft.removeDraftOnSuccess; }, [draft.removeDraftOnSuccess]);
  const v = form.values;
  const change = form.change;
  if (form.loading) return <p role="status" className="p-8 text-slate-500">Đang tải biểu mẫu…</p>;
  return <div className="max-w-5xl space-y-6 pb-10">
    <div><h1 className="text-2xl font-bold text-slate-900">{mode === "edit" ? "Chỉnh Sửa Tin Tuyển Dụng" : "Đăng Tin Tuyển Dụng Mới"}</h1>
      <p className="mt-2 text-sm text-slate-500">Giới thiệu vị trí thực tập và gửi Khoa thẩm định chuyên môn.</p></div>
    {draft.hasRestoredDraft && <JobDraftNotice time={draft.restoredTime} onClear={draft.clearDraft} onDismiss={draft.dismissBanner} />}
    {(form.error || submission.error) && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{form.error || submission.error}</p>}
    <JobCompanyProfileSection company={profile.company} loading={profile.loading} error={profile.error} onEdit={() => setEditingProfile(true)} onRetry={profile.retry} />
    <fieldset disabled={submission.submitting} className="min-w-0 space-y-6">
      <JobBasicInfoSection terms={form.terms} departments={form.departments} selectedTermId={v.selectedTermId}
        onTermChange={x => change("selectedTermId", x)} selectedDeptId={v.selectedDeptId} onDeptChange={x => change("selectedDeptId", x)}
        title={v.title} onTitleChange={x => change("title", x)} workFormat={v.workFormat} onWorkFormatChange={x => change("workFormat", x as WorkFormat)}
        vacancies={v.vacancies} onVacanciesChange={x => change("vacancies", x)} stipendAmount={v.stipendAmount} onStipendChange={x => change("stipendAmount", x)}
        isNegotiable={v.isNegotiable} onNegotiableChange={x => change("isNegotiable", x)} isTermClosed={form.isTermClosed} />
      <JobLocationSection values={v} company={profile.company} onChange={change} />
      <JobDescriptionSection companyId={form.companyId} onUploadStateChange={form.uploadState} description={v.description}
        onDescriptionChange={x => change("description", x)} skillsText={v.skillsText} onSkillsChange={x => change("skillsText", x)}
        benefitsText={v.benefitsText} onBenefitsChange={x => change("benefitsText", x)} />
      <JobMediaSection companyId={form.companyId} onUploadStateChange={form.uploadState} disabled={form.isTermClosed}
        bannerUrl={v.bannerUrl} onBannerUrlChange={x => change("bannerUrl", x)} attachmentUrls={v.attachmentUrls} onAttachmentsChange={x => change("attachmentUrls", x)} />
      <JobFormActions disabled={form.termsLoading || !!form.uploads || !!form.error} mode={mode} isSubmitting={submission.submitting} isTermClosed={form.isTermClosed}
        onSaveDraft={() => void submission.save(false)} onSubmitReview={() => void submission.save(true)} />
    </fieldset>
    {editingProfile && profile.company && <CompanyProfileEditModal company={profile.company} onSave={profile.save} onClose={() => setEditingProfile(false)} />}
  </div>;
}

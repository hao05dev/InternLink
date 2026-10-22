"use client";

import { useJobDetail } from "../hooks/use-job-detail";
import { usePublicCompany } from "@/features/companies/hooks/use-public-company";
import { CompanyIntroductionSection } from "@/features/companies/components/public/company-introduction-section";
import { JobLocationSection } from "./detail/job-location-section";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layouts/public-shell";
import { MediaRichContent } from "@/components/ui/media-rich-content";

// Focused Subcomponents
import { JobDetailHeader } from "./detail/job-detail-header";
import { JobBenefitsSection } from "./detail/job-benefits-section";
import { JobSkillsSection } from "./detail/job-skills-section";
import { JobProgramsSection } from "./detail/job-programs-section";
import { JobLearningOutcomesSection } from "./detail/job-learning-outcomes-section";
import { JobAttachmentsSection } from "./detail/job-attachments-section";
import { JobDetailSidebar } from "./detail/job-detail-sidebar";
import { JobMatchExplanationCard } from "./detail/job-match-explanation-card";
import { JobApplyModal } from "./modals/job-apply-modal";

export default function JobDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { job, relatedJobs, loading, user, isAuthenticated, isApplied, setIsApplied,
    showApplyModal, setShowApplyModal, studentProfile } = useJobDetail(id);
  const companyProfile = usePublicCompany(job?.company?.publicProfile ? job.companyId : undefined);

  if (loading) {
    return (
      <PublicShell>
        <div className="min-h-screen bg-slate-50 py-12">
          <div className="max-w-6xl mx-auto px-4 space-y-6 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
              <div className="h-96 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </PublicShell>
    );
  }

  if (!job) {
    return (
      <PublicShell>
        <div className="min-h-screen bg-slate-50 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Không tìm thấy vị trí tuyển dụng
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Vị trí này có thể đã kết thúc thời hạn nhận hồ sơ hoặc đang cập nhật.
          </p>
          <Link href="/jobs">
            <Button variant="default">Quay lại danh sách việc làm</Button>
          </Link>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="min-h-screen bg-slate-50/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link
              href="/jobs"
              className="hover:text-sky-700 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Danh sách vị trí thực tập
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-medium truncate max-w-md">
              {job.title}
            </span>
          </div>

          {/* Hero Header Card */}
          <JobDetailHeader
            job={job}
            isAuthenticated={isAuthenticated}
            userRole={user?.role}
            userCompanyId={user?.companyId}
            isApplied={isApplied}
            onOpenApplyModal={() => {
              if (isAuthenticated && user?.role === "STUDENT") {
                setShowApplyModal(true);
              }
            }}
            onRedirectLogin={() => router.push(`/login?redirect=/jobs/${job.id}`)}
          />

          {/* Main 2-Column Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Job Details */}
            <div className="lg:col-span-2 space-y-6">
              {job.bannerUrl && (
                <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs max-h-96">
                  <img
                    src={job.bannerUrl}
                    alt={job.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Job Description with Markdown Rendering */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Briefcase className="w-5 h-5 text-sky-700" />
                  Mô tả công việc & Nhiệm vụ thực tập
                </h3>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  <MediaRichContent
                    text={
                      job.description || "Chưa có mô tả chi tiết cho vị trí này."
                    }
                  />
                </div>
              </div>

              {/* Explainable AI Matching Breakdown */}
              {(job.matchScore !== undefined || job.scoreLabel) && (
                <JobMatchExplanationCard job={job} />
              )}

              {companyProfile.company && <CompanyIntroductionSection description={companyProfile.company.description} />}
              <JobLocationSection job={job} />
              {/* Modular Sections */}
              <JobBenefitsSection benefits={job.benefits} />
              <JobSkillsSection skills={job.skills} />
              <JobProgramsSection targetProgramCodes={job.targetProgramCodes} />
              <JobLearningOutcomesSection
                targetLearningOutcomes={job.targetLearningOutcomes}
              />
              <JobAttachmentsSection attachments={job.attachmentUrls} />
            </div>

            {/* Right Column: Sidebar */}
            <JobDetailSidebar job={job} relatedJobs={relatedJobs} />
          </div>
        </div>

        {/* Apply Modal - Protected strictly for STUDENT only */}
        {showApplyModal && isAuthenticated && user?.role === "STUDENT" && (
          <JobApplyModal
            jobId={job.id}
            jobTitle={job.title}
            userFullName={user?.fullName}
            userEmail={user?.email}
            studentProfile={studentProfile}
            onClose={() => setShowApplyModal(false)}
            onSuccess={() => {
              setIsApplied(true);
              setShowApplyModal(false);
            }}
          />
        )}
      </div>
    </PublicShell>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import { jobService } from "@/features/jobs/services/job.service";
import { JobPosition } from "@/features/jobs/types/job.types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PublicShell } from "@/components/layouts/public-shell";
import { apiClient } from "@/lib/api-client";
import { StudentProfile } from "@/features/profiles/types/profile.types";
import { MediaRichContent } from "@/components/ui/media-rich-content";

// Focused Subcomponents
import { JobDetailHeader } from "./detail/job-detail-header";
import { JobBenefitsSection } from "./detail/job-benefits-section";
import { JobSkillsSection } from "./detail/job-skills-section";
import { JobProgramsSection } from "./detail/job-programs-section";
import { JobLearningOutcomesSection } from "./detail/job-learning-outcomes-section";
import { JobAttachmentsSection } from "./detail/job-attachments-section";
import { JobDetailSidebar } from "./detail/job-detail-sidebar";
import { JobApplyModal } from "./detail/job-apply-modal";

export default function JobDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<JobPosition | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );

  const jobId = id;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    jobService
      .getJobById(jobId)
      .then((data) => {
        if (mounted) {
          setJob(data);
          jobService.getPublicJobs().then((all) => {
            if (mounted) {
              setRelatedJobs(all.filter((j) => j.id !== jobId).slice(0, 3));
            }
          });
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    if (isAuthenticated && user?.role === "STUDENT") {
      apiClient
        .get<StudentProfile>("/api/v1/students/me/profile")
        .then((res) => {
          if (mounted && res.data) {
            setStudentProfile(res.data);
          }
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, [jobId, isAuthenticated, user?.role]);

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
            isApplied={isApplied}
            onOpenApplyModal={() => setShowApplyModal(true)}
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

        {/* Apply Modal */}
        {showApplyModal && (
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

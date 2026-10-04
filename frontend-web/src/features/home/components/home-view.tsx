"use client";

import React, { useEffect, useState } from "react";
import { PublicShell } from "@/components/layouts/public-shell";
import { jobService } from "@/features/jobs/services/job.service";
import { JobPosition } from "@/features/jobs/types/job.types";
import { apiClient } from "@/lib/api-client";
import { HeroManagedSection } from "./hero-managed-section";
import { WorkflowSection } from "./workflow-section";
import { LatestJobsSection } from "./latest-jobs-section";
import { AboutSchoolSection } from "./about-school-section";
import { VerifiedCompaniesSection } from "./verified-companies-section";
import { Company } from "@/features/companies/types/company.types";

export default function HomeView() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const fetchPublicData = async () => {
    setIsLoadingJobs(true);
    setJobsError(null);
    try {
      const jobList = await jobService.getPublicJobs();
      setJobs(jobList.slice(0, 3));
    } catch (err: unknown) {
      setJobsError(err instanceof Error ? err.message : "Không thể tải danh sách vị trí thực tập. Vui lòng thử lại.");
    } finally {
      setIsLoadingJobs(false);
    }

    try {
      const compRes = await apiClient.get<Company[]>("/api/v1/companies");
      if (compRes.data) {
        const verified = compRes.data.filter(
          (c) => c.verificationStatus === "VERIFIED" || c.status === "VERIFIED"
        );
        setCompanies(verified.slice(0, 6));
      }
    } catch {
      // Bỏ qua nếu chưa tải được danh bạ doanh nghiệp
      setCompanies([]);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  return (
    <PublicShell>
      <div className="bg-white">
        <HeroManagedSection />
        <LatestJobsSection
          jobs={jobs}
          isLoading={isLoadingJobs}
          error={jobsError}
          onRetry={fetchPublicData}
        />

        <WorkflowSection />
        <AboutSchoolSection />
        <VerifiedCompaniesSection companies={companies} />
      </div>
    </PublicShell>
  );
}

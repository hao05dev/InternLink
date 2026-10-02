"use client";

import React, { useEffect, useState } from "react";
import { PublicShell } from "@/components/layouts/public-shell";
import { jobService } from "@/features/jobs/services/job.service";
import { JobPosition } from "@/features/jobs/types/job.types";
import { apiClient } from "@/lib/api-client";
import { HeroManagedSection } from "./hero-managed-section";
import { ValuePropEditorialSection } from "./value-prop-editorial-section";
import { InteractiveWorkflowSection } from "./interactive-workflow-section";
import { DarkBentoSection } from "./dark-bento-section";
import { LatestJobsSection } from "./latest-jobs-section";
import { RolePortalsSection } from "./role-portals-section";
import { VerifiedCompaniesSection } from "./verified-companies-section";

interface VerifiedCompany {
  id: string;
  name: string;
  industry?: string;
  address?: string;
  verificationStatus?: string;
  status?: string;
}

export default function HomeView() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [companies, setCompanies] = useState<VerifiedCompany[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const fetchPublicData = async () => {
    setIsLoadingJobs(true);
    setJobsError(null);
    try {
      const jobList = await jobService.getAllJobs();
      setJobs(jobList.slice(0, 6));
    } catch (err: any) {
      setJobsError(err?.message || "Không thể tải danh sách vị trí thực tập. Vui lòng thử lại.");
    } finally {
      setIsLoadingJobs(false);
    }

    try {
      const compRes = await apiClient.get<VerifiedCompany[]>("/api/v1/companies");
      if (compRes.data) {
        const verified = compRes.data.filter(
          (c) => c.verificationStatus === "VERIFIED" || c.status === "VERIFIED"
        );
        setCompanies(verified);
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
      <div className="space-y-0 pb-12">
        {/* 1. HERO MANAGED SECTION (Airy Modern Header + Display Title) */}
        <HeroManagedSection />

        {/* 2. VALUE PROPOSITION & EDITORIAL SOCIAL PROOF + METRICS */}
        <ValuePropEditorialSection />

        {/* 3. INTERACTIVE 4-STEP WORKFLOW ACCORDION */}
        <InteractiveWorkflowSection />

        {/* 4. HIGH-CONTRAST DARK BENTO GRID ECOSYSTEM */}
        <DarkBentoSection />

        {/* 5. LATEST JOB POSTINGS SHOWCASE */}
        <LatestJobsSection
          jobs={jobs}
          isLoading={isLoadingJobs}
          error={jobsError}
          onRetry={fetchPublicData}
        />

        {/* 6. ROLE PORTALS (Student, Company/Mentor, Lecturer, Faculty) */}
        <RolePortalsSection />

        {/* 7. VERIFIED COMPANIES NETWORK */}
        <VerifiedCompaniesSection companies={companies} />
      </div>
    </PublicShell>
  );
}
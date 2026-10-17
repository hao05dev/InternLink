"use client";

import { usePublicHomeJobs as useCompanyPublicJobsForHome } from "../hooks/use-public-home-jobs";
import { useCompanyDirectory } from "@/features/companies/hooks/use-company-directory";
import { PublicShell } from "@/components/layouts/public-shell";
import { HeroManagedSection } from "./hero-managed-section";
import { WorkflowSection } from "./workflow-section";
import { LatestJobsSection } from "./latest-jobs-section";
import { AboutSchoolSection } from "./about-school-section";
import { VerifiedCompaniesSection } from "./verified-companies-section";

export default function HomeView() {
  const jobData = useCompanyPublicJobsForHome();
  const directory = useCompanyDirectory();
  const jobs = jobData.jobs;
  const companies = directory.companies;
  const isLoadingJobs = jobData.loading;
  const jobsError = jobData.error;
  const fetchPublicData = jobData.retry;

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

import type { JobPosition } from "../../types/job.types";
import { CompanySummaryCard } from "@/features/companies/components/cards/company-summary-card";
import { JobAcademicContext } from "./job-academic-context";
import { RelatedJobsSection } from "./related-jobs-section";
export function JobDetailSidebar({ job, relatedJobs }: { job: JobPosition; relatedJobs: JobPosition[] }) {
  return <aside className="space-y-6">
    <CompanySummaryCard company={job.company ?? { id: job.companyId, companyName: job.companyName, publicProfile: false }} />
    <JobAcademicContext job={job} />
    <RelatedJobsSection jobs={relatedJobs} />
  </aside>;
}

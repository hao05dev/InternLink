import type { JobPosition } from "../../types/job.types";
import { RelatedJobCard } from "../cards/related-job-card";
export function RelatedJobsSection({ jobs }: { jobs: JobPosition[] }) {
  if (!jobs.length) return null;
  return <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
    <h2 className="text-sm font-bold text-slate-900">Vị trí thực tập khác</h2>
    {jobs.map(job => <RelatedJobCard key={job.id} job={job} />)}
  </section>;
}

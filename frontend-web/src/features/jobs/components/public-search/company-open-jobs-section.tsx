import { BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicJobCard } from "../cards/public-job-card";
import type { JobPosition } from "../../types/job.types";

interface Props { jobs: JobPosition[]; loading: boolean; error: string; onRetry: () => void }
export function CompanyOpenJobsSection({ jobs, loading, error, onRetry }: Props) {
  return <section className="space-y-4">
    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><BriefcaseBusiness className="h-5 w-5 text-sky-700" />Vị trí đang tuyển {!loading && !error && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sm text-sky-800">{jobs.length}</span>}</h2>
    {loading ? <p role="status" className="animate-pulse rounded-2xl bg-white p-6 text-sm text-slate-500">Đang tải vị trí…</p>
      : error ? <div role="alert" className="space-y-3 rounded-2xl bg-white p-6"><p className="text-sm text-rose-700">{error}</p><Button variant="outline" onClick={onRetry}>Thử lại</Button></div>
      : jobs.length ? jobs.map(job => <PublicJobCard key={job.id} job={job} isActive />)
      : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-semibold text-slate-800">Chưa có vị trí đang tuyển</h3><p className="mt-2 text-sm leading-6 text-slate-500">Doanh nghiệp sẽ cập nhật cơ hội thực tập mới tại đây.</p></div>}
  </section>;
}

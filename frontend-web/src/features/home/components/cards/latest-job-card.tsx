import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { CompanyLogo } from "@/features/companies/components/company-logo";
import type { JobPosition } from "@/features/jobs/types/job.types";
const linkClassName = "inline-flex min-h-11 items-center gap-2 text-sm font-medium text-sky-700 hover:underline";
const stipendFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
export function LatestJobCard({ job }: { job: JobPosition }) {
  return (            <article  className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-sky-300 sm:p-6">
              <h3 className="break-words text-base font-semibold leading-snug text-slate-900">{job.title}</h3>
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                <CompanyLogo src={job.company?.logoUrl} name={job.companyName} />
                <span className="min-w-0 break-words">{job.companyName || "Doanh nghiệp tiếp nhận"}</span>
              </p>
              {job.location && (
                <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 break-words">{job.location}</span>
                </p>
              )}
              {job.stipendAmount != null && (
                <p className="mt-3 text-sm font-medium text-slate-900">Phụ cấp: {stipendFormatter.format(job.stipendAmount)}</p>
              )}
              <div className="mt-auto pt-4">
                <Link href={`/jobs/${job.id}`} aria-label={`Xem chi tiết: ${job.title}`} className={linkClassName}>
                  Xem chi tiết <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </article>);
}

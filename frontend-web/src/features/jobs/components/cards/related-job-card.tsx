import Link from "next/link";
import type { JobPosition } from "../../types/job.types";
export function RelatedJobCard({ job }: { job: JobPosition }) {
  return (              <Link
                
                href={`/jobs/${job.id}`}
                className="block p-3 rounded-2xl border border-slate-100 hover:border-sky-300 hover:bg-slate-50/50 transition-all group"
              >
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 line-clamp-2 transition-colors mb-1.5">
                  {job.title}
                </h5>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-700">
                    {job.stipendAmount
                      ? new Intl.NumberFormat("vi-VN").format(job.stipendAmount) +
                        " đ"
                      : "Thỏa thuận"}
                  </span>
                  <span>{job.location}</span>
                </div>
              </Link>);
}

"use client";

import Link from "next/link";
import { Briefcase, Building2, MapPin, ChevronRight } from "lucide-react";
import { JobPosition } from "@/features/jobs/types/job.types";
import { Badge } from "@/components/ui/badge";

interface BlogSidebarFeaturedJobsProps {
    jobs: JobPosition[];
}

export function BlogSidebarFeaturedJobs({ jobs }: BlogSidebarFeaturedJobsProps) {
    if (!jobs || jobs.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    Thực tập đề xuất
                </h3>
                <Link
                    href="/jobs"
                    className="text-[11px] font-semibold text-sky-600 hover:underline flex items-center gap-0.5"
                >
                    Khám phá <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-3">
                {jobs.map((job) => (
                    <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block p-3 rounded-2xl border border-slate-100 hover:border-sky-300 hover:bg-slate-50/70 transition-all group"
                    >
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 line-clamp-1 mb-1 transition-colors">
                            {job.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-2 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{job.companyName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                            <span className="flex items-center gap-1 text-slate-500 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[120px]">{job.location}</span>
                            </span>
                            <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0">
                                {job.stipendAmount && job.stipendAmount > 0
                                    ? new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(job.stipendAmount) + "đ"
                                    : "Thỏa thuận"}
                            </Badge>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

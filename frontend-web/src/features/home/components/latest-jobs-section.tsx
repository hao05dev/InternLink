"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Building2, MapPin, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobPosition } from "@/features/jobs/types/job.types";

interface LatestJobsSectionProps {
  jobs: JobPosition[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function LatestJobsSection({ jobs, isLoading, error, onRetry }: LatestJobsSectionProps) {
  return (
    <section id="jobs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Cơ hội tiếp nhận thực tập</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Vị Trí Thực Tập Mới Nhất
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Các vị trí thực tập đã được Ban Quản lý Khoa CICT phê duyệt
          </p>
        </div>
        <Link href="/jobs">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-semibold text-xs rounded-full border-slate-300 hover:border-sky-500 hover:text-sky-700"
          >
            <span>Xem tất cả vị trí</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Trạng thái tải dữ liệu */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-2xs">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-10 w-full rounded-2xl pt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 text-xs rounded-full">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có vị trí đang tuyển trong kỳ này</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hiện tại chưa có tin tuyển dụng thực tập nào được mở. Vui lòng quay lại sau hoặc theo dõi cẩm nang hướng dẫn.
          </p>
          <Link href="/cam-nang">
            <Button variant="outline" size="sm" className="mt-2 text-xs rounded-full">
              Xem Cẩm nang thực tập
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition line-clamp-2">
                    {job.title}
                  </h3>
                  {job.workFormat && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                      {job.workFormat}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">{job.companyName || "Doanh nghiệp tiếp nhận"}</span>
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  {job.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  )}
                  {job.stipendAmount ? (
                    <div className="text-emerald-700 font-semibold">
                      Phụ cấp: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(job.stipendAmount)}
                    </div>
                  ) : null}
                </div>

                {/* Tags Kỹ Năng */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
                      >
                        {skill.skillName || skill.skillId}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Chỉ tiêu: <strong className="text-slate-800">{job.vacancies} SV</strong>
                </span>
                <Link href={`/jobs/${job.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs rounded-full hover:border-sky-500 hover:text-sky-700"
                  >
                    <span>Chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

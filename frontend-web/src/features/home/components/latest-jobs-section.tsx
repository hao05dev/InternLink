"use client";

import { LatestJobCard } from "./cards/latest-job-card";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobPosition } from "@/features/jobs/types/job.types";

interface LatestJobsSectionProps {
  jobs: JobPosition[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const linkClassName = "inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-sky-700 transition-colors hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";

export function LatestJobsSection({ jobs, isLoading, error, onRetry }: LatestJobsSectionProps) {
  return (
    <section id="jobs" aria-labelledby="jobs-heading" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div>
          <h2 id="jobs-heading" className="text-2xl font-semibold tracking-tight text-slate-900">Vị trí thực tập mới nhất</h2>
          <p className="mt-2 text-sm text-slate-600">Các cơ hội thực tập đã được Khoa phê duyệt.</p>
        </div>
        <Link href="/jobs" className={linkClassName + " self-start sm:shrink-0 sm:self-auto"}>
          Xem tất cả vị trí <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div role="status">
          <span className="sr-only">Đang tải vị trí thực tập</span>
          <div aria-hidden="true" className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-4 rounded-2xl border border-slate-200 p-5 sm:p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-11 w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div role="alert" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
          <p className="text-sm font-medium text-slate-900">Không thể tải vị trí thực tập</p>
          <p className="break-words text-sm text-slate-600">{error}</p>
          <Button type="button" variant="outline" onClick={onRetry} className="min-h-11 gap-2">
            <RotateCcw aria-hidden="true" className="h-4 w-4" /> Thử lại
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
          <h3 className="text-base font-semibold text-slate-900">Chưa có vị trí đang tuyển trong kỳ này</h3>
          <p className="mt-2 text-sm text-slate-600">Bạn có thể xem hướng dẫn để chuẩn bị cho kỳ thực tập.</p>
          <Link href="/career-guide" className={linkClassName + " mt-3"}>
            Xem tin tức & hướng dẫn <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {jobs.slice(0, 3).map((job) => (
            <LatestJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
import Link from "next/link";
import { Building2, School, ExternalLink } from "lucide-react";
import { JobPosition } from "@/features/jobs/types/job.types";

interface JobDetailSidebarProps {
  job: JobPosition;
  relatedJobs: JobPosition[];
}

export function JobDetailSidebar({ job, relatedJobs }: JobDetailSidebarProps) {
  return (
    <div className="space-y-6">
      {/* 1. Company Profile Summary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-700" />
          Đơn vị tiếp nhận
        </h4>

        <div className="space-y-3 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block mb-0.5">Tên doanh nghiệp:</span>
            <span className="font-bold text-slate-900 block text-sm">
              {job.companyName || "Đang cập nhật"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Địa chỉ liên hệ:</span>
            <span className="font-semibold text-slate-800 block">
              {job.companyAddress || job.location}
            </span>
          </div>
        </div>

        {job.companyWebsite && (
          <div className="pt-3 border-t border-slate-100">
            <a
              href={
                job.companyWebsite.startsWith("http")
                  ? job.companyWebsite
                  : `https://${job.companyWebsite}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center justify-between group"
            >
              <span>Xem website doanh nghiệp</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}
      </div>

      {/* 2. Academic Context (Khoa & Học kỳ) */}
      {(job.termName || job.departmentName) && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3.5">
          <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-700" />
            Thông tin học phần & Quản lý
          </h4>
          <div className="space-y-2.5 text-xs">
            {job.termName && (
              <div>
                <span className="text-slate-400 block mb-0.5">Đợt thực tập:</span>
                <span className="font-semibold text-slate-800">
                  {job.termName}
                </span>
              </div>
            )}
            {job.departmentName && (
              <div>
                <span className="text-slate-400 block mb-0.5">
                  Bộ môn / Khoa phụ trách:
                </span>
                <span className="font-semibold text-slate-800">
                  {job.departmentName}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Related Jobs */}
      {relatedJobs.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Vị trí thực tập khác
          </h4>

          <div className="space-y-3">
            {relatedJobs.map((rel) => (
              <Link
                key={rel.id}
                href={`/jobs/${rel.id}`}
                className="block p-3 rounded-2xl border border-slate-100 hover:border-sky-300 hover:bg-slate-50/50 transition-all group"
              >
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 line-clamp-2 transition-colors mb-1.5">
                  {rel.title}
                </h5>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-700">
                    {rel.stipendAmount
                      ? new Intl.NumberFormat("vi-VN").format(rel.stipendAmount) +
                        " đ"
                      : "Thỏa thuận"}
                  </span>
                  <span>{rel.location}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

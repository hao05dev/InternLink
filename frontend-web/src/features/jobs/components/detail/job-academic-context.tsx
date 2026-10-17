import { School } from "lucide-react";
import type { JobPosition } from "../../types/job.types";
export function JobAcademicContext({ job }: { job: JobPosition }) {
  if (!job.termName && !job.departmentName) return null;
  return (        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3.5">
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
        </div>);
}

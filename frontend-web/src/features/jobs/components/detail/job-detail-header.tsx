"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Share2,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobPosition } from "@/features/jobs/types/job.types";
import { UserRole } from "@/features/auth/types/auth.types";
import { JobDetailActionBar } from "./job-detail-action-bar";

interface JobDetailHeaderProps {
  job: JobPosition;
  isAuthenticated: boolean;
  userRole?: UserRole;
  userCompanyId?: string;
  isApplied: boolean;
  onOpenApplyModal: () => void;
  onRedirectLogin: () => void;
}

export function JobDetailHeader({
  job,
  isAuthenticated,
  userRole,
  userCompanyId,
  isApplied,
  onOpenApplyModal,
  onRedirectLogin,
}: JobDetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount?: number) => {
    if (!amount || amount === 0) return "Thỏa thuận";
    return (
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount) + " / tháng"
    );
  };

  const formatWorkFormat = (format?: string) => {
    switch (format?.toUpperCase()) {
      case "ONSITE":
        return "Tại văn phòng (On-site)";
      case "HYBRID":
        return "Linh hoạt / Kết hợp (Hybrid)";
      case "REMOTE":
        return "Làm việc từ xa (Remote)";
      default:
        return format || "Tại văn phòng";
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      {/* Company info & Share */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center p-3 shrink-0 shadow-2xs">
            <Building2 className="w-9 h-9 text-sky-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>{job.companyName || "Doanh nghiệp tiếp nhận"}</span>
              <Badge
                variant="outline"
                className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] py-0 px-2 rounded-full"
              >
                Đối tác Khoa
              </Badge>
            </h2>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.location}</span>
              </span>
              {job.termName && (
                <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-medium">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{job.termName}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer relative"
          title="Chia sẻ liên kết"
          aria-label="Chia sẻ liên kết"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Job Title */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
        {job.title}
      </h1>

      {/* 4-Item Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Mức phụ cấp thực tập
          </div>
          <div className="text-sm font-bold text-emerald-700">
            {formatCurrency(job.stipendAmount)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-4 h-4 text-sky-600" />
            Địa điểm làm việc
          </div>
          <div className="text-sm font-bold text-slate-800 truncate" title={job.location}>
            {job.location}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Users className="w-4 h-4 text-indigo-600" />
            Chỉ tiêu tiếp nhận
          </div>
          <div className="text-sm font-bold text-slate-800">
            {job.vacancies} sinh viên
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-4 h-4 text-amber-600" />
            Hình thức làm việc
          </div>
          <div className="text-sm font-bold text-slate-800">
            {formatWorkFormat(job.workFormat)}
          </div>
        </div>
      </div>

      {/* Primary Action Button Bar */}
      <JobDetailActionBar
        job={job}
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userCompanyId={userCompanyId}
        isApplied={isApplied}
        onOpenApplyModal={onOpenApplyModal}
        onRedirectLogin={onRedirectLogin}
      />
    </div>
  );
}

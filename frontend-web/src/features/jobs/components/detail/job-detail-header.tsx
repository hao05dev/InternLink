"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Share2,
  Bookmark,
  CheckCircle2,
  Send,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobPosition } from "@/features/jobs/types/job.types";

interface JobDetailHeaderProps {
  job: JobPosition;
  isAuthenticated: boolean;
  isApplied: boolean;
  onOpenApplyModal: () => void;
  onRedirectLogin: () => void;
}

export function JobDetailHeader({
  job,
  isAuthenticated,
  isApplied,
  onOpenApplyModal,
  onRedirectLogin,
}: JobDetailHeaderProps) {
  const [saved, setSaved] = useState(false);
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
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {isApplied ? (
          <div className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Bạn đã nộp hồ sơ ứng tuyển vị trí này thành công
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              if (!isAuthenticated) {
                onRedirectLogin();
              } else {
                onOpenApplyModal();
              }
            }}
            className="w-full sm:w-auto flex-1 font-bold py-3.5 px-8 rounded-xl shadow-xs text-sm cursor-pointer"
          >
            <Send className="w-4 h-4 mr-2" />
            Ứng tuyển ngay
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => setSaved(!saved)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold text-sm cursor-pointer"
        >
          <Bookmark className="w-4 h-4 mr-1.5 text-slate-400" />
          {saved ? "Đã lưu vị trí" : "Lưu vào danh sách"}
        </Button>
      </div>
    </div>
  );
}

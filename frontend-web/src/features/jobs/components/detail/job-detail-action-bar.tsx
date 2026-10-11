"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, Bookmark, Users, ShieldAlert, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/features/auth/types/auth.types";
import { JobPosition } from "@/features/jobs/types/job.types";

interface JobDetailActionBarProps {
  job: JobPosition;
  isAuthenticated: boolean;
  userRole?: UserRole;
  userCompanyId?: string;
  isApplied: boolean;
  onOpenApplyModal: () => void;
  onRedirectLogin: () => void;
}

const ROLE_NAME_MAP: Record<UserRole, string> = {
  STUDENT: "Sinh viên",
  COMPANY_REP: "Đại diện Doanh nghiệp",
  COMPANY_MENTOR: "Mentor Doanh nghiệp",
  LECTURER: "Giảng viên",
  FACULTY_ADMIN: "Ban Quản lý Khoa",
  ADMIN: "Quản trị viên",
  BLOG_MANAGER: "Quản lý Truyền thông",
};

export function JobDetailActionBar({
  job,
  isAuthenticated,
  userRole,
  userCompanyId,
  isApplied,
  onOpenApplyModal,
  onRedirectLogin,
}: JobDetailActionBarProps) {
  const [saved, setSaved] = useState(false);

  // 1. Guest user (Not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          variant="primary"
          onClick={onRedirectLogin}
          className="w-full sm:w-auto flex-1 font-bold py-3.5 px-8 rounded-xl shadow-xs text-sm cursor-pointer"
        >
          <Send className="w-4 h-4 mr-2" />
          Ứng tuyển ngay
        </Button>
        <Button
          variant="outline"
          onClick={() => setSaved(!saved)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold text-sm cursor-pointer"
        >
          <Bookmark className="w-4 h-4 mr-1.5 text-slate-400" />
          {saved ? "Đã lưu vị trí" : "Lưu vào danh sách"}
        </Button>
      </div>
    );
  }

  // 2. Student user (Role === STUDENT)
  if (userRole === "STUDENT") {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {isApplied ? (
          <div className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Bạn đã nộp hồ sơ ứng tuyển vị trí này thành công
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={onOpenApplyModal}
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
    );
  }

  // 3. Company Representative (Role === COMPANY_REP)
  const isOwnCompanyJob = userCompanyId && job.companyId === userCompanyId;

  if (userRole === "COMPANY_REP") {
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isOwnCompanyJob ? (
            <Link href="/company/jobs" className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto font-bold py-3.5 px-8 rounded-xl shadow-xs text-sm cursor-pointer"
              >
                <Users className="w-4 h-4 mr-2" />
                Quản lý ứng viên vị trí này
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-medium w-full">
              <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Bạn đang xem tin tuyển dụng với tư cách <strong>Đại diện Doanh nghiệp</strong>. Tính năng nộp hồ sơ ứng tuyển chỉ dành riêng cho tài khoản Sinh viên.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Other Roles (LECTURER, FACULTY_ADMIN, ADMIN, COMPANY_MENTOR, BLOG_MANAGER)
  const roleLabel = (userRole && ROLE_NAME_MAP[userRole]) || userRole;

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-100/90 border border-slate-200 text-slate-700 text-xs font-medium">
      <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
      <span>
        Đang xem với tư cách: <strong>{roleLabel}</strong>. Tính năng nộp hồ sơ ứng tuyển chỉ dành riêng cho tài khoản Sinh viên.
      </span>
    </div>
  );
}

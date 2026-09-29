import React from "react";
import { cn } from "@/lib/utils";

export type StatusCategory =
    | "application"
    | "agreement"
    | "logbook"
    | "placement"
    | "job"
    | "term"
    | "verification"
    | "result"
    | "general";

interface StatusConfig {
    label: string;
    className: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
    // ApplicationStatus
    PENDING: { label: "Chờ xét duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
    SUBMITTED: { label: "Đã nộp đơn", className: "bg-sky-50 text-sky-700 border-sky-200" },
    UNDER_REVIEW: { label: "Đang xét duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
    SHORTLISTED: { label: "Đã qua sơ tuyển", className: "bg-blue-50 text-blue-700 border-blue-200" },
    INTERVIEW_SCHEDULED: { label: "Mời phỏng vấn", className: "bg-purple-50 text-purple-700 border-purple-200" },
    OFFERED: { label: "Đã nhận Offer", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    ACCEPTED: { label: "Trúng tuyển", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    REJECTED: { label: "Chưa phù hợp", className: "bg-rose-50 text-rose-700 border-rose-200" },
    WITHDRAWN: { label: "Đã rút đơn", className: "bg-slate-100 text-slate-600 border-slate-200" },

    // AgreementStatus
    DRAFT: { label: "Bản nháp", className: "bg-slate-100 text-slate-600 border-slate-200" },
    PENDING_CONFIRMATION: { label: "Chờ xác nhận", className: "bg-amber-50 text-amber-700 border-amber-200" },
    PENDING_STUDENT: { label: "Chờ SV ký", className: "bg-amber-50 text-amber-700 border-amber-200" },
    PENDING_COMPANY: { label: "Chờ DN ký", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    PENDING_FACULTY: { label: "Chờ Khoa duyệt", className: "bg-teal-50 text-teal-700 border-teal-200" },
    STUDENT_CONFIRMED: { label: "SV đã ký", className: "bg-sky-50 text-sky-700 border-sky-200" },
    COMPANY_CONFIRMED: { label: "DN đã ký", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    FACULTY_CONFIRMED: { label: "Khoa đã ký", className: "bg-teal-50 text-teal-700 border-teal-200" },
    APPROVED: { label: "Đã phê duyệt", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },

    // LogbookStatus
    REVIEWED: { label: "Đã nhận xét", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    NEEDS_REVISION: { label: "Cần chỉnh sửa", className: "bg-amber-50 text-amber-700 border-amber-200" },

    // PlacementStatus
    PREPARING: { label: "Đang chuẩn bị", className: "bg-sky-50 text-sky-700 border-sky-200" },
    ACTIVE: { label: "Đang thực tập", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    EVALUATING: { label: "Đang đánh giá", className: "bg-amber-50 text-amber-700 border-amber-200" },
    COMPLETED: { label: "Hoàn thành", className: "bg-blue-50 text-blue-700 border-blue-200" },
    FAILED: { label: "Không đạt", className: "bg-rose-50 text-rose-700 border-rose-200" },
    TERMINATED: { label: "Đã dừng thực tập", className: "bg-slate-100 text-slate-600 border-slate-200" },
    PAUSED: { label: "Tạm dừng", className: "bg-amber-50 text-amber-700 border-amber-200" },
    TRANSFERRED: { label: "Đã chuyển nơi", className: "bg-slate-100 text-slate-600 border-slate-200" },
    CANCELLED: { label: "Đã hủy", className: "bg-slate-100 text-slate-600 border-slate-200" },

    // JobStatus
    PENDING_APPROVAL: { label: "Chờ Khoa duyệt", className: "bg-amber-50 text-amber-700 border-amber-200" },
    CLOSED: { label: "Đã đóng tin", className: "bg-slate-100 text-slate-600 border-slate-200" },

    // TermStatus
    REGISTRATION_OPEN: { label: "Đang mở đăng ký", className: "bg-sky-50 text-sky-700 border-sky-200" },
    APPLICATION_OPEN: { label: "Đang nhận hồ sơ", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },

    // VerificationStatus
    VERIFIED: { label: "Đã xác thực MOU", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },

    // ResultStatus
    FINALIZED: { label: "Đã chốt điểm", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    PUBLISHED: { label: "Đã công bố", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PASSED: { label: "Đạt yêu cầu", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    INCOMPLETE: { label: "Chưa hoàn thành", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export interface StatusBadgeProps {
    status: string;
    type?: StatusCategory;
    customLabel?: string;
    className?: string;
}

export function StatusBadge({ status, customLabel, className }: StatusBadgeProps) {
    const config = STATUS_MAP[status] || {
        label: customLabel || status,
        className: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                config.className,
                className
            )}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {customLabel || config.label}
        </span>
    );
}

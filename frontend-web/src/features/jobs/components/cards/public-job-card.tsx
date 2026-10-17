"use client";
import { CompanyLogo } from "@/features/companies/components/company-logo";

import Link from "next/link";
import { Building2, MapPin, Users, Calendar, ChevronRight } from "lucide-react";
import { JobPosition, WorkFormat } from "@/features/jobs/types/job.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PublicJobCardProps {
    job: JobPosition;
    isActive: boolean;
}

export function PublicJobCard({ job, isActive }: PublicJobCardProps) {
    const formatCurrency = (amount?: number) => {
        if (!amount || amount === 0) return "Thỏa thuận";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount) + " / tháng";
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Chưa cập nhật";
        try {
            return new Date(dateStr).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    const getWorkFormatBadge = (format: WorkFormat) => {
        switch (format) {
            case "ONSITE":
                return <Badge variant="brand" className="bg-sky-50 text-sky-700 border-sky-200">Trực tiếp (On-site)</Badge>;
            case "HYBRID":
                return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">Kết hợp (Hybrid)</Badge>;
            case "REMOTE":
                return <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">Từ xa (Remote)</Badge>;
            default:
                return null;
        }
    };

    // Clean HTML tags from description snippet
    const snippet = job.description 
        ? job.description.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() 
        : '';

    return (
        <div 
            className={`rounded-3xl border p-5 sm:p-6 transition-all duration-200 group ${
                isActive 
                    ? "bg-white border-slate-200/90 shadow-2xs hover:border-sky-300 hover:shadow-card-hover" 
                    : "bg-slate-50/70 border-slate-200/60 opacity-90 hover:opacity-100 hover:bg-white"
            }`}
        >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Company Logo */}
                    <div className="shrink-0">
                        <CompanyLogo src={job.company?.logoUrl} name={job.companyName} />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link 
                                href={`/jobs/${job.id}`}
                                className={`text-base font-bold transition-colors line-clamp-1 ${
                                    isActive ? "text-slate-900 group-hover:text-sky-700" : "text-slate-700 group-hover:text-slate-900"
                                }`}
                            >
                                {job.title}
                            </Link>
                            {!isActive && (
                                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 font-semibold rounded-full px-2 text-[10px]">
                                    Đã đóng nhận hồ sơ • Dành cho SV tham khảo
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                            <span className="font-semibold text-slate-800">{job.companyName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[200px]">{job.location}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-slate-500 shrink-0">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                {job.vacancies} chỉ tiêu
                            </span>
                        </div>

                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {getWorkFormatBadge(job.workFormat)}
                            <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold rounded-full px-2.5">
                                {formatCurrency(job.stipendAmount)}
                            </Badge>
                            {job.experienceLevel && (
                                <Badge variant="outline" className="text-slate-600 border-slate-200 rounded-full px-2.5">
                                    {job.experienceLevel}
                                </Badge>
                            )}
                            {job.termName && (
                                <Badge variant="outline" className="bg-sky-50/50 text-sky-800 border-sky-200/80 rounded-full px-2.5 text-[11px]">
                                    {job.termName}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Button Container */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2.5 sm:gap-3 shrink-0">
                    <div className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        Hạn: <span className="font-semibold text-slate-600">{formatDate(job.applicationDeadline || job.deadline)}</span>
                    </div>
                    <Link href={`/jobs/${job.id}`} className="shrink-0">
                        <Button 
                            variant="default"
                            size="sm"
                            className={`font-bold px-4 py-2 text-xs cursor-pointer shadow-xs whitespace-nowrap rounded-full gap-2 ${
                                isActive 
                                    ? "bg-slate-950 hover:bg-slate-900 text-white" 
                                    : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                            }`}
                        >
                            <span>{isActive ? "Chi tiết & Ứng tuyển" : "Xem yêu cầu & Kỹ năng"}</span>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center -mr-1 ${isActive ? "bg-white text-slate-950" : "bg-slate-400 text-white"}`}>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Job Brief Description */}
            <p className="mt-3.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {snippet}
            </p>

            {/* Skill tags */}
            {job.skills && job.skills.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Kỹ năng:</span>
                    {job.skills.map((s, idx) => (
                        <span 
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium hover:bg-slate-200 transition-colors"
                        >
                            {s.skillName || s.skillId}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

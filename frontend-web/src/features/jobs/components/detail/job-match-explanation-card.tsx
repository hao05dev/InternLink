"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobPosition } from "@/features/jobs/types/job.types";

interface JobMatchExplanationCardProps {
    job: JobPosition;
    studentSkills?: string[];
}

export function JobMatchExplanationCard({ job, studentSkills }: JobMatchExplanationCardProps) {
    if (job.matchScore === undefined && !job.scoreLabel) {
        return null;
    }

    const label = job.scoreLabel ?? (job.matchScore !== undefined && job.matchScore >= 75 ? "Cao" : job.matchScore !== undefined && job.matchScore >= 40 ? "Vừa" : "Thấp");
    const formatted = job.scoreFormatted ?? (job.matchScore !== undefined ? `${job.matchScore}/100` : "Chưa đủ dữ liệu");

    const colorClasses =
        label === "Cao"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : label === "Vừa"
            ? "bg-sky-50 text-sky-800 border-sky-200"
            : label === "Thấp"
            ? "bg-amber-50 text-amber-800 border-amber-200"
            : "bg-slate-100 text-slate-700 border-slate-200";

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
                    <h3 className="text-base font-bold text-slate-900">
                        Đánh giá mức độ phù hợp hồ sơ
                    </h3>
                </div>
                <Badge
                    variant="outline"
                    className={`font-bold px-3 py-1 rounded-full border text-xs sm:text-sm ${colorClasses}`}
                >
                    Điểm phù hợp: {formatted} · {label}
                </Badge>
            </div>

            {/* Eligibility Banner */}
            {job.eligibilityStatus && (
                <div className={`flex items-start gap-2.5 p-3.5 rounded-2xl border text-xs leading-relaxed ${
                    job.eligibilityStatus === "ELIGIBLE"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                }`}>
                    {job.eligibilityStatus === "ELIGIBLE" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                        <span className="font-semibold">
                            {job.eligibilityStatus === "ELIGIBLE" ? "Đủ điều kiện đăng ký vị trí: " : "Lưu ý điều kiện đăng ký: "}
                        </span>
                        <span>{job.eligibilityReason ?? "Đã kiểm tra điều kiện kỳ thực tập và danh sách sinh viên đủ tư cách."}</span>
                    </div>
                </div>
            )}

            {/* 4-Component Score & Skill Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Kỹ năng bắt buộc</span>
                        <span className="font-bold text-slate-900">
                            {job.mandatoryScore !== undefined ? `${Math.round(job.mandatoryScore * 100)}%` : "N/A"}
                        </span>
                    </div>
                    {job.matchedSkills && job.matchedSkills.length > 0 && (
                        <p className="text-slate-600">
                            <span className="text-emerald-700 font-medium">Đã có: </span>
                            {job.matchedSkills.join(", ")}
                        </p>
                    )}
                    {job.missingSkills && job.missingSkills.length > 0 && (
                        <p className="text-slate-600">
                            <span className="text-amber-700 font-medium">Cần bổ sung: </span>
                            {job.missingSkills.join(", ")}
                        </p>
                    )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Kỹ năng ưu tiên / Ngữ nghĩa</span>
                        <span className="font-bold text-slate-900">
                            {job.optionalScore !== undefined ? `${Math.round(job.optionalScore * 100)}%` : "N/A"}
                        </span>
                    </div>
                    <p className="text-slate-500">
                        Đối chiếu tiêu chí khuyến khích và ngữ nghĩa chuyên ngành nhằm tối ưu hóa sự tương thích.
                    </p>
                </div>
            </div>

            {/* Orientation Disclaimer */}
            <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400 italic">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>
                    Điểm số mang tính định hướng học tập và gợi ý tham khảo, không thay thế quyết định tuyển dụng độc lập của doanh nghiệp.
                </span>
            </div>
        </div>
    );
}

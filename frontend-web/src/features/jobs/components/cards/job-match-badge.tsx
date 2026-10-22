"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface JobMatchBadgeProps {
    matchScore?: number;
    scoreLabel?: string;
    scoreFormatted?: string;
    mandatoryScore?: number;
    optionalScore?: number;
    eligibilityStatus?: string;
    eligibilityReason?: string;
    compact?: boolean;
}

export function JobMatchBadge({
    matchScore,
    scoreLabel,
    scoreFormatted,
    mandatoryScore,
    optionalScore,
    eligibilityStatus,
    eligibilityReason,
    compact = false,
}: JobMatchBadgeProps) {
    if (matchScore === undefined && !scoreLabel) {
        return null;
    }

    const label = scoreLabel ?? (matchScore !== undefined && matchScore >= 75 ? "Cao" : matchScore !== undefined && matchScore >= 40 ? "Vừa" : "Thấp");
    const formatted = scoreFormatted ?? (matchScore !== undefined ? `${matchScore}/100` : "Chưa đủ dữ liệu");

    const colorClasses =
        label === "Cao"
            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
            : label === "Vừa"
            ? "bg-sky-50 text-sky-800 border-sky-300"
            : label === "Thấp"
            ? "bg-amber-50 text-amber-800 border-amber-300"
            : "bg-slate-100 text-slate-700 border-slate-300";

    if (compact) {
        return (
            <Badge
                variant="outline"
                className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 border ${colorClasses}`}
                title={`Điểm phù hợp: ${formatted} (${label}). Định hướng tham khảo.`}
            >
                <Sparkles className="w-3 h-3 text-sky-600 shrink-0" />
                <span>Khớp: {formatted} · {label}</span>
            </Badge>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                    variant="outline"
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5 border shadow-2xs ${colorClasses}`}
                >
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Điểm phù hợp: {formatted} · {label}</span>
                </Badge>

                {eligibilityStatus && (
                    <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            eligibilityStatus === "ELIGIBLE"
                                ? "bg-emerald-100/70 text-emerald-800"
                                : "bg-amber-100/70 text-amber-800"
                        }`}
                        title={eligibilityReason}
                    >
                        {eligibilityStatus === "ELIGIBLE" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{eligibilityStatus === "ELIGIBLE" ? "Đủ điều kiện" : "Lưu ý điều kiện"}</span>
                    </span>
                )}
            </div>

            {(mandatoryScore !== undefined || optionalScore !== undefined) && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {mandatoryScore !== undefined && (
                        <span>Bắt buộc: <strong>{Math.round(mandatoryScore * 100)}%</strong></span>
                    )}
                    {optionalScore !== undefined && (
                        <span>• Ưu tiên: <strong>{Math.round(optionalScore * 100)}%</strong></span>
                    )}
                </div>
            )}
        </div>
    );
}

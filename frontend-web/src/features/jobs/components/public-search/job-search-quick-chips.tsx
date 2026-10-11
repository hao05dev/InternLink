"use client";

import { WorkFormat } from "@/features/jobs/types/job.types";
import { DeadlineFilter } from "@/features/jobs/hooks/use-public-job-search";

interface JobSearchQuickChipsProps {
    selectedLocation: string;
    onSelectLocation: (loc: string) => void;
    selectedFormat: string;
    onSelectFormat: (fmt: string) => void;
    onlyWithStipend: boolean;
    onToggleStipend: () => void;
    deadlineFilter: DeadlineFilter;
    onSelectDeadlineFilter: (status: DeadlineFilter) => void;
}

export function JobSearchQuickChips({
    selectedLocation,
    onSelectLocation,
    selectedFormat,
    onSelectFormat,
    onlyWithStipend,
    onToggleStipend,
    deadlineFilter,
    onSelectDeadlineFilter
}: JobSearchQuickChipsProps) {
    return (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Lọc nhanh:</span>
            
            {/* Status toggle chip */}
            <button
                onClick={() => onSelectDeadlineFilter(deadlineFilter === "ACTIVE" ? "ALL" : "ACTIVE")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    deadlineFilter === "ACTIVE"
                        ? "bg-sky-700 text-white border-sky-700 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                }`}
            >
                🔥 Đang mở nhận hồ sơ
            </button>

            {/* Common Locations */}
            {["Cần Thơ", "Hồ Chí Minh", "Hà Nội", "Đà Nẵng"].map((loc) => (
                <button
                    key={loc}
                    onClick={() => onSelectLocation(selectedLocation === loc ? "ALL" : loc)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                        selectedLocation === loc
                            ? "bg-sky-700 text-white border-sky-700 shadow-2xs"
                            : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                    }`}
                >
                    📍 {loc}
                </button>
            ))}

            {/* Stipend */}
            <button
                onClick={onToggleStipend}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    onlyWithStipend
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                }`}
            >
                💰 Có phụ cấp
            </button>

            {/* Formats */}
            {(["ONSITE", "HYBRID", "REMOTE"] as WorkFormat[]).map((fmt) => (
                <button
                    key={fmt}
                    onClick={() => onSelectFormat(selectedFormat === fmt ? "ALL" : fmt)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                        selectedFormat === fmt
                            ? "bg-sky-50 text-sky-800 border-sky-300 shadow-2xs"
                            : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                    }`}
                >
                    {fmt === "ONSITE" ? "🏢 Trực tiếp" : fmt === "HYBRID" ? "⚡ Linh hoạt" : "🌐 Từ xa"}
                </button>
            ))}
        </div>
    );
}

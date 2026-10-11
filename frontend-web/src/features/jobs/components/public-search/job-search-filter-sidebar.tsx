"use client";

import { Filter, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { VIETNAM_LOCATIONS } from "@/features/jobs/data/vietnam-locations";
import { DeadlineFilter } from "@/features/jobs/hooks/use-public-job-search";
import { CustomFilterSelect } from "./custom-filter-select";

interface JobSearchFilterSidebarProps {
    deadlineFilter: DeadlineFilter;
    onSelectDeadlineFilter: (filter: DeadlineFilter) => void;
    selectedLocation: string;
    onSelectLocation: (location: string) => void;
    selectedFormat: string;
    onSelectFormat: (format: string) => void;
    selectedMajor: string;
    onSelectMajor: (major: string) => void;
    onlyWithStipend: boolean;
    onToggleStipend: (val: boolean) => void;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export function JobSearchFilterSidebar({
    deadlineFilter,
    onSelectDeadlineFilter,
    selectedLocation,
    onSelectLocation,
    selectedFormat,
    onSelectFormat,
    selectedMajor,
    onSelectMajor,
    onlyWithStipend,
    onToggleStipend,
    hasActiveFilters,
    onResetFilters
}: JobSearchFilterSidebarProps) {
    return (
        <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                        <Filter className="w-4 h-4 text-sky-700" />
                        Bộ lọc tuyển dụng
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={onResetFilters}
                            className="text-xs text-sky-700 hover:underline font-semibold cursor-pointer"
                        >
                            Đặt lại
                        </button>
                    )}
                </div>

                {/* Level 1: Deadline Status Filter (Active vs Expired) */}
                <div className="mb-5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        Tình trạng nhận hồ sơ
                    </label>
                    <div className="space-y-1">
                        {[
                            { label: "Tất cả vị trí tuyển dụng", value: "ALL" },
                            { label: "Đang mở nhận hồ sơ (Ưu tiên)", value: "ACTIVE" },
                            { label: "Đã đóng (Dành cho SV tham khảo)", value: "EXPIRED" },
                        ].map(item => (
                            <button
                                key={item.value}
                                onClick={() => onSelectDeadlineFilter(item.value as DeadlineFilter)}
                                className={`w-full text-left px-3.5 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                    deadlineFilter === item.value 
                                        ? "bg-sky-50 text-sky-800 font-bold border border-sky-200/80 shadow-2xs" 
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Level 2: Location / Province with Searchable Tailwind Custom Dropdown */}
                <div className="mb-5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        Địa điểm làm việc
                    </label>
                    <CustomFilterSelect
                        value={selectedLocation}
                        onChange={onSelectLocation}
                        options={VIETNAM_LOCATIONS}
                        icon={MapPin}
                        searchable={true}
                        searchPlaceholder="Tìm tỉnh, thành phố..."
                    />
                </div>

                {/* Level 3: Work Format Filter */}
                <div className="mb-5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Hình thức làm việc
                    </label>
                    <div className="space-y-1">
                        {[
                            { label: "Tất cả hình thức", value: "ALL" },
                            { label: "Trực tiếp tại văn phòng (On-site)", value: "ONSITE" },
                            { label: "Linh hoạt (Hybrid)", value: "HYBRID" },
                            { label: "Làm việc từ xa (Remote)", value: "REMOTE" },
                        ].map(item => (
                            <button
                                key={item.value}
                                onClick={() => onSelectFormat(item.value)}
                                className={`w-full text-left px-3.5 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                    selectedFormat === item.value 
                                        ? "bg-sky-50 text-sky-800 font-bold border border-sky-200/80 shadow-2xs" 
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Level 4: Major / Program Filter */}
                <div className="mb-5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Chuyên ngành đào tạo
                    </label>
                    <div className="space-y-1">
                        {[
                            { label: "Tất cả chuyên ngành", value: "ALL" },
                            { label: "Kỹ thuật phần mềm (SE)", value: "SE" },
                            { label: "Công nghệ thông tin (IT)", value: "IT" },
                            { label: "Khoa học máy tính (CS)", value: "CS" },
                        ].map(item => (
                            <button
                                key={item.value}
                                onClick={() => onSelectMajor(item.value)}
                                className={`w-full text-left px-3.5 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                    selectedMajor === item.value 
                                        ? "bg-sky-50 text-sky-800 font-bold border border-sky-200/80 shadow-2xs" 
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Level 5: Stipend Filter */}
                <div className="pt-3.5 border-t border-slate-100">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                        <input
                            type="checkbox"
                            checked={onlyWithStipend}
                            onChange={(e) => onToggleStipend(e.target.checked)}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-semibold text-slate-800">Chỉ hiện vị trí có hỗ trợ phụ cấp</span>
                    </label>
                </div>
            </div>

            {/* Educational Note Box */}
            <div className="bg-sky-50/80 rounded-3xl border border-sky-200/70 p-5 text-xs text-sky-900 shadow-2xs">
                <div className="flex items-center gap-2 font-bold mb-1.5 text-sky-950">
                    <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
                    Bảo trợ học phần chính thức
                </div>
                <p className="text-sky-800/90 leading-relaxed text-[11px]">
                    Tất cả vị trí được doanh nghiệp ký kết tiếp nhận qua cổng thông tin đều được Khoa CNTT&TT công nhận đạt chuẩn học phần Thực tập doanh nghiệp.
                </p>
            </div>
        </div>
    );
}

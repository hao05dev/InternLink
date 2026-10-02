'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface FilterOptions {
    programs: string[];
    lecturers: string[];
    companies: string[];
}

interface FacultyEvaluationsFilterToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    programFilter: string;
    onProgramFilterChange: (value: string) => void;
    lecturerFilter: string;
    onLecturerFilterChange: (value: string) => void;
    companyFilter: string;
    onCompanyFilterChange: (value: string) => void;
    resultFilter: string;
    onResultFilterChange: (value: string) => void;
    publishFilter: string;
    onPublishFilterChange: (value: string) => void;
    gradeFilter: string;
    onGradeFilterChange: (value: string) => void;
    filterOptions: FilterOptions;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
}

export function FacultyEvaluationsFilterToolbar({
    searchTerm,
    onSearchChange,
    programFilter,
    onProgramFilterChange,
    lecturerFilter,
    onLecturerFilterChange,
    companyFilter,
    onCompanyFilterChange,
    resultFilter,
    onResultFilterChange,
    publishFilter,
    onPublishFilterChange,
    gradeFilter,
    onGradeFilterChange,
    filterOptions,
    onResetFilters,
    hasActiveFilters,
}: FacultyEvaluationsFilterToolbarProps) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <Filter className="w-3.5 h-3.5 text-indigo-600" />
                    Bộ lọc đánh giá & điểm số
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onResetFilters}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Đặt lại bộ lọc
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search Input */}
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        placeholder="Tìm kiếm MSSV, tên, lớp, GV..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 text-xs bg-slate-50 border-slate-200"
                    />
                </div>

                {/* Program Filter */}
                <div>
                    <Select
                        value={programFilter}
                        onChange={(e) => onProgramFilterChange(e.target.value)}
                        className="text-xs bg-slate-50 border-slate-200"
                    >
                        <option value="ALL">Tất cả ngành đào tạo ({filterOptions.programs.length})</option>
                        {filterOptions.programs.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Lecturer Filter */}
                <div>
                    <Select
                        value={lecturerFilter}
                        onChange={(e) => onLecturerFilterChange(e.target.value)}
                        className="text-xs bg-slate-50 border-slate-200"
                    >
                        <option value="ALL">Tất cả Giảng viên ({filterOptions.lecturers.length})</option>
                        {filterOptions.lecturers.map((l) => (
                            <option key={l} value={l}>
                                GV: {l}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Company Filter */}
                <div>
                    <Select
                        value={companyFilter}
                        onChange={(e) => onCompanyFilterChange(e.target.value)}
                        className="text-xs bg-slate-50 border-slate-200"
                    >
                        <option value="ALL">Tất cả Doanh nghiệp ({filterOptions.companies.length})</option>
                        {filterOptions.companies.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Secondary row filters: Result, Publish, Letter grade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                    <Select
                        value={resultFilter}
                        onChange={(e) => onResultFilterChange(e.target.value)}
                        className="text-xs bg-slate-50 border-slate-200"
                    >
                        <option value="ALL">Tất cả kết quả thực tập</option>
                        <option value="PASSED">Chỉ sinh viên ĐẠT</option>
                        <option value="FAILED">Chỉ sinh viên CHƯA ĐẠT (Kém/F)</option>
                        <option value="PENDING">Đang chờ xét duyệt điểm</option>
                    </Select>
                </div>

                <div>
                    <Select
                        value={publishFilter}
                        onChange={(e) => onPublishFilterChange(e.target.value)}
                        className="text-xs bg-slate-50 border-slate-200"
                    >
                        <option value="ALL">Tất cả trạng thái công bố</option>
                        <option value="PUBLISHED">Đã công bố chính thức</option>
                        <option value="DRAFT">Đang lưu bản nháp</option>
                    </Select>
                </div>

                <div>
                    <Select
                        value={gradeFilter}
                        onChange={(e) => onGradeFilterChange(e.target.value)}
                        className="text-xs bg-slate-50 border-slate-200"
                    >
                        <option value="ALL">Tất cả thang điểm chữ CTU</option>
                        <option value="A">Loại A (Xuất sắc: 9.0 - 10)</option>
                        <option value="B+">Loại B+ (Giỏi: 8.0 - 8.9)</option>
                        <option value="B">Loại B (Khá: 7.0 - 7.9)</option>
                        <option value="C+">Loại C+ (Trung bình khá: 6.0 - 6.9)</option>
                        <option value="C">Loại C (Trung bình: 5.0 - 5.9)</option>
                        <option value="D+">Loại D+ (Trung bình yếu: 4.5 - 4.9)</option>
                        <option value="D">Loại D (Yếu: 4.0 - 4.4)</option>
                        <option value="F">Loại F (Kém / Không đạt: &lt; 4.0)</option>
                    </Select>
                </div>
            </div>
        </div>
    );
}

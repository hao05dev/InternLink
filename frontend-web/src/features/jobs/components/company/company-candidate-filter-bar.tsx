'use client';

import React from 'react';
import { Search, GraduationCap, Calendar, Briefcase, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CandidateTermOption {
    id: string;
    name: string;
    academicYear?: string;
}

export interface CandidateJobOption {
    id: string;
    title: string;
}

export interface CompanyCandidateFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;

    selectedAcademicYear: string;
    academicYearsList: string[];
    onAcademicYearChange: (value: string) => void;

    selectedTermId: string;
    termsList: CandidateTermOption[];
    onTermChange: (value: string) => void;

    selectedJobId: string;
    jobsList: CandidateJobOption[];
    onJobChange: (value: string) => void;

    statusFilter: string;
    statusStages: Array<{ id: string; label: string }>;
    onStatusFilterChange: (value: string) => void;

    totalCount: number;
    filteredCount: number;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export function CompanyCandidateFilterBar({
    searchTerm,
    onSearchChange,
    selectedAcademicYear,
    academicYearsList,
    onAcademicYearChange,
    selectedTermId,
    termsList,
    onTermChange,
    selectedJobId,
    jobsList,
    onJobChange,
    statusFilter,
    statusStages,
    onStatusFilterChange,
    totalCount,
    filteredCount,
    hasActiveFilters,
    onResetFilters,
}: CompanyCandidateFilterBarProps) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            {/* Row 1: Search + Result Counter & Reset */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm ứng viên theo tên, MSSV, vị trí, kỹ năng..."
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2.5 justify-end flex-wrap">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Đang lọc: <strong className="text-slate-900">{filteredCount}</strong> / {totalCount} ứng viên
                    </span>

                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onResetFilters}
                            className="h-8 gap-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Đặt lại bộ lọc</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Row 2: Cascading Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100">
                {/* 1. Academic Year */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Niên khóa</span>
                    </label>
                    <select
                        value={selectedAcademicYear}
                        onChange={(e) => onAcademicYearChange(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-blue-500 focus:outline-hidden"
                    >
                        <option value="ALL">Tất cả niên khóa ({academicYearsList.length})</option>
                        {academicYearsList.map((year) => (
                            <option key={year} value={year}>
                                Niên khóa {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Semester / Term */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Học kỳ</span>
                    </label>
                    <select
                        value={selectedTermId}
                        onChange={(e) => onTermChange(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-blue-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                    >
                        <option value="ALL">
                            {selectedAcademicYear === 'ALL'
                                ? `Tất cả học kỳ (${termsList.length})`
                                : `Tất cả kỳ của ${selectedAcademicYear} (${termsList.length})`}
                        </option>
                        {termsList.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Job Position */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>Vị trí tuyển dụng</span>
                    </label>
                    <select
                        value={selectedJobId}
                        onChange={(e) => onJobChange(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-blue-500 focus:outline-hidden"
                    >
                        <option value="ALL">Tất cả vị trí ({jobsList.length})</option>
                        {jobsList.map((job) => (
                            <option key={job.id} value={job.id}>
                                {job.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 4. Status Filter */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-blue-600" />
                        <span>Trạng thái ứng tuyển</span>
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-blue-500 focus:outline-hidden"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        {statusStages.map((st) => (
                            <option key={st.id} value={st.id}>
                                {st.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

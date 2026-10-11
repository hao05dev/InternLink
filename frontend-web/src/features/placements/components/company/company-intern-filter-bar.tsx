'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    Calendar,
    BookOpen,
    UserCheck,
    Briefcase,
    Clock,
    RotateCcw,
    ListFilter,
} from 'lucide-react';

export interface CompanyInternFilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;

    selectedAcademicYear: string;
    academicYearsList: string[];
    onAcademicYearChange: (value: string) => void;

    selectedTermId: string;
    availableTermsList: Array<{ id: string; name: string; academicYear?: string }>;
    onTermChange: (value: string) => void;

    selectedMentorId: string;
    mentorsList: Array<{ id: string; name: string }>;
    unassignedCount: number;
    internsCountByMentor: (mentorId: string) => number;
    onMentorChange: (value: string) => void;

    selectedJobTitle: string;
    jobsList: string[];
    internsCountByJob: (jobTitle: string) => number;
    onJobTitleChange: (value: string) => void;

    selectedTimeline: string;
    onTimelineChange: (value: string) => void;

    totalCount: number;
    filteredCount: number;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export function CompanyInternFilterBar({
    searchQuery,
    onSearchChange,
    selectedAcademicYear,
    academicYearsList,
    onAcademicYearChange,
    selectedTermId,
    availableTermsList,
    onTermChange,
    selectedMentorId,
    mentorsList,
    unassignedCount,
    internsCountByMentor,
    onMentorChange,
    selectedJobTitle,
    jobsList,
    internsCountByJob,
    onJobTitleChange,
    selectedTimeline,
    onTimelineChange,
    totalCount,
    filteredCount,
    hasActiveFilters,
    onResetFilters,
}: CompanyInternFilterBarProps) {
    return (
        <Card className="border-slate-200 bg-white shadow-2xs">
            <CardContent className="p-4 space-y-4">
                {/* Header Bar: Filter Title, Counter & Reset */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <ListFilter className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Bộ lọc tìm kiếm
                        </span>
                        {hasActiveFilters && (
                            <Badge variant="brand" className="text-[10px] px-1.5 py-0">
                                Đang lọc: {filteredCount}/{totalCount}
                            </Badge>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Đặt lại bộ lọc</span>
                        </button>
                    )}
                </div>

                {/* Filter Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {/* 1. Search Box */}
                    <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Search className="w-3 h-3 text-slate-400" />
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Tên, MSSV, Email..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-9 text-xs pl-8 bg-white"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* 2. Academic Year Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-sky-600" />
                            Niên khóa
                        </label>
                        <select
                            value={selectedAcademicYear}
                            onChange={(e) => onAcademicYearChange(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                        >
                            <option value="ALL">Tất cả niên khóa</option>
                            {academicYearsList.map((year) => (
                                <option key={year} value={year}>
                                    Năm học {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Semester / Term Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-indigo-600" />
                            Học kỳ
                        </label>
                        <select
                            value={selectedTermId}
                            onChange={(e) => onTermChange(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                        >
                            <option value="ALL">Tất cả học kỳ ({availableTermsList.length})</option>
                            {availableTermsList.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} {selectedAcademicYear === 'ALL' && t.academicYear ? `(${t.academicYear})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 4. Mentor Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            Mentor DN
                        </label>
                        <select
                            value={selectedMentorId}
                            onChange={(e) => onMentorChange(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                        >
                            <option value="ALL">Tất cả Mentor</option>
                            <option value="UNASSIGNED">⚠️ Chưa có Mentor ({unassignedCount})</option>
                            {mentorsList.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({internsCountByMentor(m.id)} SV)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 5. Job Position Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-indigo-600" />
                            Vị trí thực tập
                        </label>
                        <select
                            value={selectedJobTitle}
                            onChange={(e) => onJobTitleChange(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                        >
                            <option value="ALL">Tất cả vị trí</option>
                            {jobsList.map((job) => (
                                <option key={job} value={job}>
                                    {job} ({internsCountByJob(job)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 6. Timeline Phase Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-600" />
                            Thời gian
                        </label>
                        <select
                            value={selectedTimeline}
                            onChange={(e) => onTimelineChange(e.target.value)}
                            className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                        >
                            <option value="ALL">Tất cả thời gian</option>
                            <option value="ONGOING">Đang diễn ra</option>
                            <option value="ENDING_SOON">Sắp kết thúc (≤ 14 ngày)</option>
                            <option value="UPCOMING">Sắp bắt đầu</option>
                            <option value="FINISHED">Đã kết thúc</option>
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

'use client';

import React, { useMemo, useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, BookOpen, Layers } from 'lucide-react';

export interface FilterTermItem {
    id: string;
    code?: string;
    termName?: string;
    academicYear?: string;
    semester?: string;
    status?: string;
}

export interface AcademicTermFilterProps {
    terms: FilterTermItem[];
    selectedTermId: string;
    onTermChange: (termId: string) => void;
    /** 'grid' for 2-column card layout, 'inline' for horizontal toolbar bar, 'stacked' for compact form modal */
    variant?: 'grid' | 'inline' | 'stacked';
    showStatusBadge?: boolean;
    className?: string;
}

/**
 * Format clean Vietnamese semester title
 */
export function formatSemesterLabel(term: FilterTermItem): string {
    const sem = (term.semester || '').toString().toLowerCase();
    const name = (term.termName || '').toLowerCase();
    const code = (term.code || '').toLowerCase();

    if (sem === '1' || sem === 'hk1' || name.includes('học kỳ 1') || name.includes('hk1') || code.startsWith('hk1')) {
        return 'Học kỳ 1';
    }
    if (sem === '2' || sem === 'hk2' || name.includes('học kỳ 2') || name.includes('hk2') || code.startsWith('hk2')) {
        return 'Học kỳ 2';
    }
    if (sem === '3' || sem === 'summer' || sem === 'he' || name.includes('hè') || name.includes('hk3') || code.startsWith('hk3')) {
        return 'Học kỳ Hè (HK3)';
    }

    return term.termName || term.code || 'Học kỳ';
}

/**
 * Reusable Cascading Academic Year & Semester Selector
 * Tách biệt bộ lọc Năm học và Học kỳ để loại bỏ sự bất tiện khi chọn
 */
export function AcademicTermFilter({
    terms = [],
    selectedTermId,
    onTermChange,
    variant = 'stacked',
    showStatusBadge = true,
    className = '',
}: AcademicTermFilterProps) {
    // 1. Current selected term
    const currentTerm = useMemo(() => {
        return terms.find((t) => t.id === selectedTermId) || terms[0] || null;
    }, [terms, selectedTermId]);

    // 2. Extract list of unique academic years (sorted newest first)
    const academicYears = useMemo(() => {
        const years = new Set<string>();
        terms.forEach((t) => {
            if (t.academicYear) {
                years.add(t.academicYear.trim());
            }
        });
        return Array.from(years).sort().reverse();
    }, [terms]);

    // 3. Current selected year
    const selectedYear = currentTerm?.academicYear || academicYears[0] || '';

    // 4. Semesters available in the currently selected academic year
    const availableSemesters = useMemo(() => {
        if (!selectedYear) return terms;
        return terms.filter((t) => t.academicYear === selectedYear);
    }, [terms, selectedYear]);

    // 5. Handle year change -> switch to the best matching term in the new year
    const handleYearChange = (newYear: string) => {
        const termsInYear = terms.filter((t) => t.academicYear === newYear);
        if (termsInYear.length === 0) return;

        // Try to find active term in that year first, otherwise pick the first one
        const activeTermInYear = termsInYear.find((t) =>
            ['ACTIVE', 'REGISTRATION_OPEN', 'APPLICATION_OPEN'].includes(t.status || '')
        );
        const targetTerm = activeTermInYear || termsInYear[0];
        if (targetTerm && targetTerm.id !== selectedTermId) {
            onTermChange(targetTerm.id);
        }
    };

    // 6. Handle semester change
    const handleSemesterChange = (newTermId: string) => {
        if (newTermId && newTermId !== selectedTermId) {
            onTermChange(newTermId);
        }
    };

    if (terms.length === 0) {
        return (
            <div className={`p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 ${className}`}>
                Chưa có dữ liệu kỳ thực tập
            </div>
        );
    }

    // VARIANT: INLINE (for toolbars)
    if (variant === 'inline') {
        return (
            <div className={`flex items-center flex-wrap gap-3 ${className}`}>
                {/* Academic Year */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        Năm học:
                    </span>
                    <select
                        value={selectedYear}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
                        aria-label="Chọn năm học"
                    >
                        {academicYears.map((year) => (
                            <option key={year} value={year}>
                                Năm {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Semester */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        Học kỳ:
                    </span>
                    <select
                        value={selectedTermId}
                        onChange={(e) => handleSemesterChange(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
                        aria-label="Chọn học kỳ"
                    >
                        {availableSemesters.map((t) => (
                            <option key={t.id} value={t.id}>
                                {formatSemesterLabel(t)} {t.status === 'CLOSED' ? '(Đã đóng)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {showStatusBadge && currentTerm?.status && (
                    <Badge
                        variant={currentTerm.status === 'CLOSED' ? 'secondary' : 'brand'}
                        className="text-[10px] py-0.5"
                    >
                        {currentTerm.status}
                    </Badge>
                )}
            </div>
        );
    }

    // VARIANT: GRID (2 columns side by side)
    if (variant === 'grid') {
        return (
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        Năm học
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => handleYearChange(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
                        aria-label="Chọn năm học"
                    >
                        {academicYears.map((year) => (
                            <option key={year} value={year}>
                                Năm học {year}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            Học kỳ
                        </label>
                        {showStatusBadge && currentTerm?.status && (
                            <Badge
                                variant={currentTerm.status === 'CLOSED' ? 'secondary' : 'brand'}
                                className="text-[10px] py-0 px-1.5"
                            >
                                {currentTerm.status}
                            </Badge>
                        )}
                    </div>
                    <select
                        value={selectedTermId}
                        onChange={(e) => handleSemesterChange(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
                        aria-label="Chọn học kỳ"
                    >
                        {availableSemesters.map((t) => (
                            <option key={t.id} value={t.id}>
                                {formatSemesterLabel(t)} {t.status === 'CLOSED' ? '(Đã đóng)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }

    // DEFAULT VARIANT: STACKED (for sidebar cards and forms)
    return (
        <div className={`space-y-3 ${className}`}>
            {/* Academic Year Selection */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    1. Chọn Năm học
                </label>
                <select
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white text-xs font-semibold text-slate-800 shadow-2xs transition-colors focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                    aria-label="Chọn năm học"
                >
                    {academicYears.map((year) => (
                        <option key={year} value={year}>
                            Năm học {year}
                        </option>
                    ))}
                </select>
            </div>

            {/* Semester Selection */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        2. Chọn Học kỳ
                    </label>
                    {showStatusBadge && currentTerm?.status && (
                        <Badge
                            variant={currentTerm.status === 'CLOSED' ? 'secondary' : 'brand'}
                            className="text-[10px] py-0"
                        >
                            {currentTerm.status}
                        </Badge>
                    )}
                </div>
                <select
                    value={selectedTermId}
                    onChange={(e) => handleSemesterChange(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                    aria-label="Chọn học kỳ"
                >
                    {availableSemesters.map((t) => (
                        <option key={t.id} value={t.id}>
                            {formatSemesterLabel(t)} {t.status === 'CLOSED' ? '— (Đã đóng)' : ''}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

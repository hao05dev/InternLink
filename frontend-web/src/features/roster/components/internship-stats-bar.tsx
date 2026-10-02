'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AcademicTermFilter } from '@/components/ui/academic-term-filter';
import { BookOpen } from 'lucide-react';
import { InternshipFilterStatus } from '../types/internship-management.types';

interface InternshipStatsBarProps {
    terms: any[];
    selectedTermId: string;
    selectedTerm?: any;
    onTermChange: (termId: string) => void;
    stats: {
        total: number;
        letterReceived: number;
        companyAccepted: number;
        active: number;
    };
    statusFilter: InternshipFilterStatus;
    onStatusFilterChange: (filter: InternshipFilterStatus) => void;
}

export function InternshipStatsBar({
    terms,
    selectedTermId,
    selectedTerm,
    onTermChange,
    stats,
    statusFilter,
    onStatusFilterChange,
}: InternshipStatsBarProps) {
    const statCards: {
        label: string;
        value: number;
        color: string;
        bg: string;
        border: string;
        filter: InternshipFilterStatus;
    }[] = [
        { label: 'Tổng SV', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', filter: 'all' },
        { label: 'Đã nhận giấy', value: stats.letterReceived, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', filter: 'letter' },
        { label: 'Công ty chấp nhận', value: stats.companyAccepted, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', filter: 'accepted' },
        { label: 'Đang thực tập', value: stats.active, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', filter: 'active' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Term selector */}
            <Card className="lg:col-span-1">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <BookOpen className="w-4 h-4 text-sky-600" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Bộ lọc Học kỳ & Năm học</span>
                    </div>

                    <AcademicTermFilter
                        terms={terms}
                        selectedTermId={selectedTermId}
                        onTermChange={onTermChange}
                        variant="stacked"
                        showStatusBadge={true}
                    />
                </CardContent>
            </Card>

            {/* Stat metric buttons */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statCards.map(stat => (
                    <button
                        key={stat.label}
                        onClick={() => onStatusFilterChange(stat.filter)}
                        className={`text-left ${stat.bg} border ${stat.border} rounded-2xl p-4 transition hover:shadow-xs cursor-pointer ${
                            statusFilter === stat.filter ? 'ring-2 ring-offset-1 ring-sky-400' : ''
                        }`}
                    >
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}

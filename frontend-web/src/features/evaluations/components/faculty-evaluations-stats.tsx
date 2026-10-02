'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Users, CheckCircle2, Award, AlertCircle, GraduationCap, BookOpen } from 'lucide-react';
import { TermOption } from '../hooks/use-faculty-evaluations';

interface EvaluationStats {
    total: number;
    graded: number;
    passed: number;
    failed: number;
    published: number;
    draft: number;
    avgScore10: string;
    avgScore4: string;
    passedRate: string;
}

interface FacultyEvaluationsStatsProps {
    terms: TermOption[];
    selectedTermId: string;
    onSelectTermId: (id: string) => void;
    isLoadingTerms: boolean;
    stats: EvaluationStats;
}

export function FacultyEvaluationsStats({
    terms,
    selectedTermId,
    onSelectTermId,
    isLoadingTerms,
    stats,
}: FacultyEvaluationsStatsProps) {
    return (
        <div className="space-y-4">
            {/* Term dropdown */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-800">Chọn đợt/kỳ thực tập:</span>
                </div>
                <div className="w-full sm:w-80">
                    <Select
                        value={selectedTermId}
                        onChange={(e) => onSelectTermId(e.target.value)}
                        disabled={isLoadingTerms}
                        className="bg-slate-50 border-slate-300 font-medium text-sm"
                    >
                        {terms.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.termName} ({t.academicYear})
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Card className="border-slate-200 shadow-2xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider">Tổng sinh viên</span>
                            <Users className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Đang tham gia thực tập</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-2xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider">Đã có điểm</span>
                            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="text-2xl font-bold text-indigo-700">
                            {stats.graded} <span className="text-xs font-normal text-slate-500">/ {stats.total}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                            {stats.total > 0 ? ((stats.graded / stats.total) * 100).toFixed(0) : 0}% hoàn thành đánh giá
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-2xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider">Đạt thực tập</span>
                            <Award className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-700">
                            {stats.passed} <span className="text-xs font-normal text-slate-500">({stats.passedRate}%)</span>
                        </div>
                        <div className="text-[11px] text-emerald-600 mt-1">Đủ điều kiện công nhận học phần</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-2xs">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider">Chưa đạt / Cảnh báo</span>
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-bold text-rose-700">{stats.failed}</div>
                        <div className="text-[11px] text-rose-500 mt-1">Điểm &lt; 4.0 hoặc vi phạm quy chế</div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="text-xs font-semibold uppercase tracking-wider">Điểm TB toàn kỳ</span>
                            <GraduationCap className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {stats.avgScore10} <span className="text-xs font-normal text-slate-500">/ 10</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                            Hệ 4: <span className="font-semibold text-slate-700">{stats.avgScore4}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

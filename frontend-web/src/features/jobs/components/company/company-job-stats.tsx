'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, FileEdit, Clock, CheckCircle2, Archive } from 'lucide-react';
import { JobPosition } from '@/features/jobs/types/job.types';

interface CompanyJobStatsProps {
    jobs: JobPosition[];
}

export function CompanyJobStats({ jobs }: CompanyJobStatsProps) {
    const total = jobs.length;
    const draft = jobs.filter(j => j.status === 'DRAFT').length;
    const pending = jobs.filter(j => j.status === 'PENDING_REVIEW').length;
    const active = jobs.filter(j => j.status === 'APPROVED' || (j.status as string) === 'APPLICATION_OPEN').length;
    const closed = jobs.filter(j => j.status === 'CLOSED' || j.termStatus === 'CLOSED').length;

    const stats = [
        { label: 'Tổng tin đăng', value: total, icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Bản nháp', value: draft, icon: FileEdit, color: 'text-slate-600 bg-slate-50 border-slate-200' },
        { label: 'Chờ thẩm định', value: pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
        { label: 'Đang nhận HS', value: active, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { label: 'Đã đóng kỳ', value: closed, icon: Archive, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map((s, idx) => {
                const Icon = s.icon;
                return (
                    <Card key={idx} className="border shadow-none">
                        <CardContent className="p-3.5 flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${s.color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                                <p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

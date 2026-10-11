'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, UserX, CheckCircle2 } from 'lucide-react';

export interface CompanyInternMetricsProps {
    total: number;
    inProgress: number;
    unassignedMentor: number;
    completed: number;
}

export function CompanyInternMetrics({
    total,
    inProgress,
    unassignedMentor,
    completed,
}: CompanyInternMetricsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Tổng thực tập sinh</p>
                        <p className="text-xl font-bold text-slate-900">{total}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Đang thực tập</p>
                        <p className="text-xl font-bold text-slate-900">{inProgress}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                        <UserX className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Chưa có Mentor</p>
                        <p className="text-xl font-bold text-slate-900">{unassignedMentor}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Đã hoàn thành</p>
                        <p className="text-xl font-bold text-slate-900">{completed}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

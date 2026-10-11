'use client';

import React from 'react';
import { Users, UserCheck, Send, CheckCircle2 } from 'lucide-react';

export interface FunnelStageData {
    submitted: number;
    interviewing: number;
    offered: number;
    accepted: number;
}

interface RecruitmentFunnelChartProps {
    data: FunnelStageData;
    title?: string;
}

export function RecruitmentFunnelChart({
    data = { submitted: 0, interviewing: 0, offered: 0, accepted: 0 },
    title = 'Phễu tuyển dụng & Tiếp nhận thực tập'
}: RecruitmentFunnelChartProps) {
    const { submitted, interviewing, offered, accepted } = data;
    const base = Math.max(submitted, 1);

    const stages = [
        {
            label: '1. Hồ sơ ứng tuyển',
            count: submitted,
            percent: 100,
            icon: Users,
            color: 'bg-sky-500',
            textColor: 'text-sky-700',
            bgLight: 'bg-sky-50',
            border: 'border-sky-200'
        },
        {
            label: '2. Phỏng vấn',
            count: interviewing,
            percent: Math.round((interviewing / base) * 100),
            icon: UserCheck,
            color: 'bg-indigo-500',
            textColor: 'text-indigo-700',
            bgLight: 'bg-indigo-50',
            border: 'border-indigo-200'
        },
        {
            label: '3. Đã gửi Offer',
            count: offered,
            percent: Math.round((offered / base) * 100),
            icon: Send,
            color: 'bg-purple-500',
            textColor: 'text-purple-700',
            bgLight: 'bg-purple-50',
            border: 'border-purple-200'
        },
        {
            label: '4. Tiếp nhận thực tập',
            count: accepted,
            percent: Math.round((accepted / base) * 100),
            icon: CheckCircle2,
            color: 'bg-emerald-500',
            textColor: 'text-emerald-700',
            bgLight: 'bg-emerald-50',
            border: 'border-emerald-200'
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tỷ lệ chuyển đổi qua từng giai đoạn tuyển dụng</p>
                </div>
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    Tỷ lệ tiếp nhận: {stages[3].percent}%
                </div>
            </div>

            <div className="space-y-3 pt-1">
                {stages.map((stage, idx) => {
                    const Icon = stage.icon;
                    return (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${stage.bgLight} ${stage.textColor} border ${stage.border}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-semibold text-slate-800">{stage.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{stage.count} ứng viên</span>
                                    <span className="text-slate-400">({stage.percent}%)</span>
                                </div>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${Math.max(stage.percent, stage.count > 0 ? 5 : 0)}%` }}
                                    className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

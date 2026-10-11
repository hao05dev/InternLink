'use client';

import React from 'react';

export interface CloMetricItem {
    cloCode: string;
    description?: string;
    targetStudentsCount: number;
    passedStudentsCount: number;
    attainmentRate: number;
    averageScore?: number;
}

interface CloAchievementChartProps {
    metrics: CloMetricItem[];
    targetThreshold?: number; // default 70%
    title?: string;
}

export function CloAchievementChart({
    metrics = [],
    targetThreshold = 70.0,
    title = 'Tỷ lệ đạt Chuẩn đầu ra (CLO Attainment Rate)'
}: CloAchievementChartProps) {
    if (!metrics || metrics.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 text-xs shadow-sm">
                Chưa có dữ liệu chuẩn đầu ra cho đợt thực tập này.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Ngưỡng chuẩn quy định của Khoa: <span className="font-semibold text-slate-800">{targetThreshold}%</span>
                    </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600 font-medium">Đạt chuẩn (≥ {targetThreshold}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-slate-600 font-medium">Cần cải tiến (&lt; {targetThreshold}%)</span>
                    </div>
                </div>
            </div>

            {/* List of CLOs with attainment bars */}
            <div className="space-y-3.5 pt-1">
                {metrics.map(metric => {
                    const rate = metric.attainmentRate ?? 0;
                    const isTargetMet = rate >= targetThreshold;
                    const colorClass = isTargetMet ? 'bg-emerald-500' : 'bg-rose-500';
                    const badgeClass = isTargetMet ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200';

                    return (
                        <div key={metric.cloCode} className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold px-2 py-0.5 rounded-md border text-xs ${badgeClass}`}>
                                        {metric.cloCode}
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {metric.passedStudentsCount} / {metric.targetStudentsCount} sinh viên đạt
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {metric.averageScore != null && (
                                        <span className="text-slate-400 font-normal">
                                            Điểm TB: <strong className="text-slate-700">{metric.averageScore.toFixed(1)}</strong>
                                        </span>
                                    )}
                                    <span className={`font-bold text-sm ${isTargetMet ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {rate.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar with threshold indicator */}
                            <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${Math.min(rate, 100)}%` }}
                                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                                />
                                {/* Target Threshold Line */}
                                <div
                                    style={{ left: `${targetThreshold}%` }}
                                    className="absolute top-0 bottom-0 w-0.5 bg-slate-700/60 z-10"
                                    title={`Ngưỡng mục tiêu: ${targetThreshold}%`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

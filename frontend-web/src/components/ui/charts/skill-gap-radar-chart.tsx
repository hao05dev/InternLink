'use client';

import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

export interface SkillComparisonItem {
    skillName: string;
    category?: string;
    studentProficiency: number; // 0 to 100
    marketDemand: number; // 0 to 100
}

interface SkillGapRadarChartProps {
    skills: SkillComparisonItem[];
    title?: string;
}

export function SkillGapRadarChart({
    skills = [],
    title = 'Đối sánh năng lực sinh viên & Nhu cầu doanh nghiệp (AI Skill Gap)'
}: SkillGapRadarChartProps) {
    if (!skills || skills.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Khoảng cách năng lực giữa hồ sơ sinh viên và yêu cầu tuyển dụng</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-indigo-600" />
                        <span className="text-slate-600 font-medium">Năng lực sinh viên</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-slate-600 font-medium">Yêu cầu thị trường</span>
                    </div>
                </div>
            </div>

            {/* Comparison bars */}
            <div className="space-y-4 pt-1">
                {skills.map(item => {
                    const diff = item.studentProficiency - item.marketDemand;
                    const isSufficient = diff >= 0;

                    return (
                        <div key={item.skillName} className="space-y-2 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">{item.skillName}</span>
                                    {item.category && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-200/70 text-slate-600 rounded">
                                            {item.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 font-medium">
                                    {isSufficient ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                                            <CheckCircle className="w-3 h-3" /> Đạt yêu cầu
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                                            <AlertTriangle className="w-3 h-3" /> Thiếu {Math.abs(diff)}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Dual Bar Comparison */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[11px]">
                                    <span className="w-20 text-slate-500 shrink-0">Sinh viên:</span>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${Math.min(item.studentProficiency, 100)}%` }}
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                        />
                                    </div>
                                    <span className="w-9 text-right font-bold text-indigo-700">{item.studentProficiency}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px]">
                                    <span className="w-20 text-slate-500 shrink-0">Yêu cầu:</span>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${Math.min(item.marketDemand, 100)}%` }}
                                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                        />
                                    </div>
                                    <span className="w-9 text-right font-bold text-amber-700">{item.marketDemand}%</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

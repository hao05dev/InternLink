'use client';

import React from 'react';

interface CtuGradeChartProps {
    data: Record<string, number>;
    totalEvaluated?: number;
    title?: string;
}

const GRADE_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
    'A': { bar: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    'B+': { bar: 'bg-teal-500 hover:bg-teal-600', text: 'text-teal-700', bg: 'bg-teal-50' },
    'B': { bar: 'bg-sky-500 hover:bg-sky-600', text: 'text-sky-700', bg: 'bg-sky-50' },
    'C+': { bar: 'bg-blue-500 hover:bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50' },
    'C': { bar: 'bg-indigo-500 hover:bg-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50' },
    'D+': { bar: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-700', bg: 'bg-amber-50' },
    'D': { bar: 'bg-orange-500 hover:bg-orange-600', text: 'text-orange-700', bg: 'bg-orange-50' },
    'F': { bar: 'bg-rose-500 hover:bg-rose-600', text: 'text-rose-700', bg: 'bg-rose-50' },
};

const ORDERED_GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];

export function CtuGradeChart({ data = {}, totalEvaluated, title = 'Phổ điểm chữ chuẩn CTU' }: CtuGradeChartProps) {
    const total = totalEvaluated ?? Object.values(data).reduce((acc, v) => acc + (v || 0), 0);
    const maxVal = Math.max(...ORDERED_GRADES.map(g => data[g] || 0), 1);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tổng số sinh viên đã đánh giá: <span className="font-semibold text-slate-800">{total}</span></p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        A: Xuất sắc
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                        B: Khá / Giỏi
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        F: Không đạt
                    </span>
                </div>
            </div>

            {/* Bar Chart Area */}
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
                {ORDERED_GRADES.map(grade => {
                    const count = data[grade] || 0;
                    const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                    const heightPercent = maxVal > 0 ? (count / maxVal) * 100 : 0;
                    const color = GRADE_COLORS[grade] || { bar: 'bg-slate-500', text: 'text-slate-700', bg: 'bg-slate-50' };

                    return (
                        <div key={grade} className="flex-1 flex flex-col items-center h-full justify-end group">
                            {/* Value tooltip label above bar */}
                            <span className="text-[11px] font-bold text-slate-700 mb-1 group-hover:scale-110 transition-transform">
                                {count}
                            </span>
                            
                            {/* Bar container */}
                            <div className="w-full max-w-[42px] h-32 bg-slate-100 rounded-t-lg flex items-end p-0.5 overflow-hidden">
                                <div
                                    style={{ height: `${Math.max(heightPercent, count > 0 ? 8 : 2)}%` }}
                                    className={`w-full rounded-t-md transition-all duration-500 ${color.bar}`}
                                    title={`${grade}: ${count} sinh viên (${percent}%)`}
                                />
                            </div>

                            {/* X-axis Label */}
                            <div className="mt-2 text-center">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}>
                                    {grade}
                                </span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">
                                    {percent}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

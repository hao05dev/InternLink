'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';
import type { CandidateApplication } from '@/features/jobs/types/application.types';

export interface CandidateKanbanCardProps {
    candidate: CandidateApplication;
    isDragging: boolean;
    onViewCv: (cand: CandidateApplication) => void;
    onReject: (cand: CandidateApplication) => void;
}

export function CandidateKanbanCard({
    candidate,
    isDragging,
    onViewCv,
    onReject,
}: CandidateKanbanCardProps) {
    return (
        <div
            className={`group rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all ${
                isDragging ? 'opacity-40 scale-95 border-blue-400 rotate-1 shadow-lg' : ''
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {candidate.studentName}
                    </h4>
                    <p className="text-[11px] font-medium text-blue-700 truncate mt-0.5">
                        {candidate.jobTitle}
                    </p>
                </div>
                <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
            </div>

            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span className="font-mono font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                    {candidate.studentCode}
                </span>
                {candidate.gpa && (
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        GPA {candidate.gpa.toFixed(2)}
                    </span>
                )}
            </div>

            {candidate.skills && candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {candidate.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                            {s}
                        </span>
                    ))}
                    {candidate.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{candidate.skills.length - 3}</span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-100">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewCv(candidate);
                    }}
                    className="px-2 py-1 rounded text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                    Xem CV
                </button>
                {candidate.status !== 'REJECTED' && candidate.status !== 'OFFERED' && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onReject(candidate);
                        }}
                        className="px-2 py-1 rounded text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        Từ chối
                    </button>
                )}
            </div>
        </div>
    );
}

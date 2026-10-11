'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Eye, Clock } from 'lucide-react';
import type { CandidateApplication } from '@/features/jobs/types/application.types';

export interface CandidateTableRowCardProps {
    candidate: CandidateApplication;
    onViewDetail: (cand: CandidateApplication) => void;
    onScheduleInterview: (cand: CandidateApplication) => void;
    onReject: (cand: CandidateApplication) => void;
}

export function CandidateTableRowCard({
    candidate,
    onViewDetail,
    onScheduleInterview,
    onReject,
}: CandidateTableRowCardProps) {
    return (
        <Card className="hover:border-slate-300 transition-colors shadow-2xs">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-bold text-sm text-slate-900">{candidate.studentName}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                MSSV: {candidate.studentCode}
                            </span>
                            <span className="text-xs text-slate-500">{candidate.programName}</span>
                            {candidate.gpa && (
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    GPA: {candidate.gpa.toFixed(2)}
                                </span>
                            )}
                            <StatusBadge status={candidate.status} type="application" />
                        </div>

                        <p className="text-xs font-medium text-slate-700">
                            Vị trí: <span className="font-semibold text-blue-700">{candidate.jobTitle}</span>
                        </p>

                        {candidate.skills && candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                                {candidate.skills.map((s, idx) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] py-0.2">
                                        {s}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetail(candidate)}
                            className="gap-1.5 text-xs"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem CV</span>
                        </Button>

                        {(candidate.status === 'PENDING' || candidate.status === 'SHORTLISTED') && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onScheduleInterview(candidate)}
                                className="gap-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Lịch phỏng vấn</span>
                            </Button>
                        )}

                        {candidate.status !== 'REJECTED' && candidate.status !== 'OFFERED' && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onReject(candidate)}
                                className="text-xs"
                            >
                                Từ chối
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

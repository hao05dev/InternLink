'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import {
    GraduationCap,
    UserCheck,
    Calendar,
    Briefcase,
    Mail,
    Phone,
    UserX,
} from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

export interface CompanyInternCardProps {
    intern: InternshipPlacement;
}

export function CompanyInternCard({ intern }: CompanyInternCardProps) {
    const now = new Date();
    const start = intern.startDate ? new Date(intern.startDate) : null;
    const end = intern.endDate ? new Date(intern.endDate) : null;
    let progress = 0;
    if (start && end && end > start) {
        const total = end.getTime() - start.getTime();
        const current = now.getTime() - start.getTime();
        progress = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
    }

    return (
        <Card className="hover:border-slate-300 transition-all shadow-2xs hover:shadow-sm">
            <CardContent className="p-5 space-y-4">
                {/* Student Info & Status */}
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                            <h2 className="font-bold text-base text-slate-900">
                                {intern.studentName}
                            </h2>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                MSSV: {intern.studentCode || 'N/A'}
                            </span>
                        </div>

                        {(intern.studentEmail || intern.studentPhone) && (
                            <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500 pt-0.5">
                                {intern.studentEmail && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        {intern.studentEmail}
                                    </span>
                                )}
                                {intern.studentPhone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        {intern.studentPhone}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <StatusBadge status={intern.status} type="placement" />
                </div>

                {/* Position & Job details */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="font-medium text-slate-500">Vị trí trúng tuyển:</span>
                        </div>
                        {intern.source && (
                            <Badge variant="outline" className="text-[10px] py-0">
                                {intern.source === 'PARTNER_PORTAL' ? 'Cổng CICT' : 'Tự liên hệ'}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-sm text-slate-900">
                            {intern.jobTitle || 'Chưa cập nhật vị trí'}
                        </span>
                        {intern.workFormat && (
                            <Badge variant="brand" className="text-[10px] py-0">
                                {intern.workFormat}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Mentors & Lecturer info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Mentor DN */}
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold">Mentor Doanh Nghiệp:</span>
                        </div>
                        {intern.mentorName ? (
                            <div>
                                <p className="font-bold text-slate-900">{intern.mentorName}</p>
                                {intern.mentorEmail && (
                                    <p className="text-[11px] text-slate-500 truncate">{intern.mentorEmail}</p>
                                )}
                            </div>
                        ) : (
                            <span className="text-amber-600 font-semibold italic flex items-center gap-1">
                                <UserX className="w-3.5 h-3.5" />
                                Chưa phân công
                            </span>
                        )}
                    </div>

                    {/* Lecturer CICT */}
                    <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold">GVHD Khoa CICT:</span>
                        </div>
                        <p className="font-bold text-slate-900">
                            {intern.lecturerName || 'Khoa đang chỉ định'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                            {intern.termName ? `${intern.termName}` : 'Kỳ thực tập'}
                        </p>
                    </div>
                </div>

                {/* Timeline & Progress */}
                {intern.startDate && intern.endDate && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(intern.startDate).toLocaleDateString('vi-VN')} –{' '}
                                {new Date(intern.endDate).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="font-bold text-slate-700">{progress}% thời gian</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all rounded-full ${
                                    progress >= 100
                                        ? 'bg-emerald-500'
                                        : progress > 0
                                        ? 'bg-blue-600'
                                        : 'bg-slate-300'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

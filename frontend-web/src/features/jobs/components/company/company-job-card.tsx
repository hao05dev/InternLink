'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { MapPin, Users, DollarSign, Send, Edit3, Eye, Paperclip } from 'lucide-react';
import { JobPosition } from '@/features/jobs/types/job.types';

interface CompanyJobCardProps {
    job: JobPosition;
    onSubmitReview: (jobId: string, title: string, isClosed?: boolean) => void;
    isSubmittingReview?: boolean;
}

export function CompanyJobCard({ job, onSubmitReview, isSubmittingReview }: CompanyJobCardProps) {
    const isClosed = job.termStatus === 'CLOSED' || job.status === 'CLOSED';
    const canEdit = (job.status === 'DRAFT' || job.status === 'REJECTED') && !isClosed;
    const canSubmit = job.status === 'DRAFT' && !isClosed;

    return (
        <Card className="hover:border-slate-300 transition-colors overflow-hidden">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                {job.bannerUrl && (
                    <div className="w-full md:w-32 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img src={job.bannerUrl} alt={job.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/company/jobs/${job.id}`} className="font-bold text-sm text-slate-900 hover:text-sky-700 transition-colors line-clamp-1">
                            {job.title}
                        </Link>
                        <StatusBadge status={job.status} type="job" />
                        {job.termName && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                {job.termName}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="line-clamp-1">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Chỉ tiêu: {job.vacancies} SV</span>
                        </div>
                        {job.stipendAmount ? (
                            <div className="flex items-center gap-1 font-medium text-emerald-700">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{job.stipendAmount.toLocaleString('vi-VN')} đ/tháng</span>
                            </div>
                        ) : null}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {job.skills && job.skills.map((s, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] py-0">
                                {s.skillName || (s as any).name || s.skillId}
                            </Badge>
                        ))}
                        {job.attachmentUrls && job.attachmentUrls.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                <Paperclip className="w-3 h-3" />
                                {job.attachmentUrls.length} tệp
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <Link href={`/company/jobs/${job.id}`}>
                            <Button variant="secondary" size="sm" className="gap-1 text-xs h-8">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem</span>
                            </Button>
                        </Link>
                        {canEdit && (
                            <Link href={`/company/jobs/${job.id}/edit`}>
                                <Button variant="secondary" size="sm" className="gap-1 text-xs h-8">
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Sửa</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                    {canSubmit && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onSubmitReview(job.id, job.title, isClosed)}
                            disabled={isSubmittingReview}
                            className="gap-1.5 text-xs h-8 w-full md:w-auto"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>Gửi duyệt</span>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

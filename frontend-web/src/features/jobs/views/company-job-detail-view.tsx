'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { ArrowLeft, Edit3, Send, MapPin, Users, DollarSign, Clock, AlertCircle, Paperclip } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobPosition } from '@/features/jobs/types/job.types';
import { MediaRichContent } from '@/components/ui/media-rich-content';

interface CompanyJobDetailViewProps {
    jobId: string;
}

export function CompanyJobDetailView({ jobId }: CompanyJobDetailViewProps) {
    const [job, setJob] = useState<JobPosition | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDetail() {
            try {
                const res = await apiClient.get<JobPosition>(`/api/v1/jobs/${jobId}`);
                if (res.data) setJob(res.data);
            } catch {
                // Not found
            } finally {
                setIsLoading(false);
            }
        }
        fetchDetail();
    }, [jobId]);

    const handleSubmitReview = async () => {
        if (!job) return;
        try {
            await apiClient.patch(`/api/v1/jobs/${job.id}/submit`);
            setJob((prev) => (prev ? { ...prev, status: 'PENDING_REVIEW' } : null));
            setMessage('Đã gửi tin lên Ban Quản lý Khoa phê duyệt.');
        } catch {
            setMessage('Không thể gửi tin tuyển dụng.');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Đang tải chi tiết tin tuyển dụng...</div>;
    if (!job) return <div className="p-8 text-center text-slate-500">Không tìm thấy thông tin vị trí tuyển dụng.</div>;

    const isClosed = job.termStatus === 'CLOSED' || job.status === 'CLOSED';
    const canEdit = (job.status === 'DRAFT' || job.status === 'REJECTED') && !isClosed;

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between gap-4">
                <Link href="/company/jobs">
                    <Button variant="ghost" size="sm" className="gap-2 text-xs">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại danh sách</span>
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Link href={`/company/jobs/${job.id}/edit`}>
                            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                                <Edit3 className="w-4 h-4" />
                                <span>Chỉnh sửa tin</span>
                            </Button>
                        </Link>
                    )}
                    {(job.status === 'DRAFT' || job.status === 'REJECTED') && !isClosed && (
                        <Button variant="primary" size="sm" onClick={handleSubmitReview} className="gap-1.5 text-xs">
                            <Send className="w-4 h-4" />
                            <span>{job.status === 'REJECTED' ? 'Gửi lại duyệt Khoa' : 'Gửi duyệt Khoa'}</span>
                        </Button>
                    )}
                </div>
            </div>

            {message && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">{message}</div>}

            {job.facultyFeedback && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-amber-900">Ý kiến phản hồi từ Ban Quản lý Khoa:</p>
                        <p className="text-xs text-amber-800 mt-1">{job.facultyFeedback}</p>
                    </div>
                </div>
            )}

            <Card className="border border-slate-200">
                <CardHeader className="p-6 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <StatusBadge status={job.status} type="job" />
                        {job.termName && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{job.termName}</span>}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{job.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div><p className="text-slate-500">Hình thức</p><p className="font-semibold text-slate-800 mt-0.5">{job.workFormat}</p></div>
                        <div><p className="text-slate-500">Chỉ tiêu</p><p className="font-semibold text-slate-800 mt-0.5">{job.vacancies} SV</p></div>
                        <div><p className="text-slate-500">Phụ cấp</p><p className="font-semibold text-emerald-700 mt-0.5">{job.stipendAmount && job.stipendAmount > 0 ? `${job.stipendAmount.toLocaleString('vi-VN')} đ/tháng` : 'Thỏa thuận'}</p></div>
                        <div><p className="text-slate-500">Địa điểm</p><p className="font-semibold text-slate-800 mt-0.5 line-clamp-1">{job.location}</p></div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Mô tả công việc & Yêu cầu:</h3>
                        <div className="text-xs text-slate-700 leading-relaxed p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                            <MediaRichContent text={job.description} />
                        </div>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2">Kỹ năng yêu cầu:</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((s, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{s.skillName || (s as any).name || s.skillId}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

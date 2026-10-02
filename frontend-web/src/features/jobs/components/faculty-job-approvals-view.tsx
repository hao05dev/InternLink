'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import {
    CheckSquare,
    Building2,
    MapPin,
    DollarSign,
    Users,
    CheckCircle2,
    XCircle,
    Eye,
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import type { JobPosition, JobStatus } from '@/features/jobs/types/recruitment.types';

export default function FacultyJobApprovalsView() {
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewModalJob, setReviewModalJob] = useState<JobPosition | null>(null);
    const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
    const [feedback, setFeedback] = useState('Nội dung công việc phù hợp với chuẩn đầu ra đào tạo của Khoa.');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchPendingJobs() {
            try {
                const res = await apiClient.get<JobPosition[]>('/api/v1/jobs');
                if (res.data && Array.isArray(res.data)) {
                    // Filter pending jobs for faculty review
                    const pending = res.data.filter(j => j.status === 'PENDING_APPROVAL');
                    setJobs(pending);
                } else {
                    setJobs([]);
                }
            } catch {
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPendingJobs();
    }, []);

    const handleOpenReview = (job: JobPosition, dec: 'APPROVED' | 'REJECTED') => {
        setReviewModalJob(job);
        setDecision(dec);
        setFeedback(dec === 'APPROVED'
            ? 'Vị trí thực tập đáp ứng tốt mục tiêu đào tạo của Trường CNTT&TT. Phê duyệt cho phép sinh viên ứng tuyển.'
            : 'Yêu cầu doanh nghiệp bổ sung chi tiết hơn về quyền lợi và mô tả các công việc sinh viên sẽ được hướng dẫn.');
    };

    const handleSubmitDecision = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewModalJob) return;

        setIsSubmitting(true);
        try {
            await apiClient.patch(
                `/api/v1/jobs/${reviewModalJob.id}/review?status=${decision}&feedback=${encodeURIComponent(feedback)}`
            );

            setJobs(prev => prev.filter(j => j.id !== reviewModalJob.id));
            setMessage({
                type: 'success',
                text: decision === 'APPROVED'
                    ? `Đã phê duyệt vị trí "${reviewModalJob.title}" của ${reviewModalJob.companyName || 'doanh nghiệp'}. Tin đã mở nhận hồ sơ.`
                    : `Đã từ chối vị trí "${reviewModalJob.title}" và gửi phản hồi đến doanh nghiệp.`,
            });
            setReviewModalJob(null);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thẩm định tin tuyển dụng.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Phê Duyệt Tin Tuyển Dụng Doanh Nghiệp
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Thẩm định nội dung công việc và yêu cầu tuyển dụng từ các doanh nghiệp đối tác trước khi công bố cho sinh viên.
                </p>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Đóng thông báo"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Pending List */}
            {jobs.length === 0 ? (
                <EmptyState
                    title="Không có tin tuyển dụng nào cần duyệt"
                    description="Tất cả vị trí thực tập đã được Ban Quản lý Khoa xem xét và thẩm định xong."
                />
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <Card key={job.id} className="hover:border-slate-300 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-2.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="font-bold text-base text-slate-900">{job.title}</span>
                                            <StatusBadge status={job.status} type="job" />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                                <Building2 className="w-4 h-4 text-blue-600" />
                                                <span>{job.companyName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                <span>Chỉ tiêu: {job.vacancies}</span>
                                            </div>
                                            {job.stipendAmount ? (
                                                <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>{job.stipendAmount.toLocaleString('vi-VN')} đ/tháng</span>
                                                </div>
                                            ) : null}
                                        </div>

                                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            {job.description}
                                        </p>

                                        {/* Skills tags */}
                                        {job.skills && job.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {job.skills.map((s, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[11px] py-0.5">
                                                        {s.skillName}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-start">
                                        {job.termStatus === 'CLOSED' ? (
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium">
                                                Kỳ đã kết thúc (CLOSED)
                                            </span>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleOpenReview(job, 'APPROVED')}
                                                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Phê duyệt</span>
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleOpenReview(job, 'REJECTED')}
                                                    className="gap-1.5 text-xs"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>Từ chối</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Review Decision Modal */}
            <Modal
                isOpen={!!reviewModalJob}
                onClose={() => setReviewModalJob(null)}
                title={decision === 'APPROVED' ? 'Xác nhận phê duyệt tin tuyển dụng' : 'Từ chối tin tuyển dụng'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmitDecision} className="space-y-4">
                    <p className="text-xs text-slate-600">
                        {decision === 'APPROVED'
                            ? `Bạn đang phê duyệt vị trí "${reviewModalJob?.title}" của doanh nghiệp ${reviewModalJob?.companyName}. Vị trí này sẽ xuất hiện công khai trên Cổng Thực tập để sinh viên nộp hồ sơ.`
                            : `Bạn đang từ chối vị trí "${reviewModalJob?.title}". Vui lòng ghi rõ lý do để doanh nghiệp điều chỉnh.`}
                    </p>

                    <Textarea
                        label="Ý kiến thẩm định của Ban Quản lý Khoa"
                        id="reviewFeedback"
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setReviewModalJob(null)}
                            disabled={isSubmitting}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant={decision === 'APPROVED' ? 'primary' : 'danger'}
                            isLoading={isSubmitting}
                            className={decision === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        >
                            {decision === 'APPROVED' ? 'Xác nhận Phê duyệt' : 'Xác nhận Từ chối'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

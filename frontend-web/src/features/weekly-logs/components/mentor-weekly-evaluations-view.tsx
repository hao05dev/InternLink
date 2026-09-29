'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
    CheckSquare,
    User,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Send,
    Edit3
} from 'lucide-react';
import type { WeeklyLogbook, LogbookStatus } from '@/features/weekly-logs/types/weekly-log.types';

interface MentorLogbookItem extends WeeklyLogbook {
    studentName: string;
    studentCode: string;
}

export default function MentorWeeklyEvaluationsView() {
    const [logs, setLogs] = useState<MentorLogbookItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewModalLog, setReviewModalLog] = useState<MentorLogbookItem | null>(null);
    const [reviewStatus, setReviewStatus] = useState<LogbookStatus>('APPROVED');
    const [mentorFeedback, setMentorFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchMentorLogbooks() {
            try {
                const plcRes = await apiClient.get<any[]>('/api/v1/placements/mentor/my-students');
                if (plcRes.data && Array.isArray(plcRes.data) && plcRes.data.length > 0) {
                    const allLogs: MentorLogbookItem[] = [];
                    for (const plc of plcRes.data) {
                        try {
                            const logRes = await apiClient.get<WeeklyLogbook[]>(`/api/v1/logbooks/placement/${plc.id}`);
                            if (logRes.data && Array.isArray(logRes.data)) {
                                for (const l of logRes.data) {
                                    allLogs.push({
                                        ...l,
                                        studentName: plc.studentName || 'Sinh viên',
                                        studentCode: plc.studentCode || '',
                                    });
                                }
                            }
                        } catch {
                            // Single placement log fetch failed
                        }
                    }
                    setLogs(allLogs);
                } else {
                    setLogs([]);
                }
            } catch {
                setLogs([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMentorLogbooks();
    }, []);

    const handleOpenReview = (log: MentorLogbookItem) => {
        setReviewModalLog(log);
        setReviewStatus(log.status === 'SUBMITTED' ? 'APPROVED' : log.status);
        setMentorFeedback(log.mentorFeedback || '');
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewModalLog) return;

        setIsSubmitting(true);
        try {
            await apiClient.patch(
                `/api/v1/logbooks/${reviewModalLog.id}/mentor-review?status=${reviewStatus}&mentorFeedback=${encodeURIComponent(mentorFeedback)}`
            );

            setLogs(prev =>
                prev.map(l =>
                    l.id === reviewModalLog.id
                        ? {
                              ...l,
                              status: reviewStatus,
                              mentorFeedback,
                              mentorReviewedAt: new Date().toISOString(),
                          }
                        : l
                )
            );
            setMessage({
                type: 'success',
                text: `Đã cập nhật nhận xét nhật ký Tuần ${reviewModalLog.weekNumber} của sinh viên ${reviewModalLog.studentName}.`,
            });
            setReviewModalLog(null);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật nhận xét.';
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
                    Duyệt Nhật Ký Tuần (Weekly Logbook)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Theo dõi công việc thực tế hàng tuần của thực tập sinh và ghi nhận xét đánh giá chuyên môn.
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

            {/* Logs List */}
            {logs.length === 0 ? (
                <EmptyState
                    title="Chưa có nhật ký tuần nào cần duyệt"
                    description="Hiện chưa có sinh viên nào nộp nhật ký tuần mới."
                />
            ) : (
                <div className="space-y-4">
                    {logs.map((log) => (
                        <Card key={log.id} className="hover:border-slate-300 transition-colors">
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                                            T{log.weekNumber}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <span>{log.studentName}</span>
                                                <span className="text-xs font-normal text-slate-500">
                                                    (MSSV: {log.studentCode})
                                                </span>
                                            </CardTitle>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                <span>Tuần {log.weekNumber}</span>
                                                <span>•</span>
                                                <span>
                                                    {new Date(log.periodStart).toLocaleDateString('vi-VN')} – {new Date(log.periodEnd).toLocaleDateString('vi-VN')}
                                                </span>
                                                <span>•</span>
                                                <span>{log.totalHours} giờ</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={log.status} type="logbook" />
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleOpenReview(log)}
                                            className="gap-1.5 text-xs"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                            <span>{log.mentorFeedback ? 'Sửa nhận xét' : 'Đánh giá'}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Công việc sinh viên đã hoàn thành:
                                    </h4>
                                    <p className="text-xs text-slate-800 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        {log.tasksCompleted}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Bài học kinh nghiệm & Vấn đề giải quyết:
                                    </h4>
                                    <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        {log.learningReflection}
                                    </p>
                                </div>

                                {log.mentorFeedback && (
                                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                                        <span className="text-[11px] font-bold text-emerald-900 block">
                                            Nhận xét hiện tại của Mentor:
                                        </span>
                                        <p className="text-xs text-emerald-900">&ldquo;{log.mentorFeedback}&rdquo;</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            <Modal
                isOpen={!!reviewModalLog}
                onClose={() => setReviewModalLog(null)}
                title={`Đánh giá nhật ký Tuần ${reviewModalLog?.weekNumber}: ${reviewModalLog?.studentName}`}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    <Select
                        label="Trạng thái đánh giá"
                        id="reviewStatus"
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value as LogbookStatus)}
                        options={[
                            { value: 'APPROVED', label: 'Chấp thuận (Đạt yêu cầu)' },
                            { value: 'NEEDS_REVISION', label: 'Yêu cầu sinh viên bổ sung' },
                            { value: 'REJECTED', label: 'Không chấp thuận (Chưa đạt)' },
                        ]}
                        required
                    />

                    <Textarea
                        label="Nhận xét của Cán bộ hướng dẫn (Mentor)"
                        id="mentorFeedback"
                        rows={4}
                        value={mentorFeedback}
                        onChange={(e) => setMentorFeedback(e.target.value)}
                        placeholder="Nêu nhận xét về thái độ làm việc, tiến độ hoàn thành và chất lượng kỹ thuật trong tuần..."
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setReviewModalLog(null)}
                            disabled={isSubmitting}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            className="gap-2"
                        >
                            <CheckSquare className="w-4 h-4" />
                            <span>Lưu đánh giá</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

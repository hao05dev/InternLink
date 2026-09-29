'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
    CheckSquare,
    MessageSquare,
    UserCheck,
    Calendar,
    Clock,
    CheckCircle2,
    Building2,
    Send
} from 'lucide-react';
import type { WeeklyLogbook } from '@/features/weekly-logs/types/weekly-log.types';

interface SupervisionLogItem extends WeeklyLogbook {
    studentName: string;
    studentCode: string;
    companyName: string;
}

export default function LecturerSupervisionView() {
    const [logs, setLogs] = useState<SupervisionLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [commentModalLog, setCommentModalLog] = useState<SupervisionLogItem | null>(null);
    const [lecturerComment, setLecturerComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchLecturerLogs() {
            try {
                const plcRes = await apiClient.get<any[]>('/api/v1/placements/lecturer/my-students');
                if (plcRes.data && Array.isArray(plcRes.data) && plcRes.data.length > 0) {
                    const allLogs: SupervisionLogItem[] = [];
                    for (const plc of plcRes.data) {
                        try {
                            const logRes = await apiClient.get<WeeklyLogbook[]>(`/api/v1/logbooks/placement/${plc.id}`);
                            if (logRes.data && Array.isArray(logRes.data)) {
                                for (const l of logRes.data) {
                                    allLogs.push({
                                        ...l,
                                        studentName: plc.studentName || 'Sinh viên',
                                        studentCode: plc.studentCode || '',
                                        companyName: plc.companyName || 'Doanh nghiệp',
                                    });
                                }
                            }
                        } catch {
                            // single placement fetch failure
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

        fetchLecturerLogs();
    }, []);

    const handleOpenComment = (log: SupervisionLogItem) => {
        setCommentModalLog(log);
        setLecturerComment(log.lecturerComment || 'Ghi nhận tiến độ công việc tuần của sinh viên. Đề nghị tiếp tục duy trì việc cập nhật nhật ký định kỳ.');
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentModalLog) return;

        setIsSubmitting(true);
        try {
            await apiClient.patch(
                `/api/v1/logbooks/${commentModalLog.id}/lecturer-comment?lecturerComment=${encodeURIComponent(lecturerComment)}`
            );

            setLogs(prev =>
                prev.map(l =>
                    l.id === commentModalLog.id
                        ? {
                              ...l,
                              lecturerComment,
                              lecturerCommentedAt: new Date().toISOString(),
                          }
                        : l
                )
            );
            setMessage({
                type: 'success',
                text: `Đã lưu ý kiến nhận xét của GVHD cho nhật ký Tuần ${commentModalLog.weekNumber} của sinh viên ${commentModalLog.studentName}.`,
            });
            setCommentModalLog(null);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi nhận xét GVHD.';
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
                    Theo Dõi & Nhận Xét Thực Tập (Lecturer Supervision)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Kiểm tra tiến độ thực tập hàng tuần, xem nhận xét từ Cán bộ hướng dẫn Doanh nghiệp và gửi phản hồi định hướng cho sinh viên.
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
            <div className="space-y-4">
                {logs.map((log) => (
                    <Card key={log.id} className="hover:border-slate-300 transition-colors">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-base text-slate-900">
                                            {log.studentName}
                                        </CardTitle>
                                        <span className="text-xs text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                                            MSSV: {log.studentCode}
                                        </span>
                                        <StatusBadge status={log.status} type="logbook" />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span className="font-medium text-slate-700">{log.companyName}</span>
                                        <span>•</span>
                                        <span>Tuần {log.weekNumber}</span>
                                        <span>•</span>
                                        <span>
                                            {new Date(log.periodStart).toLocaleDateString('vi-VN')} – {new Date(log.periodEnd).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleOpenComment(log)}
                                    className="gap-1.5 text-xs self-end sm:self-auto"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{log.lecturerComment ? 'Sửa ý kiến GVHD' : 'Nhận xét của GVHD'}</span>
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Nội dung công việc sinh viên ghi nhận:
                                </h4>
                                <p className="text-xs text-slate-800 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    {log.tasksCompleted}
                                </p>
                            </div>

                            {/* Mentor Feedback */}
                            {log.mentorFeedback && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-0.5">
                                    <span className="font-bold flex items-center gap-1.5">
                                        <UserCheck className="w-3.5 h-3.5" />
                                        Ý kiến Cán bộ hướng dẫn Doanh nghiệp (Mentor):
                                    </span>
                                    <p className="italic">&ldquo;{log.mentorFeedback}&rdquo;</p>
                                </div>
                            )}

                            {/* Existing Lecturer Comment */}
                            {log.lecturerComment && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-0.5">
                                    <span className="font-bold flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Ý kiến của Giảng viên hướng dẫn:
                                    </span>
                                    <p>&ldquo;{log.lecturerComment}&rdquo;</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Comment Modal */}
            <Modal
                isOpen={!!commentModalLog}
                onClose={() => setCommentModalLog(null)}
                title={`Ý kiến GVHD — Tuần ${commentModalLog?.weekNumber}: ${commentModalLog?.studentName}`}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                        label="Nhận xét & Định hướng chuyên môn của Giảng viên"
                        id="commentText"
                        rows={4}
                        value={lecturerComment}
                        onChange={(e) => setLecturerComment(e.target.value)}
                        placeholder="Ghi ý kiến nhận xét về tiến độ, các lưu ý về bảo mật hoặc tài liệu báo cáo..."
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setCommentModalLog(null)}
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
                            <Send className="w-4 h-4" />
                            <span>Lưu ý kiến</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

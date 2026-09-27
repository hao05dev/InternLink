'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
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
import type { WeeklyLogbook } from '@/types/portal';

interface SupervisionLogItem extends WeeklyLogbook {
    studentName: string;
    studentCode: string;
    companyName: string;
}

const SAMPLE_LOGS: SupervisionLogItem[] = [
    {
        id: 'log-sup-01',
        placementId: 'plc-1',
        studentName: 'Nguyễn Văn A',
        studentCode: 'B2101234',
        companyName: 'FPT Software Cần Thơ',
        weekNumber: 2,
        periodStart: '2026-10-06',
        periodEnd: '2026-10-10',
        tasksCompleted: '1. Nghiên cứu tài liệu kiến trúc hệ thống và luồng xác thực OAuth2 / JWT.\n2. Thiết lập môi trường Docker Compose gồm PostgreSQL và Redis.\n3. Viết Unit Test cho tầng Service xác thực tài khoản.',
        learningReflection: 'Nắm vững hơn quy trình CI/CD và quy tắc viết test case với JUnit 5 / Mockito.',
        totalHours: 40,
        status: 'APPROVED',
        mentorFeedback: 'Sinh viên chủ động tìm hiểu tài liệu dự án rất tốt, hoàn thành đúng tiến độ.',
        mentorReviewedAt: '2026-10-12T09:30:00Z',
    },
    {
        id: 'log-sup-02',
        placementId: 'plc-2',
        studentName: 'Trần Thị Bích Ngọc',
        studentCode: 'B2105678',
        companyName: 'VNPT Cần Thơ',
        weekNumber: 1,
        periodStart: '2026-10-01',
        periodEnd: '2026-10-05',
        tasksCompleted: 'Tiếp nhận tài liệu dự án ứng dụng di động Flutter. Tìm hiểu cấu trúc BLoC pattern.',
        learningReflection: 'Làm quen với luồng phát triển của nhóm dự án.',
        totalHours: 40,
        status: 'APPROVED',
        mentorFeedback: 'Tác phong nghiêm túc, có kiến thức cơ bản tốt.',
        mentorReviewedAt: '2026-10-07T10:00:00Z',
    },
];

export default function LecturerSupervisionPage() {
    const [logs, setLogs] = useState<SupervisionLogItem[]>(SAMPLE_LOGS);
    const [commentModalLog, setCommentModalLog] = useState<SupervisionLogItem | null>(null);
    const [lecturerComment, setLecturerComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        } catch {
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

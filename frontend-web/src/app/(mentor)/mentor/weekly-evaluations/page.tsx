'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
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
import type { WeeklyLogbook, LogbookStatus } from '@/types/portal';

interface MentorLogbookItem extends WeeklyLogbook {
    studentName: string;
    studentCode: string;
}

const SAMPLE_MENTOR_LOGS: MentorLogbookItem[] = [
    {
        id: 'log-m-01',
        placementId: 'plc-1',
        studentName: 'Nguyễn Văn A',
        studentCode: 'B2101234',
        weekNumber: 2,
        periodStart: '2026-10-06',
        periodEnd: '2026-10-10',
        tasksCompleted: '1. Nghiên cứu tài liệu kiến trúc hệ thống và luồng xác thực OAuth2 / JWT.\n2. Thiết lập môi trường Docker Compose gồm PostgreSQL và Redis.\n3. Viết Unit Test cho tầng Service xác thực tài khoản.',
        learningReflection: 'Nắm vững hơn quy trình CI/CD và quy tắc viết test case với JUnit 5 / Mockito. Đã khắc phục lỗi xung đột cổng kết nối trong Docker.',
        totalHours: 40,
        wasLate: false,
        status: 'SUBMITTED',
    },
    {
        id: 'log-m-02',
        placementId: 'plc-1',
        studentName: 'Nguyễn Văn A',
        studentCode: 'B2101234',
        weekNumber: 1,
        periodStart: '2026-10-01',
        periodEnd: '2026-10-03',
        tasksCompleted: '1. Tiếp nhận quy định văn phòng và văn hóa doanh nghiệp FPT Software.\n2. Cài đặt môi trường phát triển (IDE IntelliJ, Node.js, Git client).\n3. Gặp gỡ Mentor phụ trách và thống nhất kế hoạch công việc quý 4.',
        learningReflection: 'Làm quen với quy trình Agile / Scrum trong nhóm dự án.',
        totalHours: 24,
        wasLate: false,
        status: 'APPROVED',
        mentorFeedback: 'Chào mừng em gia nhập đội ngũ. Tinh thần học hỏi tốt, tác phong đúng giờ.',
        mentorReviewedAt: '2026-10-04T10:00:00Z',
    },
    {
        id: 'log-m-03',
        placementId: 'plc-2',
        studentName: 'Trần Thị Bích Ngọc',
        studentCode: 'B2105678',
        weekNumber: 1,
        periodStart: '2026-10-01',
        periodEnd: '2026-10-03',
        tasksCompleted: 'Cài đặt môi trường React, setup ESLint và làm quen với cấu trúc thư mục của dự án.',
        learningReflection: 'Tìm hiểu cách chia sẻ state giữa các components.',
        totalHours: 24,
        wasLate: false,
        status: 'SUBMITTED',
    },
];

export default function MentorWeeklyEvaluationsPage() {
    const [logs, setLogs] = useState<MentorLogbookItem[]>(SAMPLE_MENTOR_LOGS);
    const [isLoading, setIsLoading] = useState(false);
    const [reviewModalLog, setReviewModalLog] = useState<MentorLogbookItem | null>(null);
    const [reviewStatus, setReviewStatus] = useState<LogbookStatus>('APPROVED');
    const [mentorFeedback, setMentorFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        } catch {
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

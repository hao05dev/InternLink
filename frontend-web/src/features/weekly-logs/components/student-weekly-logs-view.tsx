'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Calendar,
    Clock,
    Plus,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    UserCheck,
    CheckSquare,
    BookOpen,
    Send
} from 'lucide-react';
import type { WeeklyLogbook, LogbookStatus } from '@/features/weekly-logs/types/weekly-log.types';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

export default function StudentWeeklyLogsView() {
    const { user } = useAuth();
    const [placement, setPlacement] = useState<InternshipPlacement | null>(null);
    const [logs, setLogs] = useState<WeeklyLogbook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [weekNumber, setWeekNumber] = useState('1');
    const [periodStart, setPeriodStart] = useState(new Date().toISOString().split('T')[0]);
    const [periodEnd, setPeriodEnd] = useState(new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]);
    const [tasksCompleted, setTasksCompleted] = useState('');
    const [learningReflection, setLearningReflection] = useState('');
    const [totalHours, setTotalHours] = useState('40');
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPlacementAndLogs() {
            try {
                const plcRes = await apiClient.get<InternshipPlacement[]>('/api/v1/placements/my-placement');
                if (plcRes.data && Array.isArray(plcRes.data) && plcRes.data.length > 0) {
                    const activePlc = plcRes.data[0];
                    setPlacement(activePlc);

                    try {
                        const logRes = await apiClient.get<WeeklyLogbook[]>(`/api/v1/logbooks/placement/${activePlc.id}`);
                        if (logRes.data && Array.isArray(logRes.data)) {
                            setLogs(logRes.data);
                        } else {
                            setLogs([]);
                        }
                    } catch {
                        setLogs([]);
                    }
                } else {
                    setLogs([]);
                }
            } catch {
                setLogs([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPlacementAndLogs();
    }, []);

    const handleOpenCreateModal = () => {
        const nextWeek = logs.length > 0 ? Math.max(...logs.map(l => l.weekNumber)) + 1 : 1;
        setWeekNumber(String(nextWeek));
        setTasksCompleted('');
        setLearningReflection('');
        setTotalHours('40');
        setFormError(null);
        setIsCreateModalOpen(true);
    };

    const handleSubmitLogbook = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!placement?.id) {
            setFormError('Không tìm thấy thông tin đợt thực tập hợp lệ để nộp nhật ký.');
            return;
        }

        if (!tasksCompleted.trim() || !learningReflection.trim()) {
            setFormError('Vui lòng điền đầy đủ các nội dung công việc và bài học thu nhận.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await apiClient.post<WeeklyLogbook>('/api/v1/logbooks', {
                placementId: placement.id,
                weekNumber: parseInt(weekNumber, 10),
                periodStart,
                periodEnd,
                tasksCompleted,
                learningReflection,
                totalHours: parseFloat(totalHours) || 40,
            });

            if (res.data) {
                setLogs(prev => [res.data, ...prev]);
            }
            setMessage({ type: 'success', text: `Nộp nhật ký Tuần ${weekNumber} thành công! Đang chờ Mentor nhận xét.` });
            setIsCreateModalOpen(false);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi nộp nhật ký tuần.';
            setFormError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="space-y-4">
                    <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Nhật Ký Thực Tập Tuần (Weekly Logbook)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Ghi chép công việc, tiến độ hàng tuần và nhận phản hồi trực tiếp từ Mentor và GVHD.
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleOpenCreateModal}
                    className="gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nộp nhật ký tuần mới</span>
                </Button>
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
                    title="Chưa có nhật ký tuần nào"
                    description="Bạn chưa nộp nhật ký thực tập. Hãy nhấn 'Nộp nhật ký tuần mới' để ghi chép lại kết quả công việc tuần đầu tiên."
                    action={
                        <Button variant="primary" onClick={handleOpenCreateModal}>
                            Nộp nhật ký tuần 1
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-6">
                    {logs.map((log) => (
                        <Card key={log.id} className="border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                                            T{log.weekNumber}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">
                                                Nhật ký thực tập — Tuần {log.weekNumber}
                                            </CardTitle>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(log.periodStart).toLocaleDateString('vi-VN')} – {new Date(log.periodEnd).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{log.totalHours} giờ làm việc</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {log.wasLate && (
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                Nộp trễ hạn
                                            </span>
                                        )}
                                        <StatusBadge status={log.status} type="logbook" />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-5">
                                {/* Tasks completed */}
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckSquare className="w-4 h-4 text-blue-600" />
                                        Công việc đã thực hiện trong tuần
                                    </h4>
                                    <p className="text-sm text-slate-800 whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                        {log.tasksCompleted}
                                    </p>
                                </div>

                                {/* Learning reflection */}
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4 text-indigo-600" />
                                        Bài học kinh nghiệm & Vấn đề giải quyết
                                    </h4>
                                    <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                        {log.learningReflection}
                                    </p>
                                </div>

                                {/* Mentor Feedback Section */}
                                {log.mentorFeedback && (
                                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                                                <UserCheck className="w-4 h-4 text-emerald-600" />
                                                <span>Nhận xét từ Cán bộ hướng dẫn (Mentor)</span>
                                            </div>
                                            {log.mentorReviewedAt && (
                                                <span className="text-[11px] text-emerald-700">
                                                    {new Date(log.mentorReviewedAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                                            &ldquo;{log.mentorFeedback}&rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* Lecturer Comment Section */}
                                {log.lecturerComment && (
                                    <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                                <span>Ý kiến từ Giảng viên hướng dẫn (GVHD)</span>
                                            </div>
                                            {log.lecturerCommentedAt && (
                                                <span className="text-[11px] text-blue-700">
                                                    {new Date(log.lecturerCommentedAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-blue-900 leading-relaxed font-medium">
                                            &ldquo;{log.lecturerComment}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Weekly Log Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Nộp nhật ký thực tập tuần"
                maxWidth="2xl"
            >
                <form onSubmit={handleSubmitLogbook} className="space-y-4">
                    {formError && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            label="Tuần số"
                            id="weekNumber"
                            type="number"
                            min="1"
                            max="20"
                            value={weekNumber}
                            onChange={(e) => setWeekNumber(e.target.value)}
                            required
                        />
                        <Input
                            label="Từ ngày"
                            id="periodStart"
                            type="date"
                            value={periodStart}
                            onChange={(e) => setPeriodStart(e.target.value)}
                            required
                        />
                        <Input
                            label="Đến ngày"
                            id="periodEnd"
                            type="date"
                            value={periodEnd}
                            onChange={(e) => setPeriodEnd(e.target.value)}
                            required
                        />
                    </div>

                    <Input
                        label="Tổng số giờ làm việc trong tuần"
                        id="totalHours"
                        type="number"
                        min="1"
                        max="60"
                        value={totalHours}
                        onChange={(e) => setTotalHours(e.target.value)}
                        hint="Chuẩn 40 giờ/tuần đối với thực tập toàn thời gian"
                        required
                    />

                    <Textarea
                        label="Nội dung công việc đã hoàn thành trong tuần"
                        id="tasksCompleted"
                        rows={4}
                        value={tasksCompleted}
                        onChange={(e) => setTasksCompleted(e.target.value)}
                        placeholder="Liệt kê chi tiết các đầu việc đã triển khai, công nghệ sử dụng, tính năng hoàn tất..."
                        required
                    />

                    <Textarea
                        label="Bài học kinh nghiệm, khó khăn & Đề xuất tuần tiếp theo"
                        id="learningReflection"
                        rows={3}
                        value={learningReflection}
                        onChange={(e) => setLearningReflection(e.target.value)}
                        placeholder="Nêu rõ bài học chuyên môn đúc kết được, các vướng mắc kỹ thuật và phương án giải quyết..."
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
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
                            <span>Gửi nhật ký tuần</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

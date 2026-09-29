'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle2,
    Users,
    FileCheck2,
    Settings,
    Edit3
} from 'lucide-react';

interface TermItem {
    id: string;
    departmentId: string;
    code: string;
    termName: string;
    academicYear: string;
    semester: string;
    startDate: string;
    endDate: string;
    registrationOpenAt: string;
    registrationCloseAt: string;
    applicationDeadline: string;
    evaluationDeadline: string;
    settings?: { maxStudents?: number };
    status: 'DRAFT' | 'REGISTRATION_OPEN' | 'APPLICATION_OPEN' | 'ACTIVE' | 'EVALUATING' | 'CLOSED';
}

export default function FacultyTermsView() {
    const { user } = useAuth();
    const [terms, setTerms] = useState<TermItem[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [termCode, setTermCode] = useState('HK2-2026-2027');
    const [termName, setTermName] = useState('Thực tập học kỳ 2');
    const [academicYear, setAcademicYear] = useState('2026-2027');
    const [semester, setSemester] = useState('2');
    const [startDate, setStartDate] = useState('2027-02-15');
    const [endDate, setEndDate] = useState('2027-05-30');
    const [registrationOpenAt, setRegistrationOpenAt] = useState('2027-01-01T08:00');
    const [registrationDeadline, setRegistrationDeadline] = useState('2027-02-01T17:00');
    const [applicationDeadline, setApplicationDeadline] = useState('2027-02-14T17:00');
    const [evaluationDeadline, setEvaluationDeadline] = useState('2027-06-15T17:00');
    const [maxStudents, setMaxStudents] = useState('400');

    useEffect(() => {
        if (!user?.departmentId) { setIsLoading(false); return; }
        async function fetchDepartmentsAndTerms() {
            try {
                const deptRes = await apiClient.get<any[]>('/api/v1/departments');
                if (deptRes.data && Array.isArray(deptRes.data) && user?.departmentId) {
                    setDepartments(deptRes.data.filter(dept => dept.id === user.departmentId));
                    const defaultDeptId = user.departmentId;
                    setSelectedDeptId(defaultDeptId);

                    try {
                        const termRes = await apiClient.get<TermItem[]>(`/api/v1/terms/by-department/${defaultDeptId}`);
                        if (termRes.data && Array.isArray(termRes.data)) {
                            setTerms(termRes.data);
                        } else {
                            setTerms([]);
                        }
                    } catch {
                        setTerms([]);
                    }
                } else {
                    setTerms([]);
                }
            } catch {
                setTerms([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDepartmentsAndTerms();
    }, [user?.departmentId]);

    const handleCreateTerm = async (e: React.FormEvent) => {
        e.preventDefault();
        const effectiveDeptId = selectedDeptId || departments[0]?.id;
        if (!effectiveDeptId) {
            setMessage({ type: 'error', text: 'Chưa chọn đơn vị đào tạo / Khoa trực thuộc.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await apiClient.post<TermItem>('/api/v1/terms', {
                departmentId: effectiveDeptId,
                code: termCode,
                termName,
                academicYear,
                semester,
                startDate,
                endDate,
                registrationOpenAt: new Date(registrationOpenAt).toISOString(),
                registrationCloseAt: new Date(registrationDeadline).toISOString(),
                applicationDeadline: new Date(applicationDeadline).toISOString(),
                evaluationDeadline: new Date(evaluationDeadline).toISOString(),
                settings: { maxStudents: parseInt(maxStudents, 10) },
            });

            if (res.data) {
                setTerms(prev => [res.data, ...prev]);
            }
            setMessage({ type: 'success', text: `Khởi tạo kỳ thực tập "${termCode}" thành công!` });
            setIsCreateModalOpen(false);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi khởi tạo kỳ thực tập.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (termId: string, newStatus: TermItem['status']) => {
        try {
            await apiClient.patch(`/api/v1/terms/${termId}/status?status=${newStatus}`);
            setTerms(prev => prev.map(t => t.id === termId ? { ...t, status: newStatus } : t));
            setMessage({ type: 'success', text: 'Cập nhật trạng thái kỳ thực tập thành công!' });
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái kỳ thực tập.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Quản Lý Kỳ Thực Tập (Internship Terms)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Khởi tạo và thiết lập các mốc thời gian tiếp nhận, đăng ký thực tập cho từng học kỳ của Trường CNTT&TT.
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Khởi tạo kỳ thực tập mới</span>
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

            {/* Terms List */}
            <div className="space-y-4">
                {terms.map((t) => (
                    <Card key={t.id} className="hover:border-slate-300 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-bold text-lg text-slate-900">{t.code} · {t.termName}</span>
                                        <span className="text-xs text-slate-500 font-medium">
                                            Năm học: {t.academicYear} • Học kỳ {t.semester}
                                        </span>
                                        <StatusBadge status={t.status} type="term" />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-5 text-xs text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>
                                                Thời gian thực tập: {new Date(t.startDate).toLocaleDateString('vi-VN')} – {new Date(t.endDate).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-medium text-rose-700">
                                            <Clock className="w-4 h-4" />
                                            <span>Hạn đăng ký: {new Date(t.registrationCloseAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span>Chỉ tiêu: {t.settings?.maxStudents ?? 'Chưa đặt'} sinh viên</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Switch Actions */}
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    {t.status === 'DRAFT' && <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(t.id, 'REGISTRATION_OPEN')}>Mở đăng ký</Button>}
                                    {t.status === 'REGISTRATION_OPEN' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleToggleStatus(t.id, 'APPLICATION_OPEN')}
                                            className="text-xs"
                                        >
                                            Chuyển sang Nhận hồ sơ
                                        </Button>
                                    )}

                                    {t.status === 'APPLICATION_OPEN' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleStatus(t.id, 'ACTIVE')}
                                            className="text-xs"
                                        >
                                            Kích hoạt kỳ thực tập
                                        </Button>
                                    )}

                                    {t.status === 'ACTIVE' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleStatus(t.id, 'EVALUATING')}
                                            className="text-xs text-blue-700"
                                        >
                                            Mở đánh giá
                                        </Button>
                                    )}
                                    {t.status === 'EVALUATING' && <Button variant="outline" size="sm" onClick={() => handleToggleStatus(t.id, 'CLOSED')}>Đóng kỳ</Button>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Term Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Khởi tạo kỳ thực tập mới"
                maxWidth="lg"
            >
                <form onSubmit={handleCreateTerm} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Mã kỳ thực tập"
                            id="termCode"
                            value={termCode}
                            onChange={(e) => setTermCode(e.target.value)}
                            placeholder="VD: HK1-2026-2027"
                            required
                        />
                        <Input label="Tên kỳ thực tập" value={termName} onChange={(e) => setTermName(e.target.value)} required />
                        <Input
                            label="Năm học"
                            id="academicYear"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="2026-2027"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Học kỳ"
                            id="semester"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            options={[
                                { value: '1', label: 'Học kỳ 1' },
                                { value: '2', label: 'Học kỳ 2' },
                                { value: '3', label: 'Học kỳ Hè' },
                            ]}
                        />
                        <Input
                            label="Chỉ tiêu sinh viên tối đa"
                            id="maxStudents"
                            type="number"
                            min="10"
                            max="1000"
                            value={maxStudents}
                            onChange={(e) => setMaxStudents(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Ngày bắt đầu kỳ thực tập"
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                        <Input
                            label="Ngày kết thúc kỳ thực tập"
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <Input
                        label="Bắt đầu đăng ký"
                        type="datetime-local"
                        value={registrationOpenAt}
                        onChange={(e) => setRegistrationOpenAt(e.target.value)}
                        required
                    />
                    <Input
                        label="Hạn chót đăng ký của sinh viên"
                        id="regDeadline"
                        type="datetime-local"
                        value={registrationDeadline}
                        onChange={(e) => setRegistrationDeadline(e.target.value)}
                        required
                    />
                    <Input label="Hạn ứng tuyển" type="datetime-local" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} required />
                    <Input label="Hạn đánh giá" type="datetime-local" value={evaluationDeadline} onChange={(e) => setEvaluationDeadline(e.target.value)} required />

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
                            <Calendar className="w-4 h-4" />
                            <span>Khởi tạo kỳ</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

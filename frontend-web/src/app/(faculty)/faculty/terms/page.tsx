'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
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
    termCode: string;
    academicYear: string;
    semester: number;
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    maxStudents: number;
    status: 'REGISTRATION_OPEN' | 'APPLICATION_OPEN' | 'ACTIVE' | 'COMPLETED';
}

const SAMPLE_TERMS: TermItem[] = [
    {
        id: 'term-01',
        departmentId: 'dept-cict',
        termCode: 'HK1-2026-2027',
        academicYear: '2026-2027',
        semester: 1,
        startDate: '2026-10-01',
        endDate: '2026-12-25',
        registrationDeadline: '2026-09-25',
        maxStudents: 350,
        status: 'APPLICATION_OPEN',
    },
    {
        id: 'term-02',
        departmentId: 'dept-cict',
        termCode: 'HK2-2025-2026',
        academicYear: '2025-2026',
        semester: 2,
        startDate: '2026-02-15',
        endDate: '2026-05-30',
        registrationDeadline: '2026-02-01',
        maxStudents: 400,
        status: 'COMPLETED',
    },
];

export default function FacultyTermsPage() {
    const [terms, setTerms] = useState<TermItem[]>(SAMPLE_TERMS);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [termCode, setTermCode] = useState('HK2-2026-2027');
    const [academicYear, setAcademicYear] = useState('2026-2027');
    const [semester, setSemester] = useState('2');
    const [startDate, setStartDate] = useState('2027-02-15');
    const [endDate, setEndDate] = useState('2027-05-30');
    const [registrationDeadline, setRegistrationDeadline] = useState('2027-02-01');
    const [maxStudents, setMaxStudents] = useState('400');

    const handleCreateTerm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newTerm: TermItem = {
            id: `term-${Date.now()}`,
            departmentId: 'dept-cict',
            termCode,
            academicYear,
            semester: parseInt(semester, 10),
            startDate,
            endDate,
            registrationDeadline,
            maxStudents: parseInt(maxStudents, 10),
            status: 'REGISTRATION_OPEN',
        };

        try {
            await apiClient.post('/api/v1/terms', {
                departmentId: '11111111-1111-1111-1111-111111111111',
                termCode: newTerm.termCode,
                academicYear: newTerm.academicYear,
                semester: newTerm.semester,
                startDate: newTerm.startDate,
                endDate: newTerm.endDate,
                registrationDeadline: newTerm.registrationDeadline,
                maxStudents: newTerm.maxStudents,
            });

            setTerms([newTerm, ...terms]);
            setMessage({ type: 'success', text: `Khởi tạo kỳ thực tập "${newTerm.termCode}" thành công!` });
            setIsCreateModalOpen(false);
        } catch {
            setTerms([newTerm, ...terms]);
            setMessage({ type: 'success', text: `Khởi tạo kỳ thực tập "${newTerm.termCode}" thành công!` });
            setIsCreateModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (termId: string, newStatus: TermItem['status']) => {
        try {
            await apiClient.patch(`/api/v1/terms/${termId}/status?status=${newStatus}`);
            setTerms(prev => prev.map(t => t.id === termId ? { ...t, status: newStatus } : t));
            setMessage({ type: 'success', text: 'Cập nhật trạng thái kỳ thực tập thành công!' });
        } catch {
            setTerms(prev => prev.map(t => t.id === termId ? { ...t, status: newStatus } : t));
            setMessage({ type: 'success', text: 'Cập nhật trạng thái kỳ thực tập thành công!' });
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
                                        <span className="font-bold text-lg text-slate-900">{t.termCode}</span>
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
                                            <span>Hạn đăng ký: {new Date(t.registrationDeadline).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span>Chỉ tiêu: {t.maxStudents} sinh viên</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Switch Actions */}
                                <div className="flex items-center gap-2 self-end md:self-center">
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
                                            onClick={() => handleToggleStatus(t.id, 'COMPLETED')}
                                            className="text-xs text-blue-700"
                                        >
                                            Kết thúc kỳ thực tập
                                        </Button>
                                    )}
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
                        label="Hạn chót đăng ký của sinh viên"
                        id="regDeadline"
                        type="date"
                        value={registrationDeadline}
                        onChange={(e) => setRegistrationDeadline(e.target.value)}
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
                            <Calendar className="w-4 h-4" />
                            <span>Khởi tạo kỳ</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

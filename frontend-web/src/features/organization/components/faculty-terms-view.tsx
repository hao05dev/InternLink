'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { CloseTermConfirmModal } from './modals/close-term-confirm-modal';
import { RolloverTermModal } from './modals/rollover-term-modal';
import {
    Calendar,
    Plus,
    Clock,
    CheckCircle2,
    Users,
    Edit3,
    Lock,
    RefreshCw,
    Search,
    BookOpen,
    Sparkles,
    AlertCircle,
    Layers
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
    const [termToClose, setTermToClose] = useState<TermItem | null>(null);
    const [termToRollover, setTermToRollover] = useState<TermItem | null>(null);
    const [isModalActionLoading, setIsModalActionLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filter states
    const [selectedYear, setSelectedYear] = useState<string>('ALL');
    const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

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

    // Unique academic years list from existing terms
    const academicYears = useMemo(() => {
        const yearsSet = new Set<string>();
        terms.forEach((t) => {
            if (t.academicYear) yearsSet.add(t.academicYear);
        });
        return Array.from(yearsSet).sort().reverse();
    }, [terms]);

    // Summary Statistics calculation
    const stats = useMemo(() => {
        const total = terms.length;
        const activeCount = terms.filter((t) =>
            ['REGISTRATION_OPEN', 'APPLICATION_OPEN', 'ACTIVE', 'EVALUATING'].includes(t.status)
        ).length;
        const closedCount = terms.filter((t) => t.status === 'CLOSED').length;
        const totalCapacity = terms.reduce((acc, t) => acc + (t.settings?.maxStudents || 0), 0);

        return {
            total,
            activeCount,
            closedCount,
            totalCapacity,
        };
    }, [terms]);

    // Filtered terms
    const filteredTerms = useMemo(() => {
        return terms.filter((t) => {
            const matchesYear = selectedYear === 'ALL' || t.academicYear === selectedYear;
            const matchesSemester =
                selectedSemester === 'ALL' ||
                t.semester === selectedSemester ||
                (selectedSemester === '1' && (t.termName.toLowerCase().includes('học kỳ 1') || t.code.toLowerCase().startsWith('hk1'))) ||
                (selectedSemester === '2' && (t.termName.toLowerCase().includes('học kỳ 2') || t.code.toLowerCase().startsWith('hk2'))) ||
                (selectedSemester === '3' && (t.termName.toLowerCase().includes('hè') || t.code.toLowerCase().startsWith('hk3')));
            const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
            const matchesSearch =
                !searchTerm.trim() ||
                t.code.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                t.termName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                t.academicYear.toLowerCase().includes(searchTerm.toLowerCase().trim());

            return matchesYear && matchesSemester && matchesStatus && matchesSearch;
        });
    }, [terms, selectedYear, selectedSemester, selectedStatus, searchTerm]);

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

    const handleCloseTermSubmit = async (termId: string, reason: string) => {
        setIsModalActionLoading(true);
        try {
            await apiClient.patch(`/api/v1/terms/${termId}/status?status=CLOSED&reason=${encodeURIComponent(reason)}`);
            setTerms(prev => prev.map(t => t.id === termId ? { ...t, status: 'CLOSED' } : t));
            setMessage({ type: 'success', text: 'Đã đóng học kỳ và chuyển dữ liệu sang chế độ Chỉ đọc (Read-only) thành công!' });
            setTermToClose(null);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Không thể đóng học kỳ.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsModalActionLoading(false);
        }
    };

    const handleRolloverTermSubmit = async (sourceTermId: string, targetTermId: string, options: { retainMentor: boolean }) => {
        setIsModalActionLoading(true);
        try {
            await apiClient.post(`/api/v1/terms/${sourceTermId}/rollover`, {
                targetTermId,
                retainMentor: options.retainMentor,
            });
            setMessage({ type: 'success', text: 'Đã chuyển tiếp sinh viên sang học kỳ mới thành công!' });
            setTermToRollover(null);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Chuyển tiếp sinh viên thất bại.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsModalActionLoading(false);
        }
    };

    const handleToggleStatus = async (termId: string, newStatus: TermItem['status']) => {
        try {
            await apiClient.patch(`/api/v1/terms/${termId}/status?status=${newStatus}`);
            setTerms(prev => prev.map(t => t.id === termId ? { ...t, status: newStatus } : t));
            setMessage({ type: 'success', text: 'Cập nhật trạng thái kỳ thực tập thành công!' });
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái học kỳ.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Quản Lý Kỳ Thực Tập (Internship Terms)
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Khởi tạo, lọc theo năm học và thiết lập các mốc thời gian tiếp nhận sinh viên
                        </p>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gap-2 text-xs self-start sm:self-auto"
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
                    className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600 text-base leading-none"
                        aria-label="Đóng thông báo"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* QUICK STATS BAR (Thống kê nhẹ) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <Card className="border-slate-200/80 shadow-2xs bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số kỳ</p>
                            <p className="text-lg font-bold text-slate-900">{stats.total} <span className="text-xs font-normal text-slate-400">kỳ</span></p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-2xs bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đang hoạt động</p>
                            <p className="text-lg font-bold text-emerald-700">{stats.activeCount} <span className="text-xs font-normal text-slate-400">kỳ</span></p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-2xs bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã đóng (Khóa)</p>
                            <p className="text-lg font-bold text-slate-700">{stats.closedCount} <span className="text-xs font-normal text-slate-400">kỳ</span></p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-2xs bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng chỉ tiêu</p>
                            <p className="text-lg font-bold text-indigo-700">{stats.totalCapacity} <span className="text-xs font-normal text-slate-400">SV</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FILTER TOOLBAR (Bộ lọc theo năm học & trạng thái) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm mã kỳ, tên kỳ thực tập..."
                        className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center flex-wrap gap-2.5">
                    {/* Academic Year Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Năm học:</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">Tất cả năm học</option>
                            {academicYears.map((year) => (
                                <option key={year} value={year}>
                                    Năm {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Semester Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Học kỳ:</span>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">Tất cả học kỳ</option>
                            <option value="1">Học kỳ 1</option>
                            <option value="2">Học kỳ 2</option>
                            <option value="3">Học kỳ Hè (HK3)</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="DRAFT">Bản nháp (DRAFT)</option>
                            <option value="REGISTRATION_OPEN">Mở đăng ký</option>
                            <option value="APPLICATION_OPEN">Mở nhận hồ sơ</option>
                            <option value="ACTIVE">Đang thực tập</option>
                            <option value="EVALUATING">Mở đánh giá</option>
                            <option value="CLOSED">Đã đóng (CLOSED)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Terms List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-xs text-slate-500">Đang tải danh sách kỳ thực tập...</p>
                </div>
            ) : filteredTerms.length === 0 ? (
                <EmptyState
                    title="Không tìm thấy kỳ thực tập nào"
                    description={
                        selectedYear !== 'ALL' || selectedStatus !== 'ALL' || searchTerm
                            ? 'Không có kỳ thực tập nào phù hợp với bộ lọc hiện tại. Thử chọn lại năm học hoặc xóa tìm kiếm.'
                            : 'Chưa có kỳ thực tập nào được khởi tạo. Hãy bắt đầu bằng cách bấm nút "Khởi tạo kỳ thực tập mới".'
                    }
                />
            ) : (
                <div className="space-y-3.5">
                    {filteredTerms.map((t) => (
                        <Card key={t.id} className="hover:border-slate-300 transition-colors shadow-2xs">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="font-bold text-sm sm:text-base text-slate-900">
                                                {t.code} · {t.termName}
                                            </span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                Năm học: {t.academicYear} • Học kỳ {t.semester}
                                            </span>
                                            <StatusBadge status={t.status} type="term" />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs text-slate-600 pt-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>
                                                    Thời gian thực tập: <strong>{new Date(t.startDate).toLocaleDateString('vi-VN')}</strong> – <strong>{new Date(t.endDate).toLocaleDateString('vi-VN')}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Hạn đăng ký: {new Date(t.registrationCloseAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Chỉ tiêu: <strong className="text-slate-800">{t.settings?.maxStudents ?? 'Chưa đặt'}</strong> SV</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Switch Actions & Safety Controls */}
                                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                                        {t.status === 'DRAFT' && (
                                            <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(t.id, 'REGISTRATION_OPEN')} className="text-xs">
                                                Mở đăng ký
                                            </Button>
                                        )}
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
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(t.id, 'EVALUATING')}
                                                    className="text-xs text-blue-700"
                                                >
                                                    Mở đánh giá
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setTermToClose(t)}
                                                    className="text-xs text-rose-600 hover:bg-rose-50"
                                                    title="Đóng học kỳ trước hạn nếu cần"
                                                >
                                                    <Lock className="w-3.5 h-3.5 mr-1" />
                                                    Đóng kỳ sớm
                                                </Button>
                                            </>
                                        )}

                                        {t.status === 'EVALUATING' && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setTermToClose(t)}
                                                className="text-xs gap-1"
                                            >
                                                <Lock className="w-3.5 h-3.5" />
                                                <span>Đóng kỳ (Khóa sổ)</span>
                                            </Button>
                                        )}

                                        {t.status === 'CLOSED' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setTermToRollover(t)}
                                                className="text-xs gap-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200"
                                                title="Chuyển tiếp sinh viên chưa hoàn thành sang kỳ mới"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                <span>Chuyển tiếp SV</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Close Term Confirm Modal (2-Step Verification) */}
            <CloseTermConfirmModal
                isOpen={!!termToClose}
                onClose={() => setTermToClose(null)}
                onConfirm={handleCloseTermSubmit}
                term={termToClose}
                isLoading={isModalActionLoading}
            />

            {/* Rollover Term Modal */}
            <RolloverTermModal
                isOpen={!!termToRollover}
                onClose={() => setTermToRollover(null)}
                onConfirm={handleRolloverTermSubmit}
                sourceTerm={termToRollover}
                availableTargetTerms={terms}
                isLoading={isModalActionLoading}
            />

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

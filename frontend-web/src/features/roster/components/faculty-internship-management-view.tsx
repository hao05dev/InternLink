'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
    ClipboardCheck,
    CheckCircle2,
    XCircle,
    Search,
    Building2,
    RefreshCw,
    AlertCircle,
    BookOpen,
    FileText,
    UserCheck,
    Clock,
    ChevronRight,
    Hash,
    Info,
    Stamp,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { EmptyState } from '@/components/ui/empty-state';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface RosterStudent {
    id: string;
    studentCode: string;
    fullName: string;
    officialEmail: string;
    programName: string;
    academicYear: string;
    classCode?: string;
    internshipCourseCode?: string;
    eligibilityStatus: string;
    claimedUserId?: string;
}

interface StudentFoundApp {
    id: string;
    termId: string;
    studentId: string;
    hostName: string;
    hostAddress: string;
    contactName: string;
    contactEmail: string;
    workDescription: string;
    startDate: string;
    endDate: string;
    acceptanceDocumentId?: string;
    status: string;            // DRAFT | SUBMITTED | APPROVED | REJECTED
    reviewNote?: string;
    placementId?: string;
}

// Combined view model for the management table
interface InternStudentRow {
    roster: RosterStudent;
    foundApp?: StudentFoundApp;
    // UI state flags
    letterReceived: boolean;   // mark letter received (local state, real: can extend backend)
    companyAccepted: boolean;  // has approved StudentFoundApp
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export default function FacultyInternshipManagementView() {
    const { user } = useAuth();

    const [terms, setTerms] = useState<any[]>([]);
    const [selectedTermId, setSelectedTermId] = useState('');
    const [roster, setRoster] = useState<RosterStudent[]>([]);
    const [foundApps, setFoundApps] = useState<StudentFoundApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'letter' | 'accepted' | 'active'>('all');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Letter-received tracking (local - saved per roster entry)
    const [letterReceivedIds, setLetterReceivedIds] = useState<Set<string>>(new Set());

    // Confirm company acceptance modal
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        rosterId: string;
        studentName: string;
        foundAppId?: string;
        hostName?: string;
    }>({ open: false, rosterId: '', studentName: '' });
    const [reviewNote, setReviewNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    /* ── Data Loaders ─────────────────────────────────────────────────────── */

    const loadData = useCallback(async (termId: string) => {
        setIsLoading(true);
        try {
            const [rosterRes, foundRes] = await Promise.all([
                apiClient.get<RosterStudent[]>(`/api/v1/rosters/by-term/${termId}`),
                apiClient.get<StudentFoundApp[]>(`/api/v1/student-found/term/${termId}`),
            ]);
            setRoster(Array.isArray(rosterRes.data) ? rosterRes.data : []);
            setFoundApps(Array.isArray(foundRes.data) ? foundRes.data : []);
        } catch {
            setRoster([]);
            setFoundApps([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user?.departmentId) { setIsLoading(false); return; }
        apiClient.get<any[]>(`/api/v1/terms/by-department/${user.departmentId}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setTerms(data);
                if (data.length > 0) {
                    setSelectedTermId(data[0].id);
                    loadData(data[0].id);
                } else {
                    setIsLoading(false);
                }
            })
            .catch(() => setIsLoading(false));
    }, [user?.departmentId, loadData]);

    const handleTermChange = (termId: string) => {
        setSelectedTermId(termId);
        loadData(termId);
    };

    /* ── Combined rows ─────────────────────────────────────────────────────── */

    const rows: InternStudentRow[] = roster.map(r => {
        const foundApp = foundApps.find(a => a.studentId === r.claimedUserId);
        return {
            roster: r,
            foundApp,
            letterReceived: letterReceivedIds.has(r.id),
            companyAccepted: foundApp?.status === 'APPROVED',
        };
    });

    /* ── Filtering ──────────────────────────────────────────────────────────── */

    const filteredRows = rows.filter(row => {
        const matchSearch =
            (row.roster.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (row.roster.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (row.roster.classCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (row.foundApp?.hostName || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = statusFilter === 'all' ? true
            : statusFilter === 'pending' ? !row.letterReceived && !row.companyAccepted
            : statusFilter === 'letter' ? row.letterReceived && !row.companyAccepted
            : statusFilter === 'accepted' ? row.companyAccepted && !row.foundApp?.placementId
            : statusFilter === 'active' ? !!row.foundApp?.placementId
            : true;

        return matchSearch && matchStatus;
    });

    /* ── Stats ─────────────────────────────────────────────────────────────── */

    const stats = {
        total: rows.length,
        letterReceived: rows.filter(r => r.letterReceived).length,
        companyAccepted: rows.filter(r => r.companyAccepted).length,
        active: rows.filter(r => r.foundApp?.placementId).length,
    };

    /* ── Actions ────────────────────────────────────────────────────────────── */

    const toggleLetterReceived = (rosterId: string) => {
        setLetterReceivedIds(prev => {
            const next = new Set(prev);
            if (next.has(rosterId)) next.delete(rosterId);
            else next.add(rosterId);
            return next;
        });
    };

    const openConfirmModal = (row: InternStudentRow) => {
        setConfirmModal({
            open: true,
            rosterId: row.roster.id,
            studentName: row.roster.fullName,
            foundAppId: row.foundApp?.id,
            hostName: row.foundApp?.hostName,
        });
        setReviewNote('');
    };

    const handleApproveFoundApp = async () => {
        if (!confirmModal.foundAppId) return;
        setIsProcessing(true);
        try {
            await apiClient.patch(`/api/v1/student-found/${confirmModal.foundAppId}/review?decision=APPROVED&note=${encodeURIComponent(reviewNote || 'Phê duyệt bởi Quản lý Khoa')}`, null);
            setMessage({ type: 'success', text: `Đã xác nhận ${confirmModal.studentName} được công ty chấp nhận thực tập.` });
            await loadData(selectedTermId);
            setConfirmModal({ open: false, rosterId: '', studentName: '' });
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác nhận.' });
        } finally {
            setIsProcessing(false);
        }
    };

    /* ── Status label helpers ──────────────────────────────────────────────── */

    const getProgressStatus = (row: InternStudentRow) => {
        if (row.foundApp?.placementId) return { label: 'Đang thực tập', variant: 'success' as const, step: 4 };
        if (row.companyAccepted) return { label: 'Công ty chấp nhận', variant: 'brand' as const, step: 3 };
        if (row.letterReceived) return { label: 'Đã nhận giấy', variant: 'warning' as const, step: 2 };
        if (row.roster.claimedUserId) return { label: 'Chờ nhận giấy', variant: 'secondary' as const, step: 1 };
        return { label: 'Chưa kích hoạt TK', variant: 'outline' as const, step: 0 };
    };

    const selectedTerm = terms.find(t => t.id === selectedTermId);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <ClipboardCheck className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Quản Lý Tiến Trình Thực Tập</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Theo dõi và xác nhận từng bước thực tập của sinh viên trong kỳ
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert */}
            {message && (
                <div role="alert" aria-live="polite" className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                    message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        }
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 ml-4 text-lg leading-none">&times;</button>
                </div>
            )}

            {/* Process explanation */}
            <Card className="bg-gradient-to-r from-indigo-50 to-sky-50 border-indigo-200">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-indigo-800 space-y-1">
                            <p className="font-semibold">Quy trình thực tập theo từng bước:</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                    { step: '1', label: 'Chưa kích hoạt TK', color: 'bg-slate-200 text-slate-700' },
                                    { step: '→', label: '', color: '' },
                                    { step: '2', label: 'Chờ nhận giấy giới thiệu', color: 'bg-amber-100 text-amber-700' },
                                    { step: '→', label: '', color: '' },
                                    { step: '3', label: 'Đã nhận giấy → đến công ty', color: 'bg-sky-100 text-sky-700' },
                                    { step: '→', label: '', color: '' },
                                    { step: '4', label: 'Công ty chấp nhận (SV điền form)', color: 'bg-indigo-100 text-indigo-700' },
                                    { step: '→', label: '', color: '' },
                                    { step: '5', label: '✓ Bắt đầu thực tập', color: 'bg-emerald-100 text-emerald-700' },
                                ].map((s, i) =>
                                    s.step === '→'
                                        ? <ChevronRight key={i} className="w-3 h-3 text-indigo-400" />
                                        : <span key={i} className={`px-2 py-0.5 rounded-full font-semibold ${s.color}`}>{s.label}</span>
                                )}
                            </div>
                            <p className="text-indigo-600 mt-1">💡 Trang này xử lý bước 3 (đánh dấu nhận giấy) và bước 4 (xác nhận công ty chấp nhận). Sinh viên tự điền tên công ty ở bước 4 phía role Student.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Controls row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Term + Stats */}
                <Card className="lg:col-span-1">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-sky-600" />
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Học kỳ</span>
                        </div>
                        {terms.length > 0 ? (
                            <Select
                                label=""
                                id="termSelect2"
                                value={selectedTermId}
                                onChange={(e) => handleTermChange(e.target.value)}
                                options={terms.map(t => ({ value: t.id, label: `${t.code} (${t.academicYear})` }))}
                            />
                        ) : (
                            <p className="text-xs text-slate-400">Chưa có kỳ thực tập</p>
                        )}
                        {selectedTerm && (
                            <div className="pt-2 border-t border-slate-100">
                                <p className="text-xs text-slate-500">{selectedTerm.termName}</p>
                                <Badge variant="brand" className="mt-1 text-[10px]">{selectedTerm.status}</Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Tổng SV', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', filter: 'all' },
                        { label: 'Đã nhận giấy', value: stats.letterReceived, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', filter: 'letter' },
                        { label: 'Công ty chấp nhận', value: stats.companyAccepted, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', filter: 'accepted' },
                        { label: 'Đang thực tập', value: stats.active, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', filter: 'active' },
                    ].map(stat => (
                        <button
                            key={stat.label}
                            onClick={() => setStatusFilter(stat.filter as any)}
                            className={`text-left ${stat.bg} border ${stat.border} rounded-2xl p-4 transition hover:shadow-sm ${statusFilter === stat.filter ? 'ring-2 ring-offset-1 ring-sky-400' : ''}`}
                        >
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, MSSV, mã lớp hoặc tên công ty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white"
                            />
                        </div>
                        <div className="flex gap-1.5">
                            {[
                                { value: 'all', label: 'Tất cả' },
                                { value: 'pending', label: 'Chưa nhận giấy' },
                                { value: 'letter', label: 'Đã nhận giấy' },
                                { value: 'accepted', label: 'Công ty OK' },
                                { value: 'active', label: 'Đang TT' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatusFilter(opt.value as any)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                                        statusFilter === opt.value
                                            ? 'bg-sky-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Table */}
            {isLoading ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                    </CardContent>
                </Card>
            ) : filteredRows.length === 0 ? (
                <EmptyState
                    title="Không có sinh viên nào"
                    description={searchTerm || statusFilter !== 'all'
                        ? "Không tìm thấy sinh viên phù hợp với bộ lọc hiện tại."
                        : "Kỳ thực tập này chưa có sinh viên. Hãy import danh sách ở trang 'Roster sinh viên'."
                    }
                />
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">STT</th>
                                    <th className="px-4 py-3">Sinh viên</th>
                                    <th className="px-4 py-3">Lớp / MSSV</th>
                                    <th className="px-4 py-3">Tiến trình</th>
                                    <th className="px-4 py-3">Công ty thực tập</th>
                                    <th className="px-4 py-3 text-center">Nhận giấy GT</th>
                                    <th className="px-4 py-3 text-center">Công ty chấp nhận</th>
                                    <th className="px-4 py-3 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {filteredRows.map((row, idx) => {
                                    const progress = getProgressStatus(row);
                                    const hasFoundApp = !!row.foundApp;
                                    const canConfirmAccept = hasFoundApp && row.foundApp!.status === 'SUBMITTED';
                                    return (
                                        <tr key={row.roster.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-slate-900">{row.roster.fullName}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{row.roster.officialEmail}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.roster.classCode && (
                                                    <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold text-[11px] mb-1">
                                                        <Hash className="w-2.5 h-2.5" />
                                                        {row.roster.classCode}
                                                    </div>
                                                )}
                                                <div className="text-sky-700 font-bold">{row.roster.studentCode}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={progress.variant} className="text-[10px] whitespace-nowrap">
                                                    {progress.label}
                                                </Badge>
                                                {/* Progress dots */}
                                                <div className="flex gap-1 mt-1.5">
                                                    {[1, 2, 3, 4].map(step => (
                                                        <div
                                                            key={step}
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                step <= progress.step
                                                                    ? 'bg-sky-500'
                                                                    : 'bg-slate-200'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.foundApp ? (
                                                    <div>
                                                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                                                            <Building2 className="w-3 h-3 text-slate-400" />
                                                            {row.foundApp.hostName}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">{row.foundApp.hostAddress}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 italic text-[11px]">Chưa có thông tin</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => toggleLetterReceived(row.roster.id)}
                                                    disabled={!row.roster.claimedUserId}
                                                    title={row.letterReceived ? 'Bỏ đánh dấu nhận giấy' : 'Đánh dấu đã nhận giấy'}
                                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition ${
                                                        !row.roster.claimedUserId
                                                            ? 'opacity-30 cursor-not-allowed'
                                                            : row.letterReceived
                                                                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {row.letterReceived
                                                        ? <CheckCircle2 className="w-4 h-4" />
                                                        : <Stamp className="w-4 h-4" />
                                                    }
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {row.companyAccepted ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 text-[11px]">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Đã xác nhận
                                                    </span>
                                                ) : hasFoundApp && row.foundApp!.status === 'SUBMITTED' ? (
                                                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-full border border-amber-200 text-[11px]">
                                                        <Clock className="w-3 h-3" />
                                                        Chờ xét duyệt
                                                    </span>
                                                ) : hasFoundApp && row.foundApp!.status === 'DRAFT' ? (
                                                    <span className="text-slate-400 italic text-[11px]">SV chưa nộp</span>
                                                ) : (
                                                    <span className="text-slate-300 text-[11px]">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {canConfirmAccept ? (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => openConfirmModal(row)}
                                                        className="text-[11px] px-3 py-1.5 h-auto gap-1"
                                                    >
                                                        <UserCheck className="w-3 h-3" />
                                                        Xác nhận
                                                    </Button>
                                                ) : row.companyAccepted ? (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => openConfirmModal(row)}
                                                        className="text-[11px] px-3 py-1.5 h-auto gap-1 opacity-60"
                                                        disabled
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        Xem chi tiết
                                                    </Button>
                                                ) : (
                                                    <span className="text-slate-300 text-[11px]">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500 text-right">
                        Hiển thị {filteredRows.length} / {rows.length} sinh viên
                    </div>
                </Card>
            )}

            {/* Confirm Acceptance Modal */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, rosterId: '', studentName: '' })}
                title="Xác nhận công ty chấp nhận thực tập"
                maxWidth="md"
            >
                <div className="space-y-5">
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                        <div className="flex gap-2">
                            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-sky-800 space-y-1">
                                <p>Bạn đang xác nhận sinh viên <strong>{confirmModal.studentName}</strong> đã được công ty <strong>{confirmModal.hostName || 'N/A'}</strong> chấp nhận cho thực tập.</p>
                                <p>Sau khi xác nhận, hệ thống sẽ chuyển sinh viên vào <strong>giai đoạn thực tập chính thức</strong>.</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ghi chú (tùy chọn)</label>
                        <textarea
                            value={reviewNote}
                            onChange={e => setReviewNote(e.target.value)}
                            placeholder="Ghi chú của Quản lý Khoa..."
                            rows={3}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmModal({ open: false, rosterId: '', studentName: '' })}
                            disabled={isProcessing}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleApproveFoundApp}
                            isLoading={isProcessing}
                            className="gap-2"
                        >
                            <UserCheck className="w-4 h-4" />
                            Xác nhận chấp nhận
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

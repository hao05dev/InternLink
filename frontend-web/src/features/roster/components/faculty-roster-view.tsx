'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
    Users,
    Upload,
    CheckCircle2,
    XCircle,
    Search,
    FileSpreadsheet,
    GraduationCap,
    AlertCircle,
    Mail,
    Download,
    RefreshCw,
    Info,
    BookOpen,
    Hash,
    UserPlus,
    Copy,
    KeyRound,
    Eye,
    EyeOff,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { EmptyState } from '@/components/ui/empty-state';

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
    eligibilityNote?: string;
    claimedUserId?: string;
    claimedAt?: string;
    createdAt?: string;
}

// ─── Auto-fill helpers ──────────────────────────────────────────────────────

/** Bỏ dấu tiếng Việt, giữ a-z0-9 */
function removeDiacritics(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

/**
 * Tạo email CTU từ họ tên + MSSV
 * VD: "Nguyễn Hoàng Hào" + "B2306614" → "haob2306614@student.ctu.edu.vn"
 */
function deriveEmail(fullName: string, studentCode: string): string {
    const parts = fullName.trim().split(/\s+/);
    const givenName = parts.length > 0 ? removeDiacritics(parts[parts.length - 1]) : '';
    const code = studentCode.trim().toLowerCase();
    if (!givenName || !code) return '';
    return `${givenName}${code}@student.ctu.edu.vn`;
}

/**
 * Tính Khóa học từ MSSV
 * B23xxxx → Khóa 49   (23 + 26 = 49)
 * B24xxxx → Khóa 50
 */
function deriveAcademicYear(studentCode: string): string {
    const match = studentCode.trim().match(/[A-Za-z]+(\d{2})/);
    if (!match) return '';
    const yearSuffix = parseInt(match[1], 10);
    return `Khóa ${yearSuffix + 26}`;
}

export default function FacultyRosterView() {
    const { user } = useAuth();
    const [roster, setRoster] = useState<RosterStudent[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [selectedTermId, setSelectedTermId] = useState('');
    const [programs, setPrograms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgram, setFilterProgram] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modal states
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Provision account modal
    const [provisionTarget, setProvisionTarget] = useState<RosterStudent | null>(null);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [provisionResult, setProvisionResult] = useState<{ password: string; email: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    // Manual add form
    const [newStudentCode, setNewStudentCode] = useState('');
    const [newFullName, setNewFullName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newProgramId, setNewProgramId] = useState('');
    const [newAcademicYear, setNewAcademicYear] = useState('Khóa 47');
    const [newClassCode, setNewClassCode] = useState('');
    const [courseCode, setCourseCode] = useState('CT444');

    // Google Sheet form
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [sheetRange, setSheetRange] = useState('Sheet1!A:I');

    // Email notification form
    const [pickupLocation, setPickupLocation] = useState('Văn phòng khoa - Phòng 202, Tòa nhà A');
    const [pickupDate, setPickupDate] = useState('');
    const [emailSubjectTemplate, setEmailSubjectTemplate] = useState('Thông báo nhận giấy giới thiệu thực tập - {{termName}}');
    const [emailBodyTemplate, setEmailBodyTemplate] = useState(`Kính gửi sinh viên {{studentName}},

Khoa Công nghệ Thông tin & Truyền thông thông báo:

Sinh viên {{studentName}} (MSSV: {{studentCode}}) đã đủ điều kiện tham gia kỳ thực tập {{termName}}.

📍 Địa điểm nhận giấy giới thiệu: {{pickupLocation}}
📅 Thời gian bắt đầu nhận: {{pickupDate}}
🕐 Giờ làm việc: 7:30 - 11:30 và 13:30 - 17:00 (Thứ 2 - Thứ 6)

Lưu ý khi đến nhận giấy:
- Mang theo thẻ sinh viên
- Điền đầy đủ thông tin vào phiếu đăng ký
- Giấy giới thiệu chỉ cấp 1 lần

Mọi thắc mắc xin liên hệ văn phòng khoa.

Trân trọng,
Ban Quản lý Thực tập - Khoa CNTT&TT`);

    const loadRoster = useCallback(async (termId: string) => {
        try {
            const res = await apiClient.get<RosterStudent[]>(`/api/v1/rosters/by-term/${termId}`);
            setRoster(Array.isArray(res.data) ? res.data : []);
        } catch {
            setRoster([]);
        }
    }, []);

    useEffect(() => {
        if (!user?.departmentId) { setIsLoading(false); return; }
        async function fetchInitData() {
            try {
                const [progRes, termRes] = await Promise.all([
                    apiClient.get<any[]>('/api/v1/academic-programs'),
                    apiClient.get<any[]>(`/api/v1/terms/by-department/${user!.departmentId}`),
                ]);

                if (progRes.data && Array.isArray(progRes.data)) {
                    const facultyPrograms = progRes.data.filter(p => p.departmentId === user?.departmentId);
                    setPrograms(facultyPrograms);
                    if (facultyPrograms.length > 0) setNewProgramId(facultyPrograms[0].id);
                }

                if (termRes.data && Array.isArray(termRes.data) && termRes.data.length > 0) {
                    setTerms(termRes.data);
                    const termId = termRes.data[0].id;
                    setSelectedTermId(termId);
                    await loadRoster(termId);
                }
            } catch {
                setRoster([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchInitData();
    }, [user?.departmentId, loadRoster]);

    const handleTermChange = async (termId: string) => {
        setSelectedTermId(termId);
        setIsLoading(true);
        await loadRoster(termId);
        setIsLoading(false);
    };

    const filtered = roster.filter(s => {
        const matchSearch = (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.classCode || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchProgram = !filterProgram || s.programName?.toLowerCase().includes(filterProgram.toLowerCase());
        return matchSearch && matchProgram;
    });

    // Stats
    const stats = {
        total: roster.length,
        eligible: roster.filter(s => s.eligibilityStatus === 'ELIGIBLE').length,
        activated: roster.filter(s => s.claimedUserId).length,
        notActivated: roster.filter(s => !s.claimedUserId).length,
    };

    const handleProvisionAccount = async () => {
        if (!provisionTarget) return;
        setIsProvisioning(true);
        try {
            const res = await apiClient.post<{
                id: string; studentCode: string; fullName: string; officialEmail: string;
                claimedUserId?: string; defaultPassword?: string;
            }>(`/api/v1/rosters/${provisionTarget.id}/provision-account`);
            const data = res.data;
            // Update roster list to reflect claimedUserId
            setRoster(prev => prev.map(s =>
                s.id === provisionTarget.id ? { ...s, claimedUserId: data.claimedUserId || s.claimedUserId } : s
            ));
            if (data.defaultPassword) {
                setProvisionResult({ password: data.defaultPassword, email: data.officialEmail });
            } else {
                // Existing user was linked (no password returned)
                setProvisionResult({ password: '', email: data.officialEmail });
                setProvisionTarget(null);
                setMessage({ type: 'success', text: `Đã liên kết tài khoản có sẵn cho sinh viên ${provisionTarget.fullName}.` });
            }
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Không thể tạo tài khoản. Vui lòng thử lại.' });
            setProvisionTarget(null);
        } finally {
            setIsProvisioning(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleManualAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTermId) { setMessage({ type: 'error', text: 'Chưa chọn kỳ thực tập.' }); return; }
        const effectiveProgId = newProgramId || programs[0]?.id;
        if (!effectiveProgId || !newStudentCode.trim() || !newFullName.trim() || !newEmail.trim()) {
            setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ MSSV, Họ tên, Email và Ngành đào tạo.' });
            return;
        }
        setIsImporting(true);
        try {
            const items = [{
                programId: effectiveProgId,
                studentCode: newStudentCode.trim().toUpperCase(),
                officialEmail: newEmail.trim().toLowerCase(),
                fullName: newFullName.trim(),
                academicYear: newAcademicYear.trim(),
                classCode: newClassCode.trim() || null,
                internshipCourseCode: courseCode.trim().toUpperCase(),
                eligibilityStatus: 'ELIGIBLE',
            }];
            const res = await apiClient.post<RosterStudent[]>(`/api/v1/rosters/import/${selectedTermId}`, items);
            if (res.data && Array.isArray(res.data)) {
                setRoster(prev => {
                    const existingIds = new Set(prev.map(s => s.id));
                    const newItems = res.data.filter((s: RosterStudent) => !existingIds.has(s.id));
                    return [...newItems, ...prev];
                });
            }
            setMessage({ type: 'success', text: `Đã thêm sinh viên ${newFullName} (${newStudentCode}) vào danh sách.` });
            setIsImportModalOpen(false);
            setNewStudentCode(''); setNewFullName(''); setNewEmail(''); setNewClassCode('');
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm sinh viên.' });
        } finally {
            setIsImporting(false);
        }
    };

    const handleSheetImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTermId) { setMessage({ type: 'error', text: 'Chọn kỳ thực tập trước khi import.' }); return; }
        setIsImporting(true);
        try {
            const id = spreadsheetId.match(/\/spreadsheets\/d\/([A-Za-z0-9_-]+)/)?.[1] || spreadsheetId.trim();
            const result = await apiClient.post<RosterStudent[]>(`/api/v1/rosters/import-sheet/${selectedTermId}`, {
                spreadsheetId: id,
                range: sheetRange.trim(),
            });
            await loadRoster(selectedTermId);
            setMessage({ type: 'success', text: `Đã import ${result.data?.length ?? 0} sinh viên từ Google Sheets.` });
            setIsSheetModalOpen(false);
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không import được Google Sheet.' });
        } finally {
            setIsImporting(false);
        }
    };

    const handleNotifyPickup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTermId) return;
        setIsImporting(true);
        try {
            const result = await apiClient.post<{
                eligible: number; emailsSent: number;
                notificationsCreated: number; failedStudentCodes: string[];
            }>(`/api/v1/terms/${selectedTermId}/introduction-letter-notice`, {
                pickupLocation,
                pickupDate,
                emailSubjectTemplate,
                emailBodyTemplate,
            });
            const data = result.data;
            setMessage({
                type: data?.failedStudentCodes?.length ? 'error' : 'success',
                text: `Đã gửi ${data?.emailsSent ?? 0}/${data?.eligible ?? 0} email thông báo.${data?.failedStudentCodes?.length ? ` Lỗi gửi cho: ${data.failedStudentCodes.join(', ')}` : ''}`,
            });
            setIsEmailModalOpen(false);
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không gửi được thông báo.' });
        } finally {
            setIsImporting(false);
        }
    };

    const selectedTerm = terms.find(t => t.id === selectedTermId);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-sky-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Danh Sách Sinh Viên Đăng Ký Thực Tập</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Quản lý danh sách sinh viên đủ điều kiện tham gia kỳ thực tập
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="secondary" onClick={() => setIsSheetModalOpen(true)} className="gap-2 text-sm">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Import GG Sheet
                    </Button>
                    <Button variant="primary" onClick={() => setIsImportModalOpen(true)} className="gap-2 text-sm">
                        <Upload className="w-4 h-4" />
                        Thêm sinh viên
                    </Button>
                </div>
            </div>

            {/* Alert message */}
            {message && (
                <div role="alert" aria-live="polite" className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                    message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            : <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        }
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 ml-4 text-lg leading-none">&times;</button>
                </div>
            )}

            {/* Term Selector + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Term Selector */}
                <Card className="lg:col-span-1">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4 text-sky-600" />
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Học kỳ</span>
                        </div>
                        {terms.length > 0 ? (
                            <Select
                                label=""
                                id="termSelect"
                                value={selectedTermId}
                                onChange={(e) => handleTermChange(e.target.value)}
                                options={terms.map(t => ({
                                    value: t.id,
                                    label: `${t.code} (${t.academicYear})`
                                }))}
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
                        {/* Send email button */}
                        <Button
                            variant="secondary"
                            onClick={() => setIsEmailModalOpen(true)}
                            disabled={!selectedTermId || stats.total === 0}
                            className="w-full gap-2 text-xs mt-2"
                        >
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                            Gửi thông báo email
                        </Button>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Tổng sinh viên', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
                        { label: 'Đủ điều kiện', value: stats.eligible, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                        { label: 'Đã kích hoạt TK', value: stats.activated, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
                        { label: 'Chưa kích hoạt', value: stats.notActivated, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
                    ].map(stat => (
                        <Card key={stat.label} className={`${stat.bg} border ${stat.border}`}>
                            <CardContent className="p-4">
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo tên, MSSV hoặc mã lớp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white"
                            />
                        </div>
                        <select
                            value={filterProgram}
                            onChange={(e) => setFilterProgram(e.target.value)}
                            className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white text-slate-700 min-w-[180px]"
                        >
                            <option value="">Tất cả ngành</option>
                            {programs.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                        <div className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                            <span className="font-semibold text-slate-700">{filtered.length}</span> / {roster.length} sinh viên
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            {isLoading ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Đang tải danh sách...</p>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <EmptyState
                    title="Chưa có sinh viên trong danh sách"
                    description="Kỳ thực tập này chưa có sinh viên nào. Hãy thêm thủ công hoặc import từ Google Sheets."
                    action={
                        <div className="flex gap-3 justify-center">
                            <Button variant="secondary" onClick={() => setIsSheetModalOpen(true)} className="gap-2">
                                <FileSpreadsheet className="w-4 h-4" />
                                Import từ Google Sheets
                            </Button>
                            <Button variant="primary" onClick={() => setIsImportModalOpen(true)} className="gap-2">
                                <Upload className="w-4 h-4" />
                                Thêm thủ công
                            </Button>
                        </div>
                    }
                />
            ) : (
                <Card className="min-w-0 overflow-hidden border-slate-200/80 shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">STT</th>
                                    <th className="px-4 py-3">Sinh viên</th>
                                    <th className="px-4 py-3">MSSV</th>
                                    <th className="px-4 py-3">Lớp</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Khóa</th>
                                    <th className="px-4 py-3">Ngành</th>
                                    <th className="px-4 py-3 text-center">Điều kiện</th>
                                    <th className="px-4 py-3 text-center">Tài khoản</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {filtered.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-sky-50/40 transition-colors">
                                        <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-900">{s.fullName}</div>
                                            {s.internshipCourseCode && (
                                                <div className="text-[10px] text-slate-400 mt-0.5">HP: {s.internshipCourseCode}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sky-700 font-bold">{s.studentCode}</td>
                                        <td className="px-4 py-3">
                                            {s.classCode ? (
                                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                                                    <Hash className="w-2.5 h-2.5" />
                                                    {s.classCode}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{s.officialEmail}</td>
                                        <td className="px-4 py-3 text-slate-600">{s.academicYear}</td>
                                        <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate" title={s.programName}>{s.programName}</td>
                                        <td className="px-4 py-3 text-center">
                                            {s.eligibilityStatus === 'ELIGIBLE' ? (
                                                <Badge variant="success" className="text-[10px]">Đủ điều kiện</Badge>
                                            ) : s.eligibilityStatus === 'NEEDS_REVIEW' ? (
                                                <Badge variant="warning" className="text-[10px]">Cần xem xét</Badge>
                                            ) : (
                                                <Badge variant="destructive" className="text-[10px]">Không đủ</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {s.claimedUserId ? (
                                                <Badge variant="success" className="text-[10px]">Đã kích hoạt</Badge>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <Badge variant="secondary" className="text-[10px]">Chưa có TK</Badge>
                                                    <button
                                                        onClick={() => { setProvisionTarget(s); setProvisionResult(null); setShowPassword(false); }}
                                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full transition"
                                                        title="Tạo tài khoản sinh viên từ roster này"
                                                    >
                                                        <UserPlus className="w-3 h-3" />
                                                        Tạo TK
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length > 0 && (
                        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500 text-right">
                            Hiển thị {filtered.length} / {roster.length} sinh viên
                        </div>
                    )}
                </Card>
            )}

            {/* Google Sheet Import Modal */}
            <Modal isOpen={isSheetModalOpen} onClose={() => setIsSheetModalOpen(false)} title="Import từ Google Sheets" maxWidth="lg">
                <div className="space-y-5">
                    {/* Info box */}
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                        <div className="flex gap-2">
                            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-sky-800 space-y-1.5">
                                <p className="font-semibold">Hướng dẫn cấu trúc Google Sheets:</p>
                                <p>Dòng đầu tiên (header) phải có đúng các cột sau:</p>
                                <div className="font-mono bg-sky-100 rounded-lg px-3 py-2 text-[10px] leading-relaxed space-y-0.5">
                                    <p><span className="text-sky-700 font-bold">studentCode</span> · MSSV (bắt buộc)</p>
                                    <p><span className="text-sky-700 font-bold">fullName</span> · Họ và tên (bắt buộc)</p>
                                    <p><span className="text-sky-700 font-bold">officialEmail</span> · Email CTU (bắt buộc)</p>
                                    <p><span className="text-sky-700 font-bold">programCode</span> · Mã ngành học (bắt buộc)</p>
                                    <p><span className="text-sky-700 font-bold">academicYear</span> · Khóa học, VD: Khóa 47 (bắt buộc)</p>
                                    <p><span className="text-sky-700 font-bold">internshipCourseCode</span> · Mã học phần (bắt buộc)</p>
                                    <p><span className="text-indigo-600 font-bold">classCode</span> · Mã lớp, VD: CT47A (tùy chọn)</p>
                                    <p><span className="text-slate-500">eligibilityStatus</span> · ELIGIBLE/INELIGIBLE (tùy chọn)</p>
                                    <p><span className="text-slate-500">eligibilityNote</span> · Ghi chú (tùy chọn)</p>
                                </div>
                                <p className="text-sky-700 font-medium">⚠ Chia sẻ Google Sheet với tài khoản dịch vụ Google của hệ thống để đọc dữ liệu.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSheetImport} className="space-y-4">
                        <Input
                            label="Link hoặc ID Google Sheet"
                            placeholder="https://docs.google.com/spreadsheets/d/... hoặc ID trực tiếp"
                            value={spreadsheetId}
                            onChange={e => setSpreadsheetId(e.target.value)}
                            required
                        />
                        <Input
                            label="Vùng dữ liệu (Range)"
                            placeholder="VD: Sheet1!A:I"
                            value={sheetRange}
                            onChange={e => setSheetRange(e.target.value)}
                            required
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={() => setIsSheetModalOpen(false)}>Hủy</Button>
                            <Button type="submit" variant="primary" isLoading={isImporting} disabled={!selectedTermId} className="gap-2">
                                <FileSpreadsheet className="w-4 h-4" />
                                Import danh sách
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Manual Add Modal */}
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Thêm sinh viên thủ công" maxWidth="md">
                <form onSubmit={handleManualAdd} className="space-y-4">
                    <p className="text-xs text-slate-500">Thêm từng sinh viên vào danh sách thực tập theo kỳ đã chọn.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Input
                                label="MSSV *"
                                placeholder="VD: B2306614"
                                value={newStudentCode}
                                onChange={(e) => {
                                    const code = e.target.value;
                                    setNewStudentCode(code);
                                    // Auto khóa học
                                    const year = deriveAcademicYear(code);
                                    if (year) setNewAcademicYear(year);
                                    // Auto email nếu đã có tên
                                    if (newFullName.trim()) {
                                        const email = deriveEmail(newFullName, code);
                                        if (email) setNewEmail(email);
                                    }
                                }}
                                required
                            />
                        </div>
                        <Input
                            label="Mã lớp"
                            placeholder="VD: CT49A"
                            value={newClassCode}
                            onChange={(e) => setNewClassCode(e.target.value)}
                        />
                    </div>
                    <div>
                        <Input
                            label="Họ và tên *"
                            placeholder="Nguyễn Văn A"
                            value={newFullName}
                            onChange={(e) => {
                                const name = e.target.value;
                                setNewFullName(name);
                                // Auto email khi gõ tên (nếu đã có MSSV)
                                if (newStudentCode.trim()) {
                                    const email = deriveEmail(name, newStudentCode);
                                    if (email) setNewEmail(email);
                                }
                            }}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            label="Email sinh viên *"
                            type="email"
                            placeholder="haob2306614@student.ctu.edu.vn"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                        {newEmail.endsWith('@student.ctu.edu.vn') && (
                            <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Tự điền theo tên + MSSV. Có thể chỉnh sửa nếu cần.
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Input
                                label="Khóa học *"
                                placeholder="Khóa 49"
                                value={newAcademicYear}
                                onChange={(e) => setNewAcademicYear(e.target.value)}
                            />
                            {newAcademicYear && newStudentCode && (
                                <p className="text-[10px] text-sky-600 mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Tự tính từ MSSV
                                </p>
                            )}
                        </div>
                        <Input
                            label="Mã học phần *"
                            placeholder="CT444"
                            value={courseCode}
                            onChange={e => setCourseCode(e.target.value)}
                            required
                        />
                    </div>
                    {programs.length > 0 && (
                        <Select
                            label="Ngành đào tạo *"
                            value={newProgramId}
                            onChange={(e) => setNewProgramId(e.target.value)}
                            options={programs.map(p => ({ value: p.id, label: `${p.name} (${p.code})` }))}
                        />
                    )}
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setIsImportModalOpen(false)} disabled={isImporting}>Hủy</Button>
                        <Button type="submit" variant="primary" isLoading={isImporting} className="gap-2">
                            <Upload className="w-4 h-4" />
                            Xác nhận thêm
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Email Notification Modal */}
            <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title="Gửi email thông báo nhận giấy giới thiệu" maxWidth="2xl">
                <form onSubmit={handleNotifyPickup} className="space-y-5">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex gap-2">
                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                                Email sẽ được gửi đến <strong>{stats.eligible}</strong> sinh viên đủ điều kiện trong kỳ thực tập này.
                                Bạn có thể chỉnh sửa nội dung email trước khi gửi. Các biến dữ liệu như <code>{'{{studentName}}'}</code>, <code>{'{{studentCode}}'}</code>, <code>{'{{termName}}'}</code>, <code>{'{{pickupLocation}}'}</code>, <code>{'{{pickupDate}}'}</code> sẽ được tự động điền.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Địa điểm nhận giấy *"
                            placeholder="Văn phòng khoa, Phòng 202"
                            value={pickupLocation}
                            onChange={e => setPickupLocation(e.target.value)}
                            required
                        />
                        <Input
                            label="Ngày bắt đầu nhận *"
                            type="date"
                            value={pickupDate}
                            onChange={e => setPickupDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tiêu đề email</label>
                        <input
                            type="text"
                            value={emailSubjectTemplate}
                            onChange={e => setEmailSubjectTemplate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nội dung email (có thể chỉnh sửa)</label>
                        <textarea
                            value={emailBodyTemplate}
                            onChange={e => setEmailBodyTemplate(e.target.value)}
                            rows={14}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 resize-y"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={() => setIsEmailModalOpen(false)}>Hủy</Button>
                <Button type="submit" variant="primary" isLoading={isImporting} disabled={!selectedTermId || stats.total === 0} className="gap-2">
                            <Mail className="w-4 h-4" />
                            Gửi thông báo ({stats.eligible} email)
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ── Provision Account Confirm Modal ── */}
            <Modal
                isOpen={!!provisionTarget && !provisionResult}
                onClose={() => setProvisionTarget(null)}
                title="Tạo tài khoản sinh viên"
                maxWidth="md"
            >
                {provisionTarget && (
                    <div className="space-y-5">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex gap-2">
                                <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800 space-y-1.5">
                                    <p className="font-semibold">Sẽ tạo tài khoản sinh viên với thông tin:</p>
                                    <div className="space-y-0.5">
                                        <p>👤 <strong>{provisionTarget.fullName}</strong></p>
                                        <p>🆔 MSSV: <strong>{provisionTarget.studentCode}</strong></p>
                                        <p>📧 Email đăng nhập: <strong>{provisionTarget.officialEmail}</strong></p>
                                        <p>🔑 Mật khẩu mặc định: <strong>Internlink@ + 6 số cuối MSSV</strong></p>
                                    </div>
                                    <p className="text-amber-700 font-medium mt-2">
                                        ⚠ Sinh viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
                                    </p>
                                    <p className="text-amber-600">
                                        Nếu email <strong>{provisionTarget.officialEmail}</strong> đã có tài khoản, hệ thống sẽ tự động liên kết.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setProvisionTarget(null)} disabled={isProvisioning}>
                                Hủy
                            </Button>
                            <Button variant="primary" onClick={handleProvisionAccount} isLoading={isProvisioning} className="gap-2">
                                <UserPlus className="w-4 h-4" />
                                Xác nhận tạo tài khoản
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Password Result Modal ── */}
            <Modal
                isOpen={!!provisionResult && !!provisionResult.password}
                onClose={() => { setProvisionResult(null); setProvisionTarget(null); }}
                title="Tạo tài khoản thành công!"
                maxWidth="md"
            >
                {provisionResult && provisionResult.password && (
                    <div className="space-y-5">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <div className="flex gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-emerald-800 space-y-1">
                                    <p className="font-semibold">Tài khoản đã được tạo thành công!</p>
                                    <p>Sinh viên có thể đăng nhập ngay bằng thông tin dưới đây.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Email đăng nhập</label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                    <span className="flex-1 text-sm font-mono text-slate-800">{provisionResult.email}</span>
                                    <button
                                        onClick={() => copyToClipboard(provisionResult.email)}
                                        className="text-slate-400 hover:text-slate-700 transition shrink-0"
                                        title="Sao chép email"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Mật khẩu mặc định</label>
                                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                                    <span className="flex-1 text-sm font-mono text-slate-800 tracking-wider">
                                        {showPassword ? provisionResult.password : '•'.repeat(provisionResult.password.length)}
                                    </span>
                                    <button
                                        onClick={() => setShowPassword(v => !v)}
                                        className="text-slate-400 hover:text-slate-700 transition shrink-0"
                                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(provisionResult.password)}
                                        className="text-slate-400 hover:text-slate-700 transition shrink-0"
                                        title="Sao chép mật khẩu"
                                    >
                                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
                            <p className="font-semibold">⚠ Lưu ý bảo mật:</p>
                            <p>Hãy thông báo mật khẩu này trực tiếp cho sinh viên. Mật khẩu chỉ hiển thị 1 lần và không thể xem lại sau khi đóng cửa sổ này.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                            <Button
                                variant="secondary"
                                onClick={() => copyToClipboard(`Email: ${provisionResult.email}\nMật khẩu: ${provisionResult.password}`)}
                                className="gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Sao chép cả hai
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => { setProvisionResult(null); setProvisionTarget(null); }}
                                className="gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Đã ghi nhận, đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

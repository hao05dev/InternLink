'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { KanbanBoard, KanbanStage, KanbanItem } from '@/components/shared/kanban-board';
import {
    Users,
    Eye,
    Calendar,
    Mail,
    Phone,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Award,
    Send,
    AlertCircle,
    Layers,
    List,
    Search,
    GraduationCap,
    GripVertical,
} from 'lucide-react';
import type { CandidateApplication, ApplicationStatus } from '@/features/jobs/types/application.types';

const KANBAN_STAGES: KanbanStage[] = [
    { id: 'PENDING', label: 'Hồ sơ mới (Chờ duyệt)', color: 'blue' },
    { id: 'SHORTLISTED', label: 'Đang xem xét', color: 'amber' },
    { id: 'INTERVIEW_SCHEDULED', label: 'Phỏng vấn', color: 'purple' },
    { id: 'OFFERED', label: 'Đã gửi Offer', color: 'emerald' },
    { id: 'REJECTED', label: 'Không phù hợp', color: 'rose' },
];

export default function CompanyCandidatesView() {
    const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCand, setSelectedCand] = useState<CandidateApplication | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

    // Filter & Pagination for table view
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [tablePage, setTablePage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(10);

    // Interview Modal state
    const [interviewModalCand, setInterviewModalCand] = useState<CandidateApplication | null>(null);
    const [interviewDate, setInterviewDate] = useState('2026-09-30T10:00');
    const [interviewLocation, setInterviewLocation] = useState('Tòa nhà FPT Cần Thơ, KDC Nam Long / Online MS Teams');
    const [interviewNote, setInterviewNote] = useState('Ứng viên chuẩn bị đồ án môn học hoặc GitHub cá nhân');
    const [isScheduling, setIsScheduling] = useState(false);

    // Offer Modal state
    const [offerModalCand, setOfferModalCand] = useState<CandidateApplication | null>(null);
    const [offerStipend, setOfferStipend] = useState('4500000');
    const [offerStartDate, setOfferStartDate] = useState('2026-10-01');
    const [offerEndDate, setOfferEndDate] = useState('2026-12-25');
    const [offerNote, setOfferNote] = useState('Chúc mừng bạn đã trúng tuyển chương trình thực tập tốt nghiệp tại FPT Software Cần Thơ!');
    const [isSendingOffer, setIsSendingOffer] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchCandidates() {
            try {
                const res = await apiClient.get<Array<Omit<CandidateApplication, 'status' | 'appliedAt' | 'cvDocumentId'> & {
                    submittedAt: string;
                    submittedCvDocumentId: string;
                    status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN';
                }>>('/api/v1/applications/company/mine');
                setCandidates((res.data ?? []).map(candidate => ({
                    ...candidate,
                    appliedAt: candidate.submittedAt,
                    cvDocumentId: candidate.submittedCvDocumentId,
                    status: candidate.status === 'SUBMITTED' ? 'PENDING'
                        : candidate.status === 'REVIEWING' ? 'SHORTLISTED'
                        : candidate.status === 'INTERVIEWING' ? 'INTERVIEW_SCHEDULED'
                        : candidate.status,
                })));
            } catch (error) {
                setCandidates([]);
                setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không tải được danh sách ứng viên.' });
            } finally {
                setIsLoading(false);
            }
        }

        fetchCandidates();
    }, []);

    // Drag-and-drop status update
    const handleKanbanMove = async (itemId: string, targetStageId: string) => {
        const cand = candidates.find(c => c.id === itemId);
        if (!cand) return;

        // Map frontend stage back to backend status
        let backendStatus: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' = 'REVIEWING';
        if (targetStageId === 'PENDING') backendStatus = 'SUBMITTED';
        else if (targetStageId === 'SHORTLISTED') backendStatus = 'REVIEWING';
        else if (targetStageId === 'INTERVIEW_SCHEDULED') backendStatus = 'INTERVIEWING';
        else if (targetStageId === 'OFFERED') backendStatus = 'OFFERED';
        else if (targetStageId === 'REJECTED') backendStatus = 'REJECTED';

        try {
            await apiClient.patch(`/api/v1/applications/${cand.id}/status?status=${backendStatus}`);
            setCandidates(prev =>
                prev.map(c => c.id === cand.id ? { ...c, status: targetStageId as ApplicationStatus } : c)
            );
            setMessage({
                type: 'success',
                text: `Đã chuyển ứng viên ${cand.studentName} sang trạng thái: ${
                    KANBAN_STAGES.find(s => s.id === targetStageId)?.label || targetStageId
                }.`,
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Không cập nhật được trạng thái ứng viên.',
            });
        }
    };

    const handleScheduleInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!interviewModalCand) return;

        setIsScheduling(true);
        try {
            if (interviewModalCand.status === 'PENDING') {
                await apiClient.patch(`/api/v1/applications/${interviewModalCand.id}/status?status=REVIEWING`);
            }
            await apiClient.patch(`/api/v1/applications/${interviewModalCand.id}/status?status=INTERVIEWING`);
            setCandidates(prev =>
                prev.map(c =>
                    c.id === interviewModalCand.id
                        ? {
                              ...c,
                              status: 'INTERVIEW_SCHEDULED' as ApplicationStatus,
                              interviewScheduledAt: interviewDate,
                              interviewLocation,
                          }
                        : c
                )
            );
            setMessage({ type: 'success', text: `Đã chuyển hồ sơ ${interviewModalCand.studentName} sang bước phỏng vấn. API chưa lưu ngày giờ hẹn; vui lòng thông báo riêng cho ứng viên.` });
            setInterviewModalCand(null);
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không cập nhật được trạng thái ứng viên.' });
        } finally {
            setIsScheduling(false);
        }
    };

    const handleSendOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!offerModalCand) return;

        setIsSendingOffer(true);
        try {
            await apiClient.post('/api/v1/offers', {
                applicationId: offerModalCand.id,
                stipendAmount: parseFloat(offerStipend) || 0,
                startDate: offerStartDate,
                endDate: offerEndDate,
                notes: offerNote,
            });

            setCandidates(prev =>
                prev.map(c => c.id === offerModalCand.id ? { ...c, status: 'OFFERED' as ApplicationStatus } : c)
            );
            setMessage({ type: 'success', text: `Đã phát hành Thư mời tiếp nhận (Offer) cho sinh viên ${offerModalCand.studentName}.` });
            setOfferModalCand(null);
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không phát hành được thư mời.' });
        } finally {
            setIsSendingOffer(false);
        }
    };

    const handleRejectCandidate = async (cand: CandidateApplication) => {
        try {
            await apiClient.patch(`/api/v1/applications/${cand.id}/status?status=REJECTED`);
            setCandidates(prev =>
                prev.map(c => c.id === cand.id ? { ...c, status: 'REJECTED' as ApplicationStatus } : c)
            );
            setMessage({ type: 'success', text: `Đã cập nhật trạng thái Chưa phù hợp cho ứng viên ${cand.studentName}.` });
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không từ chối được ứng viên.' });
        }
    };

    // Filter candidates for table view
    const filteredCandidates = useMemo(() => {
        let list = candidates;
        if (statusFilter !== 'ALL') {
            list = list.filter(c => c.status === statusFilter);
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase().trim();
            list = list.filter(
                c =>
                    (c.studentName || '').toLowerCase().includes(q) ||
                    (c.jobTitle || '').toLowerCase().includes(q) ||
                    c.studentCode?.toLowerCase().includes(q) ||
                    c.programName?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [candidates, statusFilter, searchTerm]);

    const totalTablePages = Math.ceil(filteredCandidates.length / tablePageSize) || 1;
    const paginatedCandidates = useMemo(() => {
        const start = (tablePage - 1) * tablePageSize;
        return filteredCandidates.slice(start, start + tablePageSize);
    }, [filteredCandidates, tablePage, tablePageSize]);

    // Format candidates for Kanban Board
    const kanbanItems: KanbanItem[] = useMemo(() => {
        return candidates.map(c => ({
            id: c.id,
            stageId: c.status,
            title: c.studentName || 'Sinh viên',
            subtitle: `${c.jobTitle || ''} • MSSV: ${c.studentCode || ''}`,
            tags: c.skills || [],
            metadata: [
                { label: 'Ngành', value: c.programName || '—' },
                { label: 'GPA', value: c.gpa ? c.gpa.toFixed(2) : '—' },
            ],
            raw: c,
        }));
    }, [candidates]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Quản Lý Ứng Viên & Tuyển Dụng
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Theo dõi phễu tuyển dụng, sàng lọc hồ sơ trực quan bằng kéo thả và lên lịch phỏng vấn
                    </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                    <button
                        type="button"
                        onClick={() => setViewMode('kanban')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            viewMode === 'kanban'
                                ? 'bg-white text-blue-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Kanban Pipeline</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            viewMode === 'table'
                                ? 'bg-white text-blue-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        <span>Danh sách ({candidates.length})</span>
                    </button>
                </div>
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
                        type="button"
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600 text-base leading-none"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Main Area */}
            {candidates.length === 0 ? (
                <EmptyState
                    title="Chưa có hồ sơ ứng tuyển"
                    description="Hiện tại chưa có sinh viên nào nộp hồ sơ vào các vị trí thực tập của doanh nghiệp."
                />
            ) : viewMode === 'kanban' ? (
                /* KANBAN PIPELINE VIEW */
                <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                        💡 <strong>Mẹo:</strong> Kéo thẻ ứng viên giữa các cột để thay đổi trạng thái tuyển dụng tức thì. Click vào thẻ để xem chi tiết hồ sơ.
                    </p>
                    <KanbanBoard
                        stages={KANBAN_STAGES}
                        items={kanbanItems}
                        onItemMove={handleKanbanMove}
                        renderCustomCard={(item, isDragging) => {
                            const cand = item.raw as CandidateApplication;
                            return (
                                <div
                                    className={`group rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all ${
                                        isDragging ? 'opacity-40 scale-95 border-blue-400 rotate-1 shadow-lg' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                                {cand.studentName}
                                            </h4>
                                            <p className="text-[11px] font-medium text-blue-700 truncate mt-0.5">
                                                {cand.jobTitle}
                                            </p>
                                        </div>
                                        <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                                        <span className="font-mono font-semibold bg-slate-100 px-1.5 py-0.2 rounded">
                                            {cand.studentCode}
                                        </span>
                                        {cand.gpa && (
                                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                                GPA {cand.gpa.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {cand.skills && cand.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {cand.skills.slice(0, 3).map((s, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                                                    {s}
                                                </span>
                                            ))}
                                            {cand.skills.length > 3 && (
                                                <span className="text-[10px] text-slate-400">+{cand.skills.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons on Card */}
                                    <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCand(cand);
                                                setIsDetailModalOpen(true);
                                            }}
                                            className="px-2 py-1 rounded text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            Xem CV
                                        </button>
                                        {cand.status !== 'REJECTED' && cand.status !== 'OFFERED' && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRejectCandidate(cand);
                                                }}
                                                className="px-2 py-1 rounded text-[10px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                                            >
                                                Từ chối
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>
            ) : (
                /* TABLE / LIST VIEW */
                <div className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setTablePage(1);
                                }}
                                placeholder="Tìm theo tên, MSSV, vị trí..."
                                className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Trạng thái:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setTablePage(1);
                                }}
                                className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                            >
                                <option value="ALL">Tất cả ({candidates.length})</option>
                                {KANBAN_STAGES.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Candidate Cards in Table View */}
                    <div className="space-y-3">
                        {paginatedCandidates.map((cand) => (
                            <Card key={cand.id} className="hover:border-slate-300 transition-colors shadow-2xs">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className="font-bold text-sm text-slate-900">{cand.studentName}</span>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                    MSSV: {cand.studentCode}
                                                </span>
                                                <span className="text-xs text-slate-500">{cand.programName}</span>
                                                {cand.gpa && (
                                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                        GPA: {cand.gpa.toFixed(2)}
                                                    </span>
                                                )}
                                                <StatusBadge status={cand.status} type="application" />
                                            </div>

                                            <p className="text-xs font-medium text-slate-700">
                                                Vị trí: <span className="font-semibold text-blue-700">{cand.jobTitle}</span>
                                            </p>

                                            {cand.skills && cand.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-0.5">
                                                    {cand.skills.map((s, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px] py-0.2">
                                                            {s}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCand(cand);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="gap-1.5 text-xs"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Xem CV</span>
                                            </Button>

                                            {(cand.status === 'PENDING' || cand.status === 'SHORTLISTED') && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setInterviewModalCand(cand)}
                                                    className="gap-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                                                >
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>Lịch phỏng vấn</span>
                                                </Button>
                                            )}

                                            {cand.status !== 'REJECTED' && cand.status !== 'OFFERED' && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleRejectCandidate(cand)}
                                                    className="text-xs"
                                                >
                                                    Từ chối
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {filteredCandidates.length > 0 && (
                        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                            <Pagination
                                currentPage={tablePage}
                                totalPages={totalTablePages}
                                totalItems={filteredCandidates.length}
                                pageSize={tablePageSize}
                                pageSizeOptions={[5, 10, 20]}
                                onPageChange={setTablePage}
                                onPageSizeChange={(sz) => {
                                    setTablePageSize(sz);
                                    setTablePage(1);
                                }}
                                itemLabel="hồ sơ"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Candidate Detail Modal */}
            {selectedCand && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    title={`Hồ sơ ứng viên: ${selectedCand.studentName}`}
                    description={`Vị trí: ${selectedCand.jobTitle} • Nộp ngày: ${new Date(selectedCand.appliedAt).toLocaleDateString('vi-VN')}`}
                    maxWidth="2xl"
                >
                    <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                                <span className="text-slate-400">MSSV:</span>{' '}
                                <strong className="text-slate-800">{selectedCand.studentCode}</strong>
                            </div>
                            <div>
                                <span className="text-slate-400">Ngành học:</span>{' '}
                                <strong className="text-slate-800">{selectedCand.programName}</strong>
                            </div>
                            <div>
                                <span className="text-slate-400">GPA tích lũy:</span>{' '}
                                <strong className="text-emerald-700">{selectedCand.gpa ? selectedCand.gpa.toFixed(2) : '—'}</strong>
                            </div>
                            <div>
                                <span className="text-slate-400">Trạng thái:</span>{' '}
                                <StatusBadge status={selectedCand.status} type="application" />
                            </div>
                        </div>

                        {selectedCand.coverLetter && (
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-800">Thư giới thiệu (Cover Letter)</h4>
                                <div className="p-3 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-line border border-slate-100">
                                    {selectedCand.coverLetter}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Interview Modal */}
            {interviewModalCand && (
                <Modal
                    isOpen={Boolean(interviewModalCand)}
                    onClose={() => setInterviewModalCand(null)}
                    title={`Lên lịch phỏng vấn: ${interviewModalCand.studentName}`}
                    description={`Vị trí: ${interviewModalCand.jobTitle}`}
                    maxWidth="md"
                >
                    <form onSubmit={handleScheduleInterview} className="space-y-3.5 text-xs">
                        <Input
                            label="Thời gian phỏng vấn"
                            type="datetime-local"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            required
                        />
                        <Input
                            label="Địa điểm / Link phòng họp"
                            value={interviewLocation}
                            onChange={(e) => setInterviewLocation(e.target.value)}
                            required
                        />
                        <Textarea
                            label="Ghi chú cho ứng viên"
                            value={interviewNote}
                            onChange={(e) => setInterviewNote(e.target.value)}
                            rows={3}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setInterviewModalCand(null)}>
                                Hủy
                            </Button>
                            <Button type="submit" isLoading={isScheduling}>
                                Xác nhận phỏng vấn
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

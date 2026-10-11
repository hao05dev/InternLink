'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { KanbanBoard, KanbanStage, KanbanItem } from '@/components/shared/kanban-board';
import { CheckCircle2, AlertCircle, Layers, List, RotateCcw } from 'lucide-react';
import type { CandidateApplication, ApplicationStatus } from '@/features/jobs/types/application.types';

import { CompanyCandidateFilterBar } from './company/company-candidate-filter-bar';
import { CandidateInterviewModal } from './company/modals/candidate-interview-modal';
import { CandidateDetailModal } from './company/modals/candidate-detail-modal';
import { CandidateTableRowCard } from './company/cards/candidate-table-row-card';
import { CandidateKanbanCard } from './company/cards/candidate-kanban-card';

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
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

    // Modals state
    const [selectedCand, setSelectedCand] = useState<CandidateApplication | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [interviewModalCand, setInterviewModalCand] = useState<CandidateApplication | null>(null);

    // Filter & Pagination state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('ALL');
    const [selectedTermId, setSelectedTermId] = useState<string>('ALL');
    const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [tablePage, setTablePage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(10);

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

    // Extract dropdown lists
    const academicYearsList = useMemo(() => {
        const years = new Set<string>();
        candidates.forEach(c => {
            if (c.academicYear) years.add(c.academicYear);
        });
        return Array.from(years).sort((a, b) => b.localeCompare(a));
    }, [candidates]);

    const availableTermsList = useMemo(() => {
        const termMap = new Map<string, { id: string; name: string; academicYear?: string }>();
        candidates.forEach(c => {
            if (c.termId && c.termName) {
                if (selectedAcademicYear === 'ALL' || c.academicYear === selectedAcademicYear) {
                    termMap.set(c.termId, { id: c.termId, name: c.termName, academicYear: c.academicYear });
                }
            }
        });
        return Array.from(termMap.values());
    }, [candidates, selectedAcademicYear]);

    const jobsList = useMemo(() => {
        const jobMap = new Map<string, { id: string; title: string }>();
        candidates.forEach(c => {
            if (c.jobId && c.jobTitle) jobMap.set(c.jobId, { id: c.jobId, title: c.jobTitle });
        });
        return Array.from(jobMap.values());
    }, [candidates]);

    const handleAcademicYearChange = (year: string) => {
        setSelectedAcademicYear(year);
        if (year !== 'ALL' && selectedTermId !== 'ALL') {
            const stillValid = candidates.some(c => c.termId === selectedTermId && c.academicYear === year);
            if (!stillValid) setSelectedTermId('ALL');
        }
        setTablePage(1);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedAcademicYear('ALL');
        setSelectedTermId('ALL');
        setSelectedJobId('ALL');
        setStatusFilter('ALL');
        setTablePage(1);
    };

    const hasActiveFilters =
        Boolean(searchTerm.trim()) ||
        selectedAcademicYear !== 'ALL' ||
        selectedTermId !== 'ALL' ||
        selectedJobId !== 'ALL' ||
        statusFilter !== 'ALL';

    const filteredCandidates = useMemo(() => {
        let list = candidates;
        if (selectedAcademicYear !== 'ALL') list = list.filter(c => c.academicYear === selectedAcademicYear);
        if (selectedTermId !== 'ALL') list = list.filter(c => c.termId === selectedTermId);
        if (selectedJobId !== 'ALL') list = list.filter(c => c.jobId === selectedJobId);
        if (statusFilter !== 'ALL') list = list.filter(c => c.status === statusFilter);
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase().trim();
            list = list.filter(c =>
                (c.studentName || '').toLowerCase().includes(q) ||
                (c.jobTitle || '').toLowerCase().includes(q) ||
                c.studentCode?.toLowerCase().includes(q) ||
                c.programName?.toLowerCase().includes(q) ||
                c.skills?.some(s => s.toLowerCase().includes(q))
            );
        }
        return list;
    }, [candidates, selectedAcademicYear, selectedTermId, selectedJobId, statusFilter, searchTerm]);

    const totalTablePages = Math.ceil(filteredCandidates.length / tablePageSize) || 1;
    const paginatedCandidates = useMemo(() => {
        const start = (tablePage - 1) * tablePageSize;
        return filteredCandidates.slice(start, start + tablePageSize);
    }, [filteredCandidates, tablePage, tablePageSize]);

    const kanbanItems: KanbanItem[] = useMemo(() => {
        return filteredCandidates.map(c => ({
            id: c.id,
            stageId: c.status,
            title: c.studentName || 'Sinh viên',
            subtitle: `${c.jobTitle || ''} • MSSV: ${c.studentCode || ''}`,
            tags: c.skills || [],
            metadata: [
                { label: 'Ngành', value: c.programName || '—' },
                { label: 'GPA', value: c.gpa ? c.gpa.toFixed(2) : '—' },
                { label: 'Kỳ/Năm', value: c.termName || c.academicYear || '—' },
            ],
            raw: c,
        }));
    }, [filteredCandidates]);

    const handleKanbanMove = async (itemId: string, targetStageId: string) => {
        const cand = candidates.find(c => c.id === itemId);
        if (!cand) return;

        let backendStatus: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' = 'REVIEWING';
        if (targetStageId === 'PENDING') backendStatus = 'SUBMITTED';
        else if (targetStageId === 'SHORTLISTED') backendStatus = 'REVIEWING';
        else if (targetStageId === 'INTERVIEW_SCHEDULED') backendStatus = 'INTERVIEWING';
        else if (targetStageId === 'OFFERED') backendStatus = 'OFFERED';
        else if (targetStageId === 'REJECTED') backendStatus = 'REJECTED';

        try {
            await apiClient.patch(`/api/v1/applications/${cand.id}/status?status=${backendStatus}`);
            setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, status: targetStageId as ApplicationStatus } : c));
            setMessage({
                type: 'success',
                text: `Đã chuyển ứng viên ${cand.studentName} sang trạng thái: ${KANBAN_STAGES.find(s => s.id === targetStageId)?.label || targetStageId}.`,
            });
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không cập nhật được trạng thái ứng viên.' });
        }
    };

    const handleRejectCandidate = async (cand: CandidateApplication) => {
        try {
            await apiClient.patch(`/api/v1/applications/${cand.id}/status?status=REJECTED`);
            setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, status: 'REJECTED' as ApplicationStatus } : c));
            setMessage({ type: 'success', text: `Đã cập nhật trạng thái Chưa phù hợp cho ứng viên ${cand.studentName}.` });
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không từ chối được ứng viên.' });
        }
    };

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
            {/* Header & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Quản Lý Ứng Viên & Tuyển Dụng
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Theo dõi phễu tuyển dụng, sàng lọc hồ sơ trực quan bằng kéo thả và lên lịch phỏng vấn
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                    <button
                        type="button"
                        onClick={() => setViewMode('kanban')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            viewMode === 'kanban' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Kanban Pipeline</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            viewMode === 'table' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <List className="w-3.5 h-3.5" />
                        <span>Danh sách ({candidates.length})</span>
                    </button>
                </div>
            </div>

            {/* Notification Alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span>{message.text}</span>
                    </div>
                    <button type="button" onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 text-base leading-none">
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
            ) : (
                <div className="space-y-4">
                    <CompanyCandidateFilterBar
                        searchTerm={searchTerm}
                        onSearchChange={(val) => { setSearchTerm(val); setTablePage(1); }}
                        selectedAcademicYear={selectedAcademicYear}
                        academicYearsList={academicYearsList}
                        onAcademicYearChange={handleAcademicYearChange}
                        selectedTermId={selectedTermId}
                        termsList={availableTermsList}
                        onTermChange={(val) => { setSelectedTermId(val); setTablePage(1); }}
                        selectedJobId={selectedJobId}
                        jobsList={jobsList}
                        onJobChange={(val) => { setSelectedJobId(val); setTablePage(1); }}
                        statusFilter={statusFilter}
                        statusStages={KANBAN_STAGES}
                        onStatusFilterChange={(val) => { setStatusFilter(val); setTablePage(1); }}
                        totalCount={candidates.length}
                        filteredCount={filteredCandidates.length}
                        hasActiveFilters={hasActiveFilters}
                        onResetFilters={handleResetFilters}
                    />

                    {filteredCandidates.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                            <p className="text-sm font-semibold text-slate-700">
                                Không tìm thấy ứng viên phù hợp với bộ lọc hiện tại
                            </p>
                            <p className="text-xs text-slate-500">
                                Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại niên khóa, học kỳ, vị trí ứng tuyển.
                            </p>
                            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs gap-1.5">
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Đặt lại bộ lọc</span>
                            </Button>
                        </div>
                    ) : viewMode === 'kanban' ? (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                                💡 <strong>Mẹo:</strong> Kéo thẻ ứng viên giữa các cột để thay đổi trạng thái tuyển dụng tức thì. Click vào thẻ để xem chi tiết hồ sơ.
                            </p>
                            <KanbanBoard
                                stages={KANBAN_STAGES}
                                items={kanbanItems}
                                onItemMove={handleKanbanMove}
                                renderCustomCard={(item, isDragging) => (
                                    <CandidateKanbanCard
                                        candidate={item.raw as CandidateApplication}
                                        isDragging={isDragging}
                                        onViewCv={(cand) => {
                                            setSelectedCand(cand);
                                            setIsDetailModalOpen(true);
                                        }}
                                        onReject={handleRejectCandidate}
                                    />
                                )}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {paginatedCandidates.map((cand) => (
                                    <CandidateTableRowCard
                                        key={cand.id}
                                        candidate={cand}
                                        onViewDetail={(c) => {
                                            setSelectedCand(c);
                                            setIsDetailModalOpen(true);
                                        }}
                                        onScheduleInterview={(c) => setInterviewModalCand(c)}
                                        onReject={handleRejectCandidate}
                                    />
                                ))}
                            </div>

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
                </div>
            )}

            {/* Sub-component Modals */}
            <CandidateDetailModal
                candidate={selectedCand}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />

            <CandidateInterviewModal
                candidate={interviewModalCand}
                onClose={() => setInterviewModalCand(null)}
                onSuccess={(candidateId, scheduledIso, locationOrUrl, note) => {
                    setCandidates(prev =>
                        prev.map(c =>
                            c.id === candidateId
                                ? {
                                      ...c,
                                      status: 'INTERVIEW_SCHEDULED' as ApplicationStatus,
                                      interviewScheduledAt: scheduledIso,
                                      interviewLocation: locationOrUrl,
                                      interviewNote: note,
                                  }
                                : c
                        )
                    );
                    setMessage({
                        type: 'success',
                        text: `Đã lên lịch phỏng vấn cho ứng viên. Hệ thống đã gửi email và thông báo chuông tới sinh viên.`,
                    });
                }}
                onError={(errMsg) => setMessage({ type: 'error', text: errMsg })}
            />
        </div>
    );
}

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
    FacultyEvaluationSummary,
    BatchPublishResultRequest,
    BatchPublishResultResponse,
} from '../types/evaluation.types';
import { exportEvaluationsToExcel } from '../utils/evaluation-excel-utils';

export interface TermOption {
    id: string;
    code?: string;
    termName: string;
    academicYear: string;
    semester?: string;
    startDate?: string;
    endDate?: string;
    status: string;
}

export function useFacultyEvaluations() {
    const { user } = useAuth();
    const [terms, setTerms] = useState<TermOption[]>([]);
    const [selectedTermId, setSelectedTermId] = useState<string>('');
    const [summaries, setSummaries] = useState<FacultyEvaluationSummary[]>([]);
    const [isLoadingTerms, setIsLoadingTerms] = useState<boolean>(true);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [programFilter, setProgramFilter] = useState<string>('ALL');
    const [lecturerFilter, setLecturerFilter] = useState<string>('ALL');
    const [companyFilter, setCompanyFilter] = useState<string>('ALL');
    const [resultFilter, setResultFilter] = useState<string>('ALL');
    const [publishFilter, setPublishFilter] = useState<string>('ALL');
    const [gradeFilter, setGradeFilter] = useState<string>('ALL');

    // Modals
    const [selectedDetail, setSelectedDetail] = useState<FacultyEvaluationSummary | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [isBatchPublishModalOpen, setIsBatchPublishModalOpen] = useState<boolean>(false);

    // 1. Fetch terms list using standard /api/v1/terms/by-department endpoint
    useEffect(() => {
        async function fetchTerms() {
            try {
                const endpoint = user?.departmentId
                    ? `/api/v1/terms/by-department/${user.departmentId}`
                    : '/api/v1/terms';
                const res = await apiClient.get<TermOption[]>(endpoint);
                const termList = res.data && Array.isArray(res.data) ? res.data : [];
                setTerms(termList);
                if (termList.length > 0) {
                    const activeTerm = termList.find((t) => ['ACTIVE', 'REGISTRATION_OPEN', 'APPLICATION_OPEN', 'EVALUATING'].includes(t.status)) || termList[0];
                    setSelectedTermId(activeTerm.id);
                }
            } catch (err: unknown) {
                setTerms([]);
            } finally {
                setIsLoadingTerms(false);
            }
        }
        fetchTerms();
    }, [user?.departmentId]);

    // 2. Fetch evaluation summary for selected term
    const loadEvaluationSummary = useCallback(async (termId: string) => {
        if (!termId) return;
        setIsLoadingData(true);
        try {
            const res = await apiClient.get<FacultyEvaluationSummary[]>(`/api/v1/final-results/term/${termId}/summary`);
            if (res.data && Array.isArray(res.data)) {
                setSummaries(res.data);
            } else {
                setSummaries([]);
            }
        } catch (err: unknown) {
            console.error('Failed to load evaluation summary:', err);
            setSummaries([]);
            setMessage({ type: 'error', text: 'Không thể tải dữ liệu đánh giá của kỳ thực tập' });
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (selectedTermId) {
            loadEvaluationSummary(selectedTermId);
        }
    }, [selectedTermId, loadEvaluationSummary]);

    const selectedTerm = useMemo(() => {
        return terms.find((t) => t.id === selectedTermId) || null;
    }, [terms, selectedTermId]);

    // Unique options for filter dropdowns
    const filterOptions = useMemo(() => {
        const programs = new Set<string>();
        const lecturers = new Set<string>();
        const companies = new Set<string>();

        summaries.forEach((s) => {
            if (s.programName) programs.add(s.programName);
            if (s.lecturerName) lecturers.add(s.lecturerName);
            if (s.companyName) companies.add(s.companyName);
        });

        return {
            programs: Array.from(programs).sort(),
            lecturers: Array.from(lecturers).sort(),
            companies: Array.from(companies).sort(),
        };
    }, [summaries]);

    // Filtered rows
    const filteredRows = useMemo(() => {
        return summaries.filter((item) => {
            // Search term
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase().trim();
                const matchName = item.studentName?.toLowerCase().includes(term);
                const matchCode = item.studentCode?.toLowerCase().includes(term);
                const matchClass = item.classCode?.toLowerCase().includes(term);
                const matchCompany = item.companyName?.toLowerCase().includes(term);
                const matchLecturer = item.lecturerName?.toLowerCase().includes(term);
                if (!matchName && !matchCode && !matchClass && !matchCompany && !matchLecturer) {
                    return false;
                }
            }

            // Program
            if (programFilter !== 'ALL' && item.programName !== programFilter) {
                return false;
            }

            // Lecturer
            if (lecturerFilter !== 'ALL' && item.lecturerName !== lecturerFilter) {
                return false;
            }

            // Company
            if (companyFilter !== 'ALL' && item.companyName !== companyFilter) {
                return false;
            }

            // Result
            if (resultFilter !== 'ALL') {
                if (resultFilter === 'PASSED' && item.resultStatus !== 'PASSED') return false;
                if (resultFilter === 'FAILED' && item.resultStatus !== 'FAILED') return false;
                if (resultFilter === 'PENDING' && item.resultStatus !== 'PENDING_REVIEW') return false;
            }

            // Publish status
            if (publishFilter !== 'ALL') {
                if (publishFilter === 'PUBLISHED' && !item.isPublished) return false;
                if (publishFilter === 'DRAFT' && item.isPublished) return false;
            }

            // Grade Letter
            if (gradeFilter !== 'ALL') {
                if (item.letterGrade !== gradeFilter) return false;
            }

            return true;
        });
    }, [summaries, searchTerm, programFilter, lecturerFilter, companyFilter, resultFilter, publishFilter, gradeFilter]);

    // Statistics
    const stats = useMemo(() => {
        const total = summaries.length;
        const graded = summaries.filter((s) => s.finalScore != null).length;
        const passed = summaries.filter((s) => s.resultStatus === 'PASSED').length;
        const failed = summaries.filter((s) => s.resultStatus === 'FAILED').length;
        const published = summaries.filter((s) => s.isPublished).length;
        const draft = summaries.filter((s) => !s.isPublished && s.finalScore != null).length;

        const scoredItems = summaries.filter((s) => s.finalScore != null);
        const avgScore10 = scoredItems.length > 0
            ? scoredItems.reduce((acc, cur) => acc + (cur.finalScore || 0), 0) / scoredItems.length
            : 0;

        const scoredScale4Items = summaries.filter((s) => s.scoreScale4 != null);
        const avgScore4 = scoredScale4Items.length > 0
            ? scoredScale4Items.reduce((acc, cur) => acc + (cur.scoreScale4 || 0), 0) / scoredScale4Items.length
            : 0;

        const passedRate = total > 0 ? (passed / total) * 100 : 0;

        return {
            total,
            graded,
            passed,
            failed,
            published,
            draft,
            avgScore10: avgScore10.toFixed(2),
            avgScore4: avgScore4.toFixed(2),
            passedRate: passedRate.toFixed(1),
        };
    }, [summaries]);

    // Actions
    const handleQuickFinalize = async (placementId: string) => {
        setIsProcessing(true);
        try {
            await apiClient.post(`/api/v1/final-results/placement/${placementId}/quick-finalize`);
            setMessage({ type: 'success', text: 'Tổng hợp điểm sinh viên thành công' });
            await loadEvaluationSummary(selectedTermId);
        } catch (err: unknown) {
            console.error('Quick finalize error:', err);
            setMessage({ type: 'error', text: 'Không thể tổng hợp điểm. Vui lòng kiểm tra lại điểm đánh giá.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePublishSingle = async (placementId: string) => {
        setIsProcessing(true);
        try {
            await apiClient.patch(`/api/v1/final-results/placement/${placementId}/publish`);
            setMessage({ type: 'success', text: 'Công bố kết quả thực tập cho sinh viên thành công' });
            if (selectedDetail && selectedDetail.placementId === placementId) {
                setSelectedDetail((prev) => prev ? { ...prev, isPublished: true } : null);
            }
            await loadEvaluationSummary(selectedTermId);
        } catch (err: unknown) {
            console.error('Publish single error:', err);
            setMessage({ type: 'error', text: 'Không thể công bố kết quả cho sinh viên này' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBatchPublish = async () => {
        if (!selectedTermId) return;
        setIsProcessing(true);
        try {
            const res = await apiClient.post<BatchPublishResultResponse>(
                `/api/v1/final-results/term/${selectedTermId}/publish-batch`,
                {} as BatchPublishResultRequest
            );
            const count = res.data?.publishedCount || 0;
            setMessage({
                type: 'success',
                text: `Đã công bố kết quả thực tập thành công cho ${count} sinh viên.`,
            });
            setIsBatchPublishModalOpen(false);
            await loadEvaluationSummary(selectedTermId);
        } catch (err: unknown) {
            console.error('Batch publish error:', err);
            setMessage({ type: 'error', text: 'Quá trình công bố hàng loạt gặp sự cố' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExportExcel = () => {
        if (filteredRows.length === 0) {
            setMessage({ type: 'error', text: 'Không có dữ liệu sinh viên để xuất file Excel' });
            return;
        }

        const filterDescParts: string[] = [];
        if (programFilter !== 'ALL') filterDescParts.push(`Ngành: ${programFilter}`);
        if (lecturerFilter !== 'ALL') filterDescParts.push(`GVHD: ${lecturerFilter}`);
        if (companyFilter !== 'ALL') filterDescParts.push(`DN: ${companyFilter}`);
        if (resultFilter !== 'ALL') filterDescParts.push(`Kết quả: ${resultFilter}`);
        if (gradeFilter !== 'ALL') filterDescParts.push(`Điểm chữ: ${gradeFilter}`);

        exportEvaluationsToExcel(filteredRows, {
            termName: selectedTerm ? `${selectedTerm.termName} (${selectedTerm.academicYear})` : 'Ky_Thuc_Tap',
            filterDescription: filterDescParts.join(' • '),
        });

        setMessage({
            type: 'success',
            text: `Đã xuất thành công bảng điểm ${filteredRows.length} sinh viên ra file Excel.`,
        });
    };

    const openDetailModal = (item: FacultyEvaluationSummary) => {
        setSelectedDetail(item);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setSelectedDetail(null);
        setIsDetailModalOpen(false);
    };

    return {
        terms,
        selectedTermId,
        setSelectedTermId,
        selectedTerm,
        summaries,
        filteredRows,
        isLoadingTerms,
        isLoadingData,
        isProcessing,
        message,
        setMessage,
        searchTerm,
        setSearchTerm,
        programFilter,
        setProgramFilter,
        lecturerFilter,
        setLecturerFilter,
        companyFilter,
        setCompanyFilter,
        resultFilter,
        setResultFilter,
        publishFilter,
        setPublishFilter,
        gradeFilter,
        setGradeFilter,
        filterOptions,
        stats,
        selectedDetail,
        isDetailModalOpen,
        isBatchPublishModalOpen,
        setIsBatchPublishModalOpen,
        openDetailModal,
        closeDetailModal,
        handleQuickFinalize,
        handlePublishSingle,
        handleBatchPublish,
        handleExportExcel,
        reload: () => loadEvaluationSummary(selectedTermId),
    };
}

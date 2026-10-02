'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
    RosterStudent,
    StudentFoundApp,
    InternStudentRow,
    InternshipFilterStatus,
} from '../types/internship-management.types';

export function useFacultyInternship() {
    const { user } = useAuth();

    const [terms, setTerms] = useState<any[]>([]);
    const [selectedTermId, setSelectedTermId] = useState('');
    const [roster, setRoster] = useState<RosterStudent[]>([]);
    const [foundApps, setFoundApps] = useState<StudentFoundApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<InternshipFilterStatus>('all');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Letter-received tracking (saved per roster entry ID)
    const [letterReceivedIds, setLetterReceivedIds] = useState<Set<string>>(new Set());

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        rosterId: string;
        studentName: string;
        foundAppId?: string;
        hostName?: string;
    }>({ open: false, rosterId: '', studentName: '' });
    const [reviewNote, setReviewNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

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
        if (!user?.departmentId) {
            setIsLoading(false);
            return;
        }
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

    const rows: InternStudentRow[] = useMemo(() => {
        return roster.map(r => {
            const foundApp = foundApps.find(a => a.studentId === r.claimedUserId);
            return {
                roster: r,
                foundApp,
                letterReceived: letterReceivedIds.has(r.id),
                companyAccepted: foundApp?.status === 'APPROVED',
            };
        });
    }, [roster, foundApps, letterReceivedIds]);

    const filteredRows = useMemo(() => {
        return rows.filter(row => {
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
    }, [rows, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: rows.length,
        letterReceived: rows.filter(r => r.letterReceived).length,
        companyAccepted: rows.filter(r => r.companyAccepted).length,
        active: rows.filter(r => r.foundApp?.placementId).length,
    }), [rows]);

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

    const closeConfirmModal = () => {
        setConfirmModal({ open: false, rosterId: '', studentName: '' });
        setReviewNote('');
    };

    const handleApproveFoundApp = async () => {
        if (!confirmModal.foundAppId) return;
        setIsProcessing(true);
        try {
            await apiClient.patch(
                `/api/v1/student-found/${confirmModal.foundAppId}/review?decision=APPROVED&note=${encodeURIComponent(reviewNote || 'Phê duyệt bởi Quản lý Khoa')}`,
                null
            );
            setMessage({ type: 'success', text: `Đã xác nhận ${confirmModal.studentName} được công ty chấp nhận thực tập.` });
            await loadData(selectedTermId);
            closeConfirmModal();
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác nhận.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedTerm = useMemo(() => terms.find(t => t.id === selectedTermId), [terms, selectedTermId]);

    return {
        terms,
        selectedTermId,
        selectedTerm,
        isLoading,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        message,
        setMessage,
        rows,
        filteredRows,
        stats,
        confirmModal,
        reviewNote,
        setReviewNote,
        isProcessing,
        handleTermChange,
        toggleLetterReceived,
        openConfirmModal,
        closeConfirmModal,
        handleApproveFoundApp,
    };
}

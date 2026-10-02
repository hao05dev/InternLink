'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
    RosterStudent,
    AcademicProgramOption,
    InternshipTermOption,
    ProvisionResult,
    RosterStats,
    BatchProvisionResult,
    IneligibleNoticePayload,
    IneligibleNoticeResult,
} from '../types/roster.types';
import { ManualStudentPayload } from '../components/modals/manual-add-student-modal';
import { EmailNoticePayload } from '../components/modals/email-notification-modal';
import { StudentRosterImportPayload } from '../utils/roster-excel-utils';

export function useFacultyRoster() {
    const { user } = useAuth();
    const [roster, setRoster] = useState<RosterStudent[]>([]);
    const [terms, setTerms] = useState<InternshipTermOption[]>([]);
    const [selectedTermId, setSelectedTermId] = useState('');
    const [programs, setPrograms] = useState<AcademicProgramOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProgram, setFilterProgram] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Provision state
    const [provisionTarget, setProvisionTarget] = useState<RosterStudent | null>(null);
    const [provisionResult, setProvisionResult] = useState<ProvisionResult | null>(null);

    // Modal open states
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isBatchProvisionModalOpen, setIsBatchProvisionModalOpen] = useState(false);
    const [isIneligibleEmailModalOpen, setIsIneligibleEmailModalOpen] = useState(false);

    const loadRoster = useCallback(async (termId: string) => {
        try {
            const res = await apiClient.get<RosterStudent[]>(`/api/v1/rosters/by-term/${termId}`);
            setRoster(Array.isArray(res.data) ? res.data : []);
        } catch {
            setRoster([]);
        }
    }, []);

    useEffect(() => {
        if (!user?.departmentId) {
            setIsLoading(false);
            return;
        }

        async function fetchInitData() {
            try {
                const [progRes, termRes] = await Promise.all([
                    apiClient.get<AcademicProgramOption[]>('/api/v1/academic-programs'),
                    apiClient.get<InternshipTermOption[]>(`/api/v1/terms/by-department/${user!.departmentId}`),
                ]);

                if (progRes.data && Array.isArray(progRes.data)) {
                    const facultyPrograms = progRes.data.filter(p => p.departmentId === user?.departmentId);
                    setPrograms(facultyPrograms);
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
    }, [user, loadRoster]);

    const handleTermChange = async (termId: string) => {
        setSelectedTermId(termId);
        setIsLoading(true);
        await loadRoster(termId);
        setIsLoading(false);
    };

    const filtered = useMemo(() => {
        return roster.filter(s => {
            const matchSearch = (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.studentCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.classCode || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchProgram = !filterProgram || s.programName?.toLowerCase().includes(filterProgram.toLowerCase());
            return matchSearch && matchProgram;
        });
    }, [roster, searchTerm, filterProgram]);

    const stats: RosterStats = useMemo(() => {
        const eligible = roster.filter(s => s.eligibilityStatus === 'ELIGIBLE');
        const ineligible = roster.filter(s => s.eligibilityStatus === 'INELIGIBLE' || s.eligibilityStatus === 'NEEDS_REVIEW');
        const activated = roster.filter(s => s.claimedUserId);
        const eligibleWithoutAccount = eligible.filter(s => !s.claimedUserId);

        return {
            total: roster.length,
            eligible: eligible.length,
            ineligible: ineligible.length,
            eligibleWithoutAccount: eligibleWithoutAccount.length,
            activated: activated.length,
            notActivated: roster.length - activated.length,
        };
    }, [roster]);

    const handleProvisionAccount = async () => {
        if (!provisionTarget) return;
        setIsActionLoading(true);
        try {
            const res = await apiClient.post<{
                id: string; studentCode: string; fullName: string; officialEmail: string;
                claimedUserId?: string; defaultPassword?: string;
            }>(`/api/v1/rosters/${provisionTarget.id}/provision-account`);
            const data = res.data;
            setRoster(prev => prev.map(s =>
                s.id === provisionTarget.id ? { ...s, claimedUserId: data.claimedUserId || s.claimedUserId } : s
            ));
            if (data.defaultPassword) {
                setProvisionResult({ password: data.defaultPassword, email: data.officialEmail });
            } else {
                setProvisionResult(null);
                setProvisionTarget(null);
                setMessage({ type: 'success', text: `Đã liên kết tài khoản có sẵn cho sinh viên ${provisionTarget.fullName}.` });
            }
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Không thể tạo tài khoản. Vui lòng thử lại.' });
            setProvisionTarget(null);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBatchProvision = async (): Promise<BatchProvisionResult | null> => {
        if (!selectedTermId) {
            setMessage({ type: 'error', text: 'Chưa chọn kỳ thực tập.' });
            return null;
        }
        setIsActionLoading(true);
        try {
            const res = await apiClient.post<BatchProvisionResult>(`/api/v1/rosters/by-term/${selectedTermId}/batch-provision`);
            await loadRoster(selectedTermId);
            const data = res.data;
            setMessage({
                type: 'success',
                text: `Đã cấp tài khoản thành công cho ${data.totalEligibleWithoutAccount} sinh viên (${data.newlyCreatedCount} tạo mới, ${data.linkedExistingCount} liên kết).`
            });
            return data;
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi khi cấp tài khoản hàng loạt.' });
            return null;
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleNotifyIneligible = async (payload: IneligibleNoticePayload): Promise<boolean> => {
        if (!selectedTermId) {
            setMessage({ type: 'error', text: 'Chưa chọn kỳ thực tập.' });
            return false;
        }
        setIsActionLoading(true);
        try {
            const res = await apiClient.post<IneligibleNoticeResult>(`/api/v1/rosters/by-term/${selectedTermId}/ineligible-notice`, payload);
            const data = res.data;
            setMessage({
                type: data?.failedStudentCodes?.length ? 'error' : 'success',
                text: `Đã gửi thông báo cho ${data?.emailsSent ?? 0}/${data?.totalIneligible ?? 0} sinh viên chưa đủ điều kiện.${data?.failedStudentCodes?.length ? ` Thất bại: ${data.failedStudentCodes.join(', ')}` : ''}`,
            });
            return true;
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi khi gửi thông báo sinh viên chưa đủ điều kiện.' });
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleManualAdd = async (payload: ManualStudentPayload): Promise<boolean> => {
        if (!selectedTermId) {
            setMessage({ type: 'error', text: 'Chưa chọn kỳ thực tập.' });
            return false;
        }
        setIsActionLoading(true);
        try {
            const res = await apiClient.post<RosterStudent[]>(`/api/v1/rosters/import/${selectedTermId}`, [payload]);
            if (res.data && Array.isArray(res.data)) {
                setRoster(prev => {
                    const existingIds = new Set(prev.map(s => s.id));
                    const newItems = res.data.filter((s: RosterStudent) => !existingIds.has(s.id));
                    return [...newItems, ...prev];
                });
            }
            setMessage({ type: 'success', text: `Đã thêm sinh viên ${payload.fullName} (${payload.studentCode}) vào danh sách.` });
            return true;
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm sinh viên.' });
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleExcelImport = async (items: StudentRosterImportPayload[]): Promise<boolean> => {
        if (!selectedTermId) {
            setMessage({ type: 'error', text: 'Chọn kỳ thực tập trước khi import.' });
            return false;
        }
        if (!items || items.length === 0) {
            setMessage({ type: 'error', text: 'Không có dữ liệu hợp lệ để import.' });
            return false;
        }
        setIsActionLoading(true);
        try {
            const res = await apiClient.post<RosterStudent[]>(`/api/v1/rosters/import/${selectedTermId}`, items);
            await loadRoster(selectedTermId);
            const count = res.data && Array.isArray(res.data) ? res.data.length : items.length;
            setMessage({ type: 'success', text: `Import thành công ${count} sinh viên vào danh sách.` });
            return true;
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi import danh sách sinh viên.' });
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleNotifyPickup = async (payload: EmailNoticePayload) => {
        if (!selectedTermId) return;
        setIsActionLoading(true);
        try {
            const result = await apiClient.post<{
                eligible: number; emailsSent: number;
                notificationsCreated: number; failedStudentCodes: string[];
            }>(`/api/v1/terms/${selectedTermId}/introduction-letter-notice`, payload);
            const data = result.data;
            setMessage({
                type: data?.failedStudentCodes?.length ? 'error' : 'success',
                text: `Đã gửi ${data?.emailsSent ?? 0}/${data?.eligible ?? 0} email thông báo.${data?.failedStudentCodes?.length ? ` Lỗi gửi cho: ${data.failedStudentCodes.join(', ')}` : ''}`,
            });
            setIsEmailModalOpen(false);
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không gửi được thông báo.' });
        } finally {
            setIsActionLoading(false);
        }
    };

    const selectedTerm = terms.find(t => t.id === selectedTermId);

    return {
        roster,
        filtered,
        terms,
        selectedTermId,
        selectedTerm,
        programs,
        isLoading,
        isActionLoading,
        searchTerm,
        setSearchTerm,
        filterProgram,
        setFilterProgram,
        message,
        setMessage,
        stats,
        // Modals
        isImportModalOpen,
        setIsImportModalOpen,
        isExcelModalOpen,
        setIsExcelModalOpen,
        isEmailModalOpen,
        setIsEmailModalOpen,
        isBatchProvisionModalOpen,
        setIsBatchProvisionModalOpen,
        isIneligibleEmailModalOpen,
        setIsIneligibleEmailModalOpen,
        // Provision
        provisionTarget,
        setProvisionTarget,
        provisionResult,
        setProvisionResult,
        // Handlers
        handleTermChange,
        handleProvisionAccount,
        handleBatchProvision,
        handleNotifyIneligible,
        handleManualAdd,
        handleExcelImport,
        handleNotifyPickup,
    };
}

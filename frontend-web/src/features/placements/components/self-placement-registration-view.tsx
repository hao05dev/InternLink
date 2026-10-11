'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { IntroductionLetterSection } from './introduction-letter-section';
import { PlacementStatusCard } from './cards/placement-status-card';
import { SelfPlacementForm } from './forms/self-placement-form';
import { TransferPlacementModal } from './modals/transfer-placement-modal';
import { InternshipPlacement, SelfPlacementSubmitPayload, TransferPlacementPayload } from '../types/placement.types';

export function SelfPlacementRegistrationView() {
    const { user } = useAuth();
    const [terms, setTerms] = useState<any[]>([]);
    const [selectedTermId, setSelectedTermId] = useState('');
    const [placement, setPlacement] = useState<InternshipPlacement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form fields
    const [companyName, setCompanyName] = useState('');
    const [companyTaxCode, setCompanyTaxCode] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [mentorName, setMentorName] = useState('');
    const [mentorEmail, setMentorEmail] = useState('');
    const [mentorPhone, setMentorPhone] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [acceptanceLetterUrl, setAcceptanceLetterUrl] = useState('');

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const termsRes = await apiClient.get<any[]>('/api/v1/terms/active');
                if (termsRes.data && Array.isArray(termsRes.data) && termsRes.data.length > 0) {
                    setTerms(termsRes.data);
                    setSelectedTermId(termsRes.data[0].id);
                }

                if (user?.id) {
                    const placementRes = await apiClient.get<InternshipPlacement>(`/api/v1/placements/student/${user.id}`);
                    if (placementRes.data) {
                        setPlacement(placementRes.data);
                        setCompanyName(placementRes.data.companyName || '');
                        setCompanyTaxCode(placementRes.data.companyTaxCode || '');
                        setCompanyAddress(placementRes.data.companyAddress || '');
                        setCompanyWebsite(placementRes.data.companyWebsite || '');
                        setJobTitle(placementRes.data.jobTitle || '');
                        setJobDescription(placementRes.data.jobDescription || '');
                        setMentorName(placementRes.data.mentorName || '');
                        setMentorEmail(placementRes.data.mentorEmail || '');
                        setMentorPhone(placementRes.data.mentorPhone || '');
                        setStartDate(placementRes.data.startDate?.split('T')[0] || '');
                        setEndDate(placementRes.data.endDate?.split('T')[0] || '');
                        setAcceptanceLetterUrl(placementRes.data.acceptanceLetterUrl || '');
                    }
                }
            } catch {
                // If no placement exists yet, clean state is normal
            } finally {
                setIsLoading(false);
            }
        }

        fetchInitialData();
    }, [user?.id]);

    const handleSubmitPlacement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTermId && !placement?.termId) {
            setMessage({ type: 'error', text: 'Vui lòng chọn học kỳ thực tập.' });
            return;
        }

        setIsSubmitting(true);
        const payload: SelfPlacementSubmitPayload = {
            termId: selectedTermId || placement?.termId || '',
            companyName,
            companyTaxCode,
            companyAddress,
            companyWebsite,
            jobTitle,
            jobDescription,
            mentorName,
            mentorEmail,
            mentorPhone,
            startDate,
            endDate,
            acceptanceLetterUrl,
        };

        try {
            const res = await apiClient.post<InternshipPlacement>('/api/v1/placements/self-submit', payload);
            if (res.data) {
                setPlacement(res.data);
            }
            setMessage({
                type: 'success',
                text: 'Đã gửi phiếu đăng ký chỗ thực tập tự liên hệ thành công! Vui lòng chờ Khoa xét duyệt.',
            });
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Có lỗi khi gửi đơn đăng ký.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTransferSubmit = async (payload: TransferPlacementPayload) => {
        setIsSubmitting(true);
        try {
            const res = await apiClient.post<InternshipPlacement>('/api/v1/placements/transfer-request', payload);
            if (res.data) {
                setPlacement(res.data);
            }
            setMessage({
                type: 'success',
                text: 'Đã gửi đơn xin chuyển đổi đơn vị thực tập! Vui lòng chờ Khoa xét duyệt.',
            });
            setIsTransferModalOpen(false);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Gửi yêu cầu đổi đơn vị thất bại.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Đang tải thông tin đăng ký thực tập...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Đăng Ký Đơn Vị Thực Tập (Tự Liên Hệ)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Dành cho sinh viên tự liên hệ và được doanh nghiệp bên ngoài tiếp nhận thực tập trong học kỳ.
                </p>
            </div>

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
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Đóng"
                    >
                        &times;
                    </button>
                </div>
            )}

            <IntroductionLetterSection termId={selectedTermId} />

            {placement && (
                <PlacementStatusCard
                    placement={placement}
                    onOpenTransferModal={() => setIsTransferModalOpen(true)}
                />
            )}

            {(!placement || placement.status === 'REJECTED' || placement.status === 'PENDING_APPROVAL') && (
                <SelfPlacementForm
                    placement={placement}
                    terms={terms}
                    selectedTermId={selectedTermId}
                    setSelectedTermId={setSelectedTermId}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    companyTaxCode={companyTaxCode}
                    setCompanyTaxCode={setCompanyTaxCode}
                    companyAddress={companyAddress}
                    setCompanyAddress={setCompanyAddress}
                    companyWebsite={companyWebsite}
                    setCompanyWebsite={setCompanyWebsite}
                    jobTitle={jobTitle}
                    setJobTitle={setJobTitle}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    mentorName={mentorName}
                    setMentorName={setMentorName}
                    mentorEmail={mentorEmail}
                    setMentorEmail={setMentorEmail}
                    mentorPhone={mentorPhone}
                    setMentorPhone={setMentorPhone}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    acceptanceLetterUrl={acceptanceLetterUrl}
                    setAcceptanceLetterUrl={setAcceptanceLetterUrl}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmitPlacement}
                />
            )}

            <TransferPlacementModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onSubmit={handleTransferSubmit}
                placement={placement}
                isLoading={isSubmitting}
            />
        </div>
    );
}

export default SelfPlacementRegistrationView;

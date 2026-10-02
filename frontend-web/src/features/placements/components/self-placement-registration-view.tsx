'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { TransferPlacementModal } from './modals/transfer-placement-modal';
import {
    Building2,
    CheckCircle2,
    AlertCircle,
    FileText,
    Send,
    Edit3,
    RefreshCw,
    Clock,
    XCircle,
    UserCheck,
    Briefcase
} from 'lucide-react';
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
                // 1. Fetch available terms
                const termsRes = await apiClient.get<any[]>('/api/v1/terms/active');
                if (termsRes.data && Array.isArray(termsRes.data) && termsRes.data.length > 0) {
                    setTerms(termsRes.data);
                    setSelectedTermId(termsRes.data[0].id);
                }

                // 2. Fetch current student's placement if any
                if (user?.id) {
                    const placementRes = await apiClient.get<InternshipPlacement>(`/api/v1/placements/student/${user.id}`);
                    if (placementRes.data) {
                        setPlacement(placementRes.data);
                        // Pre-populate fields if editing rejected form
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
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Đăng Ký Đơn Vị Thực Tập (Tự Liên Hệ)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Dành cho sinh viên tự liên hệ và được doanh nghiệp bên ngoài tiếp nhận thực tập trong học kỳ.
                </p>
            </div>

            {/* Notification Alert */}
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

            {/* Current Placement Status Card if Exists */}
            {placement && (
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader className="pb-3 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-sky-600" />
                                    <span>Trạng thái Tiếp nhận: {placement.companyName}</span>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Vị trí: <strong>{placement.jobTitle}</strong> • Mã đơn: {placement.id}
                                </CardDescription>
                            </div>
                            <div>
                                {placement.status === 'PENDING_APPROVAL' && (
                                    <Badge variant="warning" className="gap-1">
                                        <Clock className="w-3 h-3" /> Đang chờ Khoa duyệt
                                    </Badge>
                                )}
                                {(placement.status === 'APPROVED' || placement.status === 'ACTIVE' || placement.status === 'IN_PROGRESS') && (
                                    <Badge variant="success" className="gap-1">
                                        <UserCheck className="w-3 h-3" /> Đã duyệt chính thức
                                    </Badge>
                                )}
                                {placement.status === 'REJECTED' && (
                                    <Badge variant="destructive" className="gap-1">
                                        <XCircle className="w-3 h-3" /> Đã bị từ chối
                                    </Badge>
                                )}
                                {placement.status === 'TRANSFER_REQUESTED' && (
                                    <Badge variant="warning" className="gap-1">
                                        <RefreshCw className="w-3 h-3 animate-spin" /> Đang xin đổi đơn vị
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                        {/* If REJECTED -> Show clear rejection reason alert */}
                        {placement.status === 'REJECTED' && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 text-xs">
                                <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>Lý do Khoa từ chối phiếu đăng ký:</span>
                                </div>
                                <p className="whitespace-pre-line pl-6 font-medium text-rose-950">
                                    {placement.rejectionReason || 'Thông tin công ty hoặc vị trí công việc chưa đạt chuẩn yêu cầu đào tạo.'}
                                </p>
                                <p className="pl-6 text-[11px] text-rose-700 font-semibold pt-1">
                                    👉 Hãy chỉnh sửa lại thông tin ở biểu mẫu bên dưới và bấm &quot;Cập nhật &amp; Nộp lại&quot;.
                                </p>
                            </div>
                        )}

                        {/* If APPROVED / ACTIVE -> Show details and transfer option */}
                        {(placement.status === 'APPROVED' || placement.status === 'ACTIVE' || placement.status === 'IN_PROGRESS') && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                    <div>
                                        <span className="text-slate-400 block font-medium">Doanh nghiệp:</span>
                                        <p className="font-semibold text-slate-900">{placement.companyName}</p>
                                        <p className="text-slate-500">{placement.companyAddress}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Người hướng dẫn (Mentor):</span>
                                        <p className="font-semibold text-slate-900">{placement.mentorName}</p>
                                        <p className="text-slate-500">{placement.mentorEmail} • {placement.mentorPhone}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Thời gian thực tập:</span>
                                        <p className="font-semibold text-slate-900">
                                            {placement.startDate ? new Date(placement.startDate).toLocaleDateString('vi-VN') : '—'} đến{' '}
                                            {placement.endDate ? new Date(placement.endDate).toLocaleDateString('vi-VN') : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Giấy tiếp nhận:</span>
                                        {placement.acceptanceLetterUrl ? (
                                            <a
                                                href={placement.acceptanceLetterUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sky-600 hover:underline font-semibold inline-flex items-center gap-1"
                                            >
                                                <FileText className="w-3.5 h-3.5" /> Xem file đính kèm
                                            </a>
                                        ) : (
                                            <span className="text-slate-400">Không có file đính kèm</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsTransferModalOpen(true)}
                                        className="gap-1.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Xin đổi đơn vị thực tập khác</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Registration Form (Only rendered if no placement or REJECTED or PENDING_APPROVAL) */}
            {(!placement || placement.status === 'REJECTED' || placement.status === 'PENDING_APPROVAL') && (
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Edit3 className="w-4 h-4 text-sky-600" />
                            <span>{placement?.status === 'REJECTED' ? 'Cập Nhật & Nộp Lại Phiếu Tiếp Nhận' : 'Thông Tin Đơn Vị Tiếp Nhận'}</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Vui lòng điền chính xác thông tin doanh nghiệp và người hướng dẫn để Khoa thẩm định chuyên ngành.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmitPlacement} className="space-y-4">
                            {/* Semester Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Học kỳ thực tập"
                                    id="termSelect"
                                    value={selectedTermId}
                                    onChange={(e) => setSelectedTermId(e.target.value)}
                                    options={terms.map((t) => ({
                                        value: t.id,
                                        label: `${t.code} (${t.termName})`,
                                    }))}
                                    required
                                />
                                <Input
                                    label="Vị trí thực tập (Job Title)"
                                    id="jobTitle"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="VD: Java Backend Intern / React Native Developer"
                                    required
                                />
                            </div>

                            {/* Company Information */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Thông tin Doanh nghiệp tiếp nhận</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        label="Tên Doanh nghiệp / Công ty"
                                        id="companyName"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="VD: Công ty TNHH Phần mềm ABC"
                                        required
                                    />
                                    <Input
                                        label="Mã số thuế doanh nghiệp"
                                        id="companyTaxCode"
                                        value={companyTaxCode}
                                        onChange={(e) => setCompanyTaxCode(e.target.value)}
                                        placeholder="VD: 1801234567"
                                    />
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Địa chỉ trụ sở / Chi nhánh làm việc"
                                            id="companyAddress"
                                            value={companyAddress}
                                            onChange={(e) => setCompanyAddress(e.target.value)}
                                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Website / Fanpage Doanh nghiệp"
                                            id="companyWebsite"
                                            value={companyWebsite}
                                            onChange={(e) => setCompanyWebsite(e.target.value)}
                                            placeholder="https://company.vn"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mentor Information */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Người hướng dẫn trực tiếp tại Doanh nghiệp (Mentor)</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Input
                                        label="Họ tên Người hướng dẫn"
                                        id="mentorName"
                                        value={mentorName}
                                        onChange={(e) => setMentorName(e.target.value)}
                                        placeholder="VD: Nguyễn Văn Mentor"
                                        required
                                    />
                                    <Input
                                        label="Email Mentor (Dùng để kích hoạt TK)"
                                        id="mentorEmail"
                                        type="email"
                                        value={mentorEmail}
                                        onChange={(e) => setMentorEmail(e.target.value)}
                                        placeholder="mentor@company.com"
                                        required
                                    />
                                    <Input
                                        label="Số điện thoại Mentor"
                                        id="mentorPhone"
                                        value={mentorPhone}
                                        onChange={(e) => setMentorPhone(e.target.value)}
                                        placeholder="0901234567"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Job Description & Duration */}
                            <div className="space-y-3">
                                <Textarea
                                    label="Mô tả tóm tắt nội dung công việc thực tập"
                                    id="jobDescription"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Nêu rõ các module, công nghệ sử dụng và nhiệm vụ được phân công trong đợt thực tập..."
                                    rows={3}
                                    required
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        label="Ngày bắt đầu làm việc"
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Ngày kết thúc dự kiến"
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Link đính kèm Giấy tiếp nhận thực tập (Google Drive / Cloudinary)"
                                    id="acceptanceLetterUrl"
                                    value={acceptanceLetterUrl}
                                    onChange={(e) => setAcceptanceLetterUrl(e.target.value)}
                                    placeholder="https://drive.google.com/... hoặc link ảnh/PDF có mộc công ty"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-3 border-t border-slate-100">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isSubmitting}
                                    className="gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>{placement?.status === 'REJECTED' ? 'Cập nhật & Nộp lại đơn' : 'Gửi Phiếu Đăng Ký'}</span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Transfer Modal */}
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

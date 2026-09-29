'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
    FileCheck2,
    Building2,
    UserCheck,
    GraduationCap,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    FileSignature,
    ShieldAlert
} from 'lucide-react';
import type { LearningAgreement, AgreementStatus } from '@/features/learning-agreement/types/learning-agreement.types';

export default function LearningAgreementView() {
    const { user } = useAuth();
    const [agreement, setAgreement] = useState<LearningAgreement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [signConsent, setSignConsent] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchAgreement() {
            try {
                const res = await apiClient.get<LearningAgreement[]>('/api/v1/agreements/my-agreements');
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setAgreement(res.data[0]);
                } else {
                    setAgreement(null);
                }
            } catch {
                setAgreement(null);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAgreement();
    }, [user?.id, user?.fullName]);

    const handleSignAgreement = async () => {
        if (!agreement) return;
        setIsSigning(true);
        try {
            await apiClient.patch(`/api/v1/agreements/${agreement.id}/sign`, {
                signatureData: {
                    signedBy: user?.fullName || 'Sinh viên',
                    signedAt: new Date().toISOString(),
                    role: 'STUDENT',
                },
            });

            setAgreement(prev => prev ? {
                ...prev,
                status: 'PENDING_COMPANY',
                studentSignedAt: new Date().toISOString(),
            } : null);

            setMessage({ type: 'success', text: 'Ký xác nhận Thỏa thuận thực tập 3 bên thành công! Hồ sơ đã được chuyển đến Doanh nghiệp tiếp nhận.' });
            setIsSignModalOpen(false);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi ký xác nhận thỏa thuận.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSigning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
                <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (!agreement) {
        return (
            <EmptyState
                title="Chưa có Thỏa thuận thực tập"
                description="Thỏa thuận thực tập 3 bên sẽ được tự động khởi tạo khi bạn chấp nhận một lời mời tiếp nhận (Offer) từ doanh nghiệp."
            />
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Thỏa Thuận Thực Tập 3 Bên (Learning Agreement)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Văn bản thỏa thuận chính thức giữa Sinh viên, Doanh nghiệp tiếp nhận và Khoa CNTT&TT - ĐH Cần Thơ.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={agreement.status} type="agreement" />
                </div>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{message.text}</span>
                </div>
            )}

            {/* Workflow Sign Stepper */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quy trình ký duyệt Thỏa thuận 3 bên</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Step 1: Student */}
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                            agreement.studentSignedAt
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-blue-50 border-blue-200 text-blue-900'
                        }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                agreement.studentSignedAt ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                            }`}>
                                {agreement.studentSignedAt ? '✓' : '1'}
                            </div>
                            <div className="text-xs space-y-1">
                                <p className="font-semibold text-sm">1. Sinh viên cam kết</p>
                                <p>{agreement.studentSignedAt ? `Đã ký: ${new Date(agreement.studentSignedAt).toLocaleDateString('vi-VN')}` : 'Chờ bạn ký xác nhận'}</p>
                            </div>
                        </div>

                        {/* Step 2: Company */}
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                            agreement.companySignedAt
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                agreement.companySignedAt ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                            }`}>
                                {agreement.companySignedAt ? '✓' : '2'}
                            </div>
                            <div className="text-xs space-y-1">
                                <p className="font-semibold text-sm">2. Doanh nghiệp tiếp nhận</p>
                                <p>{agreement.companySignedAt ? `Đã ký: ${new Date(agreement.companySignedAt).toLocaleDateString('vi-VN')}` : 'Chờ xác nhận từ Mentor/DN'}</p>
                            </div>
                        </div>

                        {/* Step 3: Faculty */}
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                            agreement.status === 'APPROVED'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                agreement.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                            }`}>
                                {agreement.status === 'APPROVED' ? '✓' : '3'}
                            </div>
                            <div className="text-xs space-y-1">
                                <p className="font-semibold text-sm">3. Khoa CNTT&TT phê duyệt</p>
                                <p>{agreement.status === 'APPROVED' ? 'Đã hoàn tất phê duyệt' : 'Chờ BQL Khoa xét duyệt'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tripartite Agreement Document Details */}
            <Card>
                <CardHeader className="border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <FileCheck2 className="w-6 h-6 text-blue-600" />
                        <div>
                            <CardTitle>Nội dung Thỏa thuận Đào tạo Thực tập tốt nghiệp</CardTitle>
                            <CardDescription>Mã số văn bản: {agreement.id.toUpperCase()}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Parties info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                                <GraduationCap className="w-4 h-4" />
                                <span>BÊN A: SINH VIÊN</span>
                            </div>
                            <div className="text-xs text-slate-700 space-y-1">
                                <p><strong>Họ và tên:</strong> {agreement.studentName}</p>
                                <p><strong>MSSV:</strong> {agreement.studentCode}</p>
                                <p><strong>Khoa:</strong> CNTT&TT - ĐH Cần Thơ</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                                <Building2 className="w-4 h-4" />
                                <span>BÊN B: DOANH NGHIỆP</span>
                            </div>
                            <div className="text-xs text-slate-700 space-y-1">
                                <p><strong>Đơn vị:</strong> {agreement.companyName}</p>
                                <p><strong>Địa chỉ:</strong> {agreement.companyAddress}</p>
                                <p><strong>Cán bộ hướng dẫn:</strong> {agreement.mentorName} ({agreement.mentorEmail})</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                                <UserCheck className="w-4 h-4" />
                                <span>BÊN C: NHÀ TRƯỜNG</span>
                            </div>
                            <div className="text-xs text-slate-700 space-y-1">
                                <p><strong>Đơn vị quản lý:</strong> Trường CNTT&TT - ĐH Cần Thơ</p>
                                <p><strong>Giảng viên hướng dẫn:</strong> {agreement.lecturerName || 'Khoa sẽ phân công sau khi ký'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Working Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Thời gian thực tập</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    Từ {new Date(agreement.startDate).toLocaleDateString('vi-VN')} đến {new Date(agreement.endDate).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Thời gian làm việc</p>
                                <p className="text-sm font-semibold text-slate-900">{agreement.workingDays}</p>
                            </div>
                        </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-900">Mục tiêu đào tạo & Chuẩn đầu ra (CLO)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {agreement.learningObjectives?.map((clo, idx) => (
                                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                                    <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span>{clo}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Terms & Conditions summary */}
                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                        <h4 className="font-semibold text-slate-800">Quy định và nghĩa vụ chung:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Sinh viên cam kết chấp hành nghiêm chỉnh nội quy, giờ giấc làm việc và quy định bảo mật của doanh nghiệp tiếp nhận.</li>
                            <li>Ghi chép và nộp nhật ký thực tập tuần (Weekly Logbook) đúng hạn trên hệ thống InternLink.</li>
                            <li>Báo cáo kịp thời cho Giảng viên hướng dẫn và Khoa khi xảy ra sự cố phát sinh ngoài tầm kiểm soát.</li>
                            <li>Hoàn thành đầy đủ báo cáo tổng kết thực tập để Khoa và Doanh nghiệp tiến hành đánh giá chấm điểm.</li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                        {agreement.studentSignedAt ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Bạn đã ký xác nhận văn bản này vào lúc {new Date(agreement.studentSignedAt).toLocaleString('vi-VN')}
                            </span>
                        ) : (
                            <span>Vui lòng kiểm tra kỹ các thông tin trước khi thực hiện ký số điện tử.</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            className="gap-2"
                            disabled={!!agreement.studentSignedAt}
                            onClick={() => setIsSignModalOpen(true)}
                        >
                            <FileSignature className="w-4 h-4" />
                            <span>{agreement.studentSignedAt ? 'Đã ký xác nhận' : 'Ký xác nhận thỏa thuận'}</span>
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Signature Confirmation Modal */}
            <Modal
                isOpen={isSignModalOpen}
                onClose={() => setIsSignModalOpen(false)}
                title="Xác nhận Ký số Thỏa thuận thực tập 3 bên"
                maxWidth="lg"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Bằng việc bấm xác nhận, sinh viên <strong>{user?.fullName || agreement.studentName}</strong> (MSSV: <strong>{agreement.studentCode}</strong>) xác nhận đã đọc, hiểu rõ và đồng ý với tất cả điều khoản trong thỏa thuận thực tập 3 bên với <strong>{agreement.companyName}</strong> và <strong>Khoa CNTT&TT - ĐH Cần Thơ</strong>.
                    </p>

                    <label className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer">
                        <input
                            type="checkbox"
                            checked={signConsent}
                            onChange={(e) => setSignConsent(e.target.checked)}
                            className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-blue-900 font-medium">
                            Tôi cam kết thực hiện đầy đủ trách nhiệm của sinh viên thực tập theo quy chế đào tạo của Trường Đại học Cần Thơ.
                        </span>
                    </label>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            variant="secondary"
                            onClick={() => setIsSignModalOpen(false)}
                            disabled={isSigning}
                        >
                            Đóng
                        </Button>
                        <Button
                            variant="primary"
                            disabled={!signConsent}
                            isLoading={isSigning}
                            onClick={handleSignAgreement}
                            className="gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Xác nhận Ký thỏa thuận</span>
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

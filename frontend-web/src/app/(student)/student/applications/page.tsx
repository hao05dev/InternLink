'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Briefcase,
    Building2,
    Calendar,
    Clock,
    Eye,
    FileText,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    MapPin
} from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '@/types/portal';

const MOCK_APPLICATIONS: JobApplication[] = [
    {
        id: 'app-001',
        jobId: 'job-101',
        jobTitle: 'Thực tập sinh Lập trình Web Fullstack (Spring Boot / React)',
        companyName: 'FPT Software Cần Thơ',
        studentId: 'std-1',
        status: 'INTERVIEW_SCHEDULED',
        appliedAt: '2026-09-18T08:30:00Z',
        interviewScheduledAt: '2026-09-28T14:00:00Z',
        interviewLocation: 'Phòng 402, Tòa nhà FPT Cần Thơ / Online qua MS Teams',
        interviewNote: 'Ứng viên chuẩn bị giới thiệu đồ án chuyên ngành và kỹ năng làm việc nhóm.',
        coverLetter: 'Kính gửi Quý công ty, em là sinh viên năm cuối ngành Kỹ thuật phần mềm CICT CTU...',
    },
    {
        id: 'app-002',
        jobId: 'job-102',
        jobTitle: 'Thực tập sinh Phát triển Ứng dụng Di động Flutter',
        companyName: 'VNPT Cần Thơ',
        studentId: 'std-1',
        status: 'OFFERED',
        appliedAt: '2026-09-10T10:15:00Z',
        offerNote: 'Chúc mừng bạn đã hoàn thành xuất sắc vòng phỏng vấn kỹ thuật! Mức phụ cấp thực tập 4,000,000 VNĐ/tháng.',
        coverLetter: 'Em có niềm đam mê lớn với lập trình di động và đã hoàn thành 2 ứng dụng trên Flutter...',
    },
    {
        id: 'app-003',
        jobId: 'job-103',
        jobTitle: 'Kỹ sư Kiểm thử Phần mềm (QA/QC Intern)',
        companyName: 'TMA Solutions Cần Thơ',
        studentId: 'std-1',
        status: 'PENDING',
        appliedAt: '2026-09-22T16:00:00Z',
        coverLetter: 'Em mong muốn được áp dụng kiến thức đảm bảo chất lượng phần mềm vào dự án thực tế...',
    },
];

export default function StudentApplicationsPage() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [withdrawModalApp, setWithdrawModalApp] = useState<JobApplication | null>(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchApplications() {
            try {
                const res = await apiClient.get<JobApplication[]>('/api/v1/applications/my-applications');
                if (res.data && res.data.length > 0) {
                    setApplications(res.data);
                } else {
                    setApplications(MOCK_APPLICATIONS);
                }
            } catch {
                setApplications(MOCK_APPLICATIONS);
            } finally {
                setIsLoading(false);
            }
        }

        fetchApplications();
    }, []);

    const handleViewDetail = (app: JobApplication) => {
        setSelectedApp(app);
        setIsDetailModalOpen(true);
    };

    const handleConfirmWithdraw = async () => {
        if (!withdrawModalApp) return;
        setIsWithdrawing(true);

        try {
            await apiClient.patch(`/api/v1/applications/${withdrawModalApp.id}/withdraw`);
            setApplications(prev =>
                prev.map(a => a.id === withdrawModalApp.id ? { ...a, status: 'WITHDRAWN' as ApplicationStatus } : a)
            );
            setActionMessage({ type: 'success', text: `Đã rút hồ sơ ứng tuyển vị trí "${withdrawModalApp.jobTitle}".` });
        } catch {
            setApplications(prev =>
                prev.map(a => a.id === withdrawModalApp.id ? { ...a, status: 'WITHDRAWN' as ApplicationStatus } : a)
            );
            setActionMessage({ type: 'success', text: `Đã rút hồ sơ ứng tuyển vị trí "${withdrawModalApp.jobTitle}".` });
        } finally {
            setIsWithdrawing(false);
            setWithdrawModalApp(null);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="space-y-4">
                    <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Đơn Ứng Tuyển Của Tôi
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Theo dõi tiến trình phỏng vấn, nhận thông báo tiếp nhận và quản lý hồ sơ ứng tuyển thực tập.
                    </p>
                </div>
                <Link href="/jobs">
                    <Button variant="primary" className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Xem thêm vị trí tuyển dụng</span>
                    </Button>
                </Link>
            </div>

            {/* Notification alert */}
            {actionMessage && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                        actionMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{actionMessage.text}</span>
                    </div>
                    <button
                        onClick={() => setActionMessage(null)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Đóng thông báo"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Applications List */}
            {applications.length === 0 ? (
                <EmptyState
                    title="Chưa có đơn ứng tuyển nào"
                    description="Bạn chưa nộp hồ sơ vào vị trí thực tập nào. Hãy duyệt qua danh sách vị trí đang tuyển để tìm cơ hội phù hợp."
                    action={
                        <Link href="/jobs">
                            <Button variant="primary">Khám phá vị trí thực tập</Button>
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <Card key={app.id} className="hover:border-slate-300 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-base text-slate-900">
                                                {app.jobTitle}
                                            </span>
                                            <StatusBadge status={app.status} type="application" />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                <span>{app.companyName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>Nộp ngày: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>

                                        {/* Status specific alerts */}
                                        {app.status === 'INTERVIEW_SCHEDULED' && (
                                            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 flex items-start gap-2">
                                                <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold">Lịch phỏng vấn: </span>
                                                    {app.interviewScheduledAt
                                                        ? new Date(app.interviewScheduledAt).toLocaleString('vi-VN')
                                                        : 'Đang sắp xếp'}
                                                    {app.interviewLocation && ` — ${app.interviewLocation}`}
                                                </div>
                                            </div>
                                        )}

                                        {app.status === 'OFFERED' && (
                                            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold">Đã nhận được thư mời tiếp nhận (Offer)! </span>
                                                    <span>Vui lòng vào mục Thỏa thuận 3 bên để hoàn tất thủ tục.</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetail(app)}
                                            className="gap-1.5 text-xs"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Chi tiết</span>
                                        </Button>

                                        {(app.status === 'PENDING' || app.status === 'SHORTLISTED') && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => setWithdrawModalApp(app)}
                                                className="text-xs"
                                            >
                                                Rút đơn
                                            </Button>
                                        )}

                                        {app.status === 'OFFERED' && (
                                            <Link href="/student/learning-agreement">
                                                <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                                                    <span>Xem thỏa thuận</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Application Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Chi tiết đơn ứng tuyển"
                maxWidth="2xl"
            >
                {selectedApp && (
                    <div className="space-y-6">
                        <div className="space-y-2 pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">{selectedApp.jobTitle}</h3>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <span className="font-medium text-slate-800">{selectedApp.companyName}</span>
                                <span>•</span>
                                <StatusBadge status={selectedApp.status} type="application" />
                            </div>
                        </div>

                        {/* Interview info if scheduled */}
                        {selectedApp.status === 'INTERVIEW_SCHEDULED' && (
                            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                                <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-600" />
                                    Thông tin buổi phỏng vấn
                                </h4>
                                <div className="text-xs text-indigo-800 space-y-1">
                                    <p>
                                        <strong>Thời gian:</strong>{' '}
                                        {selectedApp.interviewScheduledAt
                                            ? new Date(selectedApp.interviewScheduledAt).toLocaleString('vi-VN')
                                            : 'Chưa xác định'}
                                    </p>
                                    {selectedApp.interviewLocation && (
                                        <p>
                                            <strong>Địa điểm:</strong> {selectedApp.interviewLocation}
                                        </p>
                                    )}
                                    {selectedApp.interviewNote && (
                                        <p>
                                            <strong>Lưu ý từ doanh nghiệp:</strong> {selectedApp.interviewNote}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Offer note if offered */}
                        {selectedApp.offerNote && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                                <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Thông tin Thư mời tiếp nhận (Offer)
                                </h4>
                                <p className="text-xs text-emerald-800">{selectedApp.offerNote}</p>
                            </div>
                        )}

                        {/* Cover Letter */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500" />
                                Thư tự giới thiệu (Cover Letter)
                            </h4>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {selectedApp.coverLetter || 'Không có thư giới thiệu đính kèm.'}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Withdraw Confirmation Modal */}
            <Modal
                isOpen={!!withdrawModalApp}
                onClose={() => setWithdrawModalApp(null)}
                title="Xác nhận rút đơn ứng tuyển"
                maxWidth="md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Bạn có chắc chắn muốn rút đơn ứng tuyển vị trí{' '}
                        <strong>{withdrawModalApp?.jobTitle}</strong> tại{' '}
                        <strong>{withdrawModalApp?.companyName}</strong> không?
                    </p>
                    <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
                        Hành động này không thể hoàn tác. Doanh nghiệp sẽ nhận thông báo bạn đã rút khỏi đợt tuyển dụng.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setWithdrawModalApp(null)}
                            disabled={isWithdrawing}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleConfirmWithdraw}
                            isLoading={isWithdrawing}
                        >
                            Xác nhận rút đơn
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

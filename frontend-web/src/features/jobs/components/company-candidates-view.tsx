'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
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
    AlertCircle
} from 'lucide-react';
import type { CandidateApplication, ApplicationStatus } from '@/features/jobs/types/application.types';

export default function CompanyCandidatesView() {
    const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCand, setSelectedCand] = useState<CandidateApplication | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Hồ Sơ Ứng Viên Thực Tập
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Xem hồ sơ, thẩm định kỹ năng, sắp xếp lịch phỏng vấn và phát hành Offer tiếp nhận thực tập sinh.
                </p>
            </div>

            {/* Notification alert */}
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
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Đóng thông báo"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Candidates Table */}
            {candidates.length === 0 ? (
                <EmptyState
                    title="Chưa có hồ sơ ứng tuyển"
                    description="Hiện tại chưa có sinh viên nào nộp hồ sơ vào các vị trí thực tập của doanh nghiệp."
                />
            ) : (
                <div className="space-y-4">
                    {candidates.map((cand) => (
                        <Card key={cand.id} className="hover:border-slate-300 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Candidate info */}
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="font-bold text-base text-slate-900">
                                                {cand.studentName}
                                            </span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                MSSV: {cand.studentCode}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {cand.programName}
                                            </span>
                                            {cand.gpa && (
                                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                    GPA: {cand.gpa.toFixed(2)}
                                                </span>
                                            )}
                                            <StatusBadge status={cand.status} type="application" />
                                        </div>

                                        <p className="text-xs font-medium text-slate-700">
                                            Vị trí ứng tuyển: <span className="font-semibold text-blue-700">{cand.jobTitle}</span>
                                        </p>

                                        {/* Skills tags */}
                                        {cand.skills && cand.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {cand.skills.map((s, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[11px] py-0.5">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {cand.status === 'INTERVIEW_SCHEDULED' && cand.interviewScheduledAt && (
                                            <p className="text-xs text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200 inline-block">
                                                📅 Phỏng vấn: {new Date(cand.interviewScheduledAt).toLocaleString('vi-VN')} ({cand.interviewLocation})
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
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
                                            <span>Xem CV & Hồ sơ</span>
                                        </Button>

                                        {(cand.status === 'PENDING' || cand.status === 'SHORTLISTED') && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setInterviewModalCand(cand)}
                                                className="gap-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Lên lịch phỏng vấn</span>
                                            </Button>
                                        )}

                                        {(cand.status === 'PENDING' || cand.status === 'SHORTLISTED' || cand.status === 'INTERVIEW_SCHEDULED') && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                disabled
                                                title="API yêu cầu chọn Mentor và thời hạn phản hồi trước khi gửi Offer."
                                                onClick={() => setOfferModalCand(cand)}
                                                className="gap-1.5 text-xs"
                                            >
                                                <Award className="w-3.5 h-3.5" />
                                                <span>Gửi Offer</span>
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
            )}

            {/* Candidate Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Hồ sơ chi tiết ứng viên"
                maxWidth="2xl"
            >
                {selectedCand && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{selectedCand.studentName}</h3>
                                <p className="text-xs text-slate-500">
                                    MSSV: {selectedCand.studentCode} • Ngành: {selectedCand.programName}
                                </p>
                            </div>
                            <StatusBadge status={selectedCand.status} type="application" />
                        </div>

                        {/* Cover Letter */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Thư tự giới thiệu (Cover Letter)
                            </h4>
                            <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                                {selectedCand.coverLetter || 'Không có thư tự giới thiệu.'}
                            </p>
                        </div>

                        {/* CV Preview & Actions */}
                        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Bản CV đính kèm của ứng viên</p>
                                    <p className="text-[11px] text-slate-500">Định dạng PDF tiêu chuẩn</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => alert('Mở xem bản PDF của ứng viên')}
                                className="text-xs gap-1.5 bg-white"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem tệp CV</span>
                            </Button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Schedule Interview Modal */}
            <Modal
                isOpen={!!interviewModalCand}
                onClose={() => setInterviewModalCand(null)}
                title={`Lên lịch phỏng vấn: ${interviewModalCand?.studentName}`}
                maxWidth="lg"
            >
                <form onSubmit={handleScheduleInterview} className="space-y-4">
                    <Input
                        label="Thời gian phỏng vấn"
                        id="interviewTime"
                        type="datetime-local"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        required
                    />

                    <Input
                        label="Địa điểm hoặc Đường dẫn cuộc họp online"
                        id="interviewLoc"
                        value={interviewLocation}
                        onChange={(e) => setInterviewLocation(e.target.value)}
                        placeholder="VD: Phòng họp A, Tòa nhà FPT hoặc Link Microsoft Teams"
                        required
                    />

                    <Textarea
                        label="Ghi chú & Dặn dò ứng viên"
                        id="interviewNotes"
                        rows={3}
                        value={interviewNote}
                        onChange={(e) => setInterviewNote(e.target.value)}
                        placeholder="Chuẩn bị CV in sẵn, slide báo cáo đồ án hoặc laptop cá nhân..."
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setInterviewModalCand(null)}
                            disabled={isScheduling}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isScheduling}
                            className="gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Xác nhận gửi lịch</span>
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Send Offer Modal */}
            <Modal
                isOpen={!!offerModalCand}
                onClose={() => setOfferModalCand(null)}
                title={`Phát hành Thư mời tiếp nhận (Offer): ${offerModalCand?.studentName}`}
                maxWidth="lg"
            >
                <form onSubmit={handleSendOffer} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Mức phụ cấp thực tập (VNĐ/tháng)"
                            id="offerStipend"
                            type="number"
                            step="500000"
                            min="0"
                            value={offerStipend}
                            onChange={(e) => setOfferStipend(e.target.value)}
                            required
                        />
                        <Input
                            label="Ngày bắt đầu thực tập"
                            id="offerStart"
                            type="date"
                            value={offerStartDate}
                            onChange={(e) => setOfferStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <Input
                        label="Ngày kết thúc thực tập"
                        id="offerEnd"
                        type="date"
                        value={offerEndDate}
                        onChange={(e) => setOfferEndDate(e.target.value)}
                        required
                    />

                    <Textarea
                        label="Nội dung thư mời & Chế độ đãi ngộ"
                        id="offerDetails"
                        rows={3}
                        value={offerNote}
                        onChange={(e) => setOfferNote(e.target.value)}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOfferModalCand(null)}
                            disabled={isSendingOffer}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSendingOffer}
                            className="gap-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>Phát hành Offer</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

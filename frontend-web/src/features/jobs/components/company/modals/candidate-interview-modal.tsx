'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import type { CandidateApplication, ApplicationStatus } from '@/features/jobs/types/application.types';

export interface CandidateInterviewModalProps {
    candidate: CandidateApplication | null;
    onClose: () => void;
    onSuccess: (candidateId: string, scheduledIso: string, locationOrUrl: string, note: string) => void;
    onError: (errMsg: string) => void;
}

export function CandidateInterviewModal({
    candidate,
    onClose,
    onSuccess,
    onError,
}: CandidateInterviewModalProps) {
    const [interviewFormat, setInterviewFormat] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
    const [interviewDate, setInterviewDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        d.setHours(9, 30, 0, 0);
        return d.toISOString().slice(0, 16);
    });
    const [interviewMeetingUrl, setInterviewMeetingUrl] = useState('https://meet.google.com/abc-defg-hij');
    const [interviewLocation, setInterviewLocation] = useState(
        'Tòa nhà FPT Cần Thơ, Đường số 1, KDC Nam Long, P. Hưng Thạnh, Q. Cái Răng, TP. Cần Thơ'
    );
    const [interviewInterviewer, setInterviewInterviewer] = useState('Hội đồng chuyên môn & HR');
    const [interviewNote, setInterviewNote] = useState(
        'Ứng viên chuẩn bị demo đồ án cá nhân hoặc tài khoản GitHub/Portfolio'
    );
    const [isScheduling, setIsScheduling] = useState(false);

    if (!candidate) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsScheduling(true);
        try {
            const scheduledIso = new Date(interviewDate).toISOString();
            await apiClient.post(`/api/v1/applications/${candidate.id}/interview`, {
                format: interviewFormat,
                scheduledAt: scheduledIso,
                meetingUrl: interviewFormat === 'ONLINE' ? interviewMeetingUrl.trim() : undefined,
                location: interviewFormat === 'OFFLINE' ? interviewLocation.trim() : undefined,
                interviewer: interviewInterviewer.trim(),
                notes: interviewNote.trim(),
            });

            const locationOrUrl = interviewFormat === 'ONLINE' ? interviewMeetingUrl.trim() : interviewLocation.trim();
            onSuccess(candidate.id, scheduledIso, locationOrUrl, interviewNote);
            onClose();
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Không thể lên lịch phỏng vấn.');
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <Modal
            isOpen={Boolean(candidate)}
            onClose={onClose}
            title={`Lên lịch phỏng vấn: ${candidate.studentName}`}
            description={`Vị trí: ${candidate.jobTitle}`}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Hình thức phỏng vấn</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setInterviewFormat('ONLINE')}
                            className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                                interviewFormat === 'ONLINE'
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            🌐 Trực tuyến (Online)
                        </button>
                        <button
                            type="button"
                            onClick={() => setInterviewFormat('OFFLINE')}
                            className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                                interviewFormat === 'OFFLINE'
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            🏢 Trực tiếp (Offline)
                        </button>
                    </div>
                </div>

                <Input
                    label="Thời gian phỏng vấn"
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                />

                {interviewFormat === 'ONLINE' ? (
                    <Input
                        label="Liên kết phòng họp trực tuyến (Google Meet / Teams / Zoom)"
                        placeholder="https://meet.google.com/abc-defg-hij"
                        value={interviewMeetingUrl}
                        onChange={(e) => setInterviewMeetingUrl(e.target.value)}
                        required
                    />
                ) : (
                    <Input
                        label="Địa điểm phỏng vấn"
                        placeholder="Địa chỉ văn phòng công ty..."
                        value={interviewLocation}
                        onChange={(e) => setInterviewLocation(e.target.value)}
                        required
                    />
                )}

                <Input
                    label="Người phỏng vấn / Hội đồng chuyên môn"
                    placeholder="Ví dụ: Nguyễn Văn A (Tech Lead)"
                    value={interviewInterviewer}
                    onChange={(e) => setInterviewInterviewer(e.target.value)}
                />

                <Textarea
                    label="Ghi chú & Hướng dẫn chuẩn bị cho ứng viên"
                    placeholder="Ví dụ: Chuẩn bị slide đồ án, bài tập lớn, hoặc tài khoản GitHub cá nhân..."
                    value={interviewNote}
                    onChange={(e) => setInterviewNote(e.target.value)}
                    rows={3}
                />

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button type="submit" isLoading={isScheduling}>
                        Xác nhận lên lịch & Gửi thông báo
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

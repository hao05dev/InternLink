'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { FileText, Eye, Download } from 'lucide-react';
import { useFilePreview } from '@/features/documents/hooks/use-file-preview';
import { FilePreviewModal } from '@/features/documents/components/modals/file-preview-modal';
import type { CandidateApplication } from '@/features/jobs/types/application.types';

export interface CandidateDetailModalProps {
    candidate: CandidateApplication | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CandidateDetailModal({ candidate, isOpen, onClose }: CandidateDetailModalProps) {
    const { previewFile, isOpen: isPreviewOpen, openPreview, closePreview } = useFilePreview();

    if (!candidate) return null;

    const cvPreviewUrl = candidate.cvDocumentId
        ? `/api/v1/documents/${candidate.cvDocumentId}/preview`
        : '';
    const cvDownloadUrl = candidate.cvDocumentId
        ? `/api/v1/documents/${candidate.cvDocumentId}/download`
        : '';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Hồ sơ ứng viên: ${candidate.studentName}`}
            description={`Vị trí: ${candidate.jobTitle} • Nộp ngày: ${new Date(candidate.appliedAt).toLocaleDateString('vi-VN')}`}
            maxWidth="2xl"
        >
            <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                        <span className="text-slate-400">MSSV:</span>{' '}
                        <strong className="text-slate-800">{candidate.studentCode}</strong>
                    </div>
                    <div>
                        <span className="text-slate-400">Ngành học:</span>{' '}
                        <strong className="text-slate-800">{candidate.programName}</strong>
                    </div>
                    <div>
                        <span className="text-slate-400">GPA tích lũy:</span>{' '}
                        <strong className="text-emerald-700">{candidate.gpa ? candidate.gpa.toFixed(2) : '—'}</strong>
                    </div>
                    <div>
                        <span className="text-slate-400">Trạng thái:</span>{' '}
                        <StatusBadge status={candidate.status} type="application" />
                    </div>
                </div>

                {candidate.cvDocumentId && (
                    <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-lg bg-white border border-sky-200 text-rose-600 shadow-2xs">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">
                                    CV ứng tuyển của sinh viên
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Định dạng PDF/Tài liệu đã tải lên
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    openPreview({
                                        id: candidate.cvDocumentId,
                                        fileName: `CV_${candidate.studentName || 'UngVien'}.pdf`,
                                        fileUrl: cvPreviewUrl,
                                        downloadUrl: cvDownloadUrl,
                                        mimeType: 'application/pdf',
                                    })
                                }
                                className="h-8 gap-1.5 text-xs font-semibold bg-white"
                            >
                                <Eye className="w-3.5 h-3.5 text-sky-600" />
                                <span>Xem trước CV</span>
                            </Button>
                            <a href={cvDownloadUrl} download={`CV_${candidate.studentName || 'UngVien'}.pdf`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Tải xuống CV">
                                    <Download className="w-3.5 h-3.5 text-slate-600" />
                                </Button>
                            </a>
                        </div>
                    </div>
                )}

                {candidate.coverLetter && (
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-800">Thư giới thiệu (Cover Letter)</h4>
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-line border border-slate-100">
                            {candidate.coverLetter}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>

            <FilePreviewModal file={previewFile} isOpen={isPreviewOpen} onClose={closePreview} />
        </Modal>
    );
}

'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import type { CandidateApplication } from '@/features/jobs/types/application.types';

export interface CandidateDetailModalProps {
    candidate: CandidateApplication | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CandidateDetailModal({ candidate, isOpen, onClose }: CandidateDetailModalProps) {
    if (!candidate) return null;

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
        </Modal>
    );
}

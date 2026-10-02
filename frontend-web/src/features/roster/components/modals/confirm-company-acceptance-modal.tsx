'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Info, UserCheck } from 'lucide-react';

interface ConfirmCompanyAcceptanceModalProps {
    isOpen: boolean;
    studentName: string;
    hostName?: string;
    reviewNote: string;
    onReviewNoteChange: (note: string) => void;
    isProcessing: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ConfirmCompanyAcceptanceModal({
    isOpen,
    studentName,
    hostName,
    reviewNote,
    onReviewNoteChange,
    isProcessing,
    onClose,
    onConfirm,
}: ConfirmCompanyAcceptanceModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xác nhận công ty chấp nhận thực tập"
            maxWidth="md"
        >
            <div className="space-y-5">
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <div className="flex gap-2">
                        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-sky-800 space-y-1">
                            <p>
                                Bạn đang xác nhận sinh viên <strong>{studentName}</strong> đã được công ty{' '}
                                <strong>{hostName || 'N/A'}</strong> chấp nhận cho thực tập.
                            </p>
                            <p>
                                Sau khi xác nhận, hệ thống sẽ chuyển sinh viên vào <strong>giai đoạn thực tập chính thức</strong>.
                            </p>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ghi chú (tùy chọn)</label>
                    <textarea
                        value={reviewNote}
                        onChange={(e) => onReviewNoteChange(e.target.value)}
                        placeholder="Ghi chú của Quản lý Khoa..."
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 resize-none bg-white"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        isLoading={isProcessing}
                        className="gap-2"
                    >
                        <UserCheck className="w-4 h-4" />
                        Xác nhận chấp nhận
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

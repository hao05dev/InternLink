'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Lock, AlertTriangle } from 'lucide-react';

interface CloseTermConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (termId: string, reason: string) => Promise<void>;
    term: {
        id: string;
        code: string;
        termName: string;
        status: string;
    } | null;
    activeStudentsCount?: number;
    isLoading?: boolean;
}

export function CloseTermConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    term,
    activeStudentsCount = 0,
    isLoading = false,
}: CloseTermConfirmModalProps) {
    const [reason, setReason] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    if (!term) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setValidationError('Vui lòng nhập lý do đóng học kỳ.');
            return;
        }
        if (confirmCode !== term.code) {
            setValidationError(`Vui lòng nhập chính xác mã "${term.code}" để xác nhận.`);
            return;
        }

        setValidationError(null);
        await onConfirm(term.id, reason);
        setReason('');
        setConfirmCode('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xác nhận Đóng Học kỳ Thực tập"
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Warning Alert */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900">
                    <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                    <div className="text-xs space-y-1">
                        <p className="font-bold text-sm">Hành động này sẽ khóa toàn bộ hoạt động của học kỳ!</p>
                        <p>
                            Học kỳ <strong>{term.code} ({term.termName})</strong> sẽ chuyển sang trạng thái <strong>CLOSED</strong>.
                        </p>
                        <p className="text-rose-700">
                            • Toàn bộ dữ liệu (sinh viên, nhật ký, đánh giá) chuyển sang chế độ <strong>Chỉ đọc (Read-only)</strong>.<br />
                            • Sinh viên không thể nộp đơn, viết nhật ký hay nộp báo cáo trong kỳ này nữa.
                        </p>
                    </div>
                </div>

                {activeStudentsCount > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                            Cảnh báo: Hiện có <strong>{activeStudentsCount}</strong> sinh viên đang trong quá trình thực tập dở dang trong kỳ này.
                        </span>
                    </div>
                )}

                {/* Reason Input */}
                <div className="space-y-1.5">
                    <label htmlFor="closeReason" className="text-xs font-semibold text-slate-700">
                        Lý do đóng học kỳ <span className="text-rose-500">*</span>
                    </label>
                    <Textarea
                        id="closeReason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="VD: Kết thúc đợt thực tập chính thức theo kế hoạch / Chốt sổ điểm gửi Phòng Đào tạo / Hủy kỳ do kế hoạch thay đổi..."
                        rows={3}
                        required
                    />
                </div>

                {/* 2-Step Safety Verification Code */}
                <div className="space-y-1.5">
                    <label htmlFor="confirmCode" className="text-xs font-semibold text-slate-700">
                        Nhập lại mã học kỳ <span className="font-mono text-sky-700 font-bold">&quot;{term.code}&quot;</span> để xác nhận:
                    </label>
                    <input
                        id="confirmCode"
                        type="text"
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value)}
                        placeholder={term.code}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm font-mono"
                        required
                    />
                </div>

                {validationError && (
                    <p className="text-xs font-semibold text-rose-600">{validationError}</p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        variant="destructive"
                        isLoading={isLoading}
                        className="gap-1.5"
                    >
                        <Lock className="w-4 h-4" />
                        <span>Xác nhận Đóng kỳ</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

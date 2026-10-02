'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, XCircle } from 'lucide-react';
import { InternshipPlacement } from '../../types/placement.types';

interface RejectPlacementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (placementId: string, reason: string) => Promise<void>;
    placement: InternshipPlacement | null;
    isLoading?: boolean;
}

const COMMON_REJECTION_REASONS = [
    'Mô tả công việc không phù hợp với chuẩn đầu ra chuyên ngành CNTT.',
    'Thông tin Doanh nghiệp không đầy đủ / không tra cứu được Mã số thuế.',
    'Chưa đính kèm Giấy tiếp nhận hoặc Giấy tiếp nhận thiếu mộc đỏ/chữ ký hợp lệ.',
    'Thời lượng thực tập không đủ số tuần tối thiểu theo quy chế của Khoa.',
    'Thông tin Người hướng dẫn (Mentor) không hợp lệ hoặc không có email/SĐT liên hệ.',
];

export function RejectPlacementModal({
    isOpen,
    onClose,
    onConfirm,
    placement,
    isLoading = false,
}: RejectPlacementModalProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!placement) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do từ chối để sinh viên chỉnh sửa và nộp lại.');
            return;
        }

        setError(null);
        await onConfirm(placement.id, reason);
        setReason('');
    };

    const handleSelectTemplate = (template: string) => {
        setReason((prev) => (prev ? `${prev}\n• ${template}` : template));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Từ chối Đơn Đăng ký Chỗ Thực tập"
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Sinh viên: {placement.studentName} ({placement.studentCode})</span>
                    </div>
                    <p>
                        Doanh nghiệp: <strong>{placement.companyName}</strong> — Vị trí: <strong>{placement.jobTitle}</strong>
                    </p>
                    <p className="text-rose-700">
                        Lý do từ chối sẽ được gửi trực tiếp qua Email và hiển thị trên tài khoản của sinh viên để sinh viên bổ sung/nộp lại.
                    </p>
                </div>

                {/* Quick Templates */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                        Gợi ý lý do phổ biến (Click để chèn nhanh):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {COMMON_REJECTION_REASONS.map((tpl, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectTemplate(tpl)}
                                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-left cursor-pointer border border-slate-200"
                            >
                                + {tpl.slice(0, 45)}...
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reason Input */}
                <div className="space-y-1.5">
                    <label htmlFor="rejectionReason" className="text-xs font-semibold text-slate-700">
                        Chi tiết lý do từ chối & Yêu cầu chỉnh sửa <span className="text-rose-500">*</span>
                    </label>
                    <Textarea
                        id="rejectionReason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Nhập chi tiết nhận xét để sinh viên biết cần bổ sung hoặc điều chỉnh thông tin gì..."
                        rows={4}
                        required
                    />
                </div>

                {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="destructive"
                        isLoading={isLoading}
                        className="gap-1.5"
                    >
                        <XCircle className="w-4 h-4" />
                        <span>Xác nhận Từ chối</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

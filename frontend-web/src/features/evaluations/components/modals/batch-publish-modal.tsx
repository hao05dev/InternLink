'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface BatchPublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    termName: string;
    eligibleCount: number;
    totalCount: number;
    onConfirm: () => Promise<void>;
    isProcessing: boolean;
}

export function BatchPublishModal({
    isOpen,
    onClose,
    termName,
    eligibleCount,
    totalCount,
    onConfirm,
    isProcessing,
}: BatchPublishModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-indigo-300" />
                        <h2 className="text-base font-bold">Công Bố Kết Quả Thực Tập Hàng Loạt</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 text-sm text-slate-600">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                            <p className="font-semibold">Lưu ý trước khi công bố:</p>
                            <p>
                                Khi công bố, sinh viên sẽ có thể xem được điểm hệ 10, hệ 4, điểm chữ và xếp loại trên Cổng Sinh Viên. 
                                Các lần thực tập có kết quả ĐẠT sẽ được tự động cập nhật trạng thái <strong>HOÀN THÀNH (COMPLETED)</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Kỳ thực tập:</span>
                            <span className="font-semibold text-slate-900">{termName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Tổng số sinh viên trong kỳ:</span>
                            <span className="font-semibold text-slate-900">{totalCount}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-indigo-900 font-medium flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Số sinh viên đủ điều kiện công bố:
                            </span>
                            <span className="text-base font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                                {eligibleCount} sinh viên
                            </span>
                        </div>
                    </div>

                    {eligibleCount === 0 && (
                        <p className="text-xs text-rose-600 italic">
                            Hiện chưa có sinh viên nào có đủ điểm đánh giá hoặc tất cả đã được công bố trước đó.
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
                        Hủy bỏ
                    </Button>
                    <Button
                        size="sm"
                        disabled={isProcessing || eligibleCount === 0}
                        onClick={onConfirm}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isProcessing ? 'Đang thực hiện công bố...' : `Xác nhận công bố cho ${eligibleCount} SV`}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

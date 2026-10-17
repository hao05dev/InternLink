'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Save, Send, ArrowLeft } from 'lucide-react';

interface JobFormActionsProps {
    isSubmitting: boolean;
    isTermClosed?: boolean;
    disabled?: boolean;
    onSaveDraft: () => void;
    onSubmitReview?: () => void;
    mode?: 'create' | 'edit';
}

export function JobFormActions({
    isSubmitting,
    isTermClosed,
    disabled,
    onSaveDraft,
    onSubmitReview,
    mode = 'create',
}: JobFormActionsProps) {
    return (
        <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-slate-200 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/company/jobs">
                <Button type="button" variant="secondary" disabled={isSubmitting} className="gap-2 text-xs w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Hủy & Quay lại danh sách</span>
                </Button>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onSaveDraft}
                    isLoading={isSubmitting}
                    disabled={disabled || isSubmitting || isTermClosed}
                    title={isTermClosed ? 'Kỳ thực tập đã kết thúc (CLOSED)' : undefined}
                    className="gap-1.5 text-xs w-full sm:w-auto"
                >
                    <Save className="w-4 h-4 text-slate-600" />
                    <span>{mode === 'edit' ? 'Lưu cập nhật' : 'Lưu bản nháp'}</span>
                </Button>

                {onSubmitReview && (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={onSubmitReview}
                        isLoading={isSubmitting}
                        disabled={disabled || isSubmitting || isTermClosed}
                        title={isTermClosed ? 'Kỳ thực tập đã kết thúc (CLOSED)' : undefined}
                        className="gap-1.5 text-xs w-full sm:w-auto"
                    >
                        <Send className="w-4 h-4" />
                        <span>Gửi duyệt lên Khoa</span>
                    </Button>
                )}
            </div>
        </div>
    );
}

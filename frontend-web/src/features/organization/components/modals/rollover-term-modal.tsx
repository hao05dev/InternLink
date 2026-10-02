'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { AcademicTermFilter } from '@/components/ui/academic-term-filter';
import { ArrowRight, RefreshCw, CheckCircle2, Users } from 'lucide-react';

interface TermSimple {
    id: string;
    code: string;
    termName: string;
    academicYear: string;
    status: string;
}

interface RolloverTermModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (sourceTermId: string, targetTermId: string, options: { retainMentor: boolean }) => Promise<void>;
    sourceTerm: TermSimple | null;
    availableTargetTerms: TermSimple[];
    inProgressStudentsCount?: number;
    isLoading?: boolean;
}

export function RolloverTermModal({
    isOpen,
    onClose,
    onConfirm,
    sourceTerm,
    availableTargetTerms,
    inProgressStudentsCount = 0,
    isLoading = false,
}: RolloverTermModalProps) {
    const [targetTermId, setTargetTermId] = useState('');
    const [retainMentor, setRetainMentor] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (!sourceTerm) return null;

    const validTargetTerms = availableTargetTerms.filter(
        (t) => t.id !== sourceTerm.id && t.status !== 'CLOSED'
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const effectiveTargetId = targetTermId || validTargetTerms[0]?.id;
        if (!effectiveTargetId) {
            setError('Vui lòng chọn học kỳ đích để chuyển tiếp sinh viên.');
            return;
        }

        setError(null);
        await onConfirm(sourceTerm.id, effectiveTargetId, { retainMentor });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chuyển tiếp Sinh viên sang Học kỳ mới (Rollover)"
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-sky-900">
                        <RefreshCw className="w-4 h-4 text-sky-600" />
                        <span>Chuyển tiếp sinh viên chưa hoàn thành</span>
                    </div>
                    <p>
                        Tính năng này giúp bạn sao chép danh sách các sinh viên đang thực tập dở dang hoặc cần gia hạn từ kỳ <strong>{sourceTerm.code}</strong> sang một học kỳ mới đang mở.
                    </p>
                    <div className="flex items-center gap-1.5 font-semibold text-sky-800">
                        <Users className="w-4 h-4" />
                        <span>Số lượng sinh viên dự kiến chuyển tiếp: <strong>{inProgressStudentsCount}</strong> sinh viên</span>
                    </div>
                </div>

                {/* Source -> Target Display */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500">Học kỳ nguồn (Đã đóng):</span>
                        <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">{sourceTerm.code} ({sourceTerm.academicYear})</span>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-sky-700 block">Học kỳ đích tiếp nhận:</span>
                        {validTargetTerms.length > 0 ? (
                            <AcademicTermFilter
                                terms={validTargetTerms}
                                selectedTermId={targetTermId || validTargetTerms[0].id}
                                onTermChange={setTargetTermId}
                                variant="grid"
                                showStatusBadge={true}
                            />
                        ) : (
                            <p className="text-xs text-rose-600 font-medium">Chưa có học kỳ mới đang mở</p>
                        )}
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-2 pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                        <input
                            type="checkbox"
                            checked={retainMentor}
                            onChange={(e) => setRetainMentor(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span>
                            <strong>Giữ nguyên thông tin Doanh nghiệp & Mentor:</strong> Sinh viên sẽ tiếp tục thực tập tại đơn vị cũ mà không cần nộp lại đơn từ đầu.
                        </span>
                    </label>
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
                        variant="primary"
                        isLoading={isLoading}
                        disabled={validTargetTerms.length === 0}
                        className="gap-1.5"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Thực hiện chuyển tiếp</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

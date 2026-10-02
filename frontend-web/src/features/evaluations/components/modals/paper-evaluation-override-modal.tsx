'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

interface PaperEvaluationOverrideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (payload: {
        placementId: string;
        mentorScore: number;
        mentorFeedback: string;
        proofUrl: string;
    }) => Promise<void>;
    placement: InternshipPlacement | null;
    isLoading?: boolean;
}

export function PaperEvaluationOverrideModal({
    isOpen,
    onClose,
    onConfirm,
    placement,
    isLoading = false,
}: PaperEvaluationOverrideModalProps) {
    const [mentorScore, setMentorScore] = useState('8.5');
    const [mentorFeedback, setMentorFeedback] = useState('Sinh viên chấp hành tốt kỷ luật công ty, hoàn thành đúng hạn các task được giao.');
    const [proofUrl, setProofUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!placement) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const scoreNum = parseFloat(mentorScore);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
            setError('Điểm số phải từ 0 đến 10.');
            return;
        }

        setError(null);
        await onConfirm({
            placementId: placement.id,
            mentorScore: scoreNum,
            mentorFeedback,
            proofUrl,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nhập Điểm Thay Theo Phiếu Giấy Doanh Nghiệp"
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Chế độ Ngoại lệ: Nhập điểm thay Doanh nghiệp ngoài</span>
                    </div>
                    <p>
                        Dành cho trường hợp Mentor của Doanh nghiệp ngoài không tạo tài khoản trên web mà gửi Phiếu đánh giá bằng văn bản giấy hoặc file scan có mộc đỏ.
                    </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <p><strong>Sinh viên:</strong> {placement.studentName} ({placement.studentCode})</p>
                    <p><strong>Đơn vị thực tập:</strong> {placement.companyName}</p>
                    <p><strong>Mentor ghi trên phiếu:</strong> {placement.mentorName || 'Chưa cập nhật'}</p>
                </div>

                <div className="space-y-3">
                    <Input
                        label="Điểm đánh giá của Doanh nghiệp (Thang điểm 10)"
                        id="mentorScore"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={mentorScore}
                        onChange={(e) => setMentorScore(e.target.value)}
                        required
                    />

                    <Textarea
                        label="Nhận xét của Mentor Doanh nghiệp (Theo phiếu)"
                        id="mentorFeedback"
                        value={mentorFeedback}
                        onChange={(e) => setMentorFeedback(e.target.value)}
                        rows={3}
                        required
                    />

                    <Input
                        label="Đường dẫn file scan / ảnh chụp Phiếu đánh giá giấy (Google Drive / Cloudinary)"
                        id="proofUrl"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://drive.google.com/... (Bắt buộc để lưu minh chứng)"
                        required
                    />
                </div>

                {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

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
                        className="gap-1.5"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Lưu điểm Doanh nghiệp</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

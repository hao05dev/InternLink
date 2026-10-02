'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, AlertTriangle, Info, Clock, Building } from 'lucide-react';
import { IneligibleNoticePayload } from '../../types/roster.types';

interface IneligibleNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: IneligibleNoticePayload) => Promise<boolean>;
    isLoading: boolean;
    ineligibleCount: number;
    totalCount: number;
    selectedTermId: string;
    termName: string;
}

const DEFAULT_INELIGIBLE_EMAIL_BODY = `Kính gửi sinh viên {{studentName}} (MSSV: {{studentCode}}),

Khoa Công nghệ Thông tin & Truyền thông thông báo:

Hồ sơ đăng ký tham gia kỳ thực tập {{termName}} của bạn hiện CHƯA ĐỦ ĐIỀU KIỆN.
📌 Lý do / Ghi chú từ Khoa: {{eligibilityNote}}

⚠️ QUAN TRỌNG:
Để không bị lỡ kỳ thực tập, bạn vui lòng rà soát và bổ sung các điều kiện / minh chứng còn thiếu:
- Hạn chót nộp minh chứng bổ sung: {{supplementDeadline}}
- Địa điểm / Kênh tiếp nhận: {{contactInfo}}

Sau khi hoàn tất bổ sung, Khoa sẽ thẩm định lại và chuyển trạng thái của bạn sang ĐỦ ĐIỀU KIỆN để kịp tiến độ đăng ký vị trí thực tập.

Trân trọng,
Ban Quản lý Thực tập - Khoa CNTT&TT`;

export function IneligibleNotificationModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    ineligibleCount,
    totalCount,
    selectedTermId,
    termName,
}: IneligibleNotificationModalProps) {
    const [supplementDeadline, setSupplementDeadline] = useState('');
    const [contactInfo, setContactInfo] = useState('Văn phòng Khoa - Phòng 202, Tòa nhà A (Hoặc liên hệ Cố vấn học tập)');
    const [emailSubjectTemplate, setEmailSubjectTemplate] = useState('Thông báo điều kiện tham gia thực tập - {{termName}}');
    const [emailBodyTemplate, setEmailBodyTemplate] = useState(DEFAULT_INELIGIBLE_EMAIL_BODY);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onSubmit({
            supplementDeadline: supplementDeadline || 'Trước khi đóng cổng đăng ký',
            contactInfo,
            emailSubjectTemplate,
            emailBodyTemplate,
        });
        if (success) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Gửi Email Thông Báo Cho Sinh Viên Chưa Đủ Điều Kiện"
            description="Thông báo lý do chưa đủ điều kiện và nhắc nhở sinh viên bổ sung minh chứng kịp thời"
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <p className="text-xs font-bold text-rose-900">
                            Đối tượng nhận email: {ineligibleCount} sinh viên chưa đủ điều kiện trong kỳ {termName}
                        </p>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed pl-6">
                        Email sẽ tự động chèn <strong>Lý do / Ghi chú cụ thể</strong> của từng sinh viên (ví dụ: thiếu tín chỉ, thiếu học phần tiên quyết...) để sinh viên nắm rõ và bổ sung hồ sơ trước hạn chót.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Hạn chót bổ sung minh chứng *"
                        type="date"
                        value={supplementDeadline}
                        onChange={e => setSupplementDeadline(e.target.value)}
                        required
                    />
                    <Input
                        label="Kênh / Địa điểm tiếp nhận giải quyết *"
                        placeholder="Văn phòng Khoa, Phòng 202"
                        value={contactInfo}
                        onChange={e => setContactInfo(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tiêu đề email</label>
                    <input
                        type="text"
                        value={emailSubjectTemplate}
                        onChange={e => setEmailSubjectTemplate(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">Nội dung email (tùy chỉnh)</label>
                        <span className="text-[10px] text-slate-400 font-mono">
                            Biến hỗ trợ: {'{{studentName}}'}, {'{{studentCode}}'}, {'{{eligibilityNote}}'}, {'{{supplementDeadline}}'}
                        </span>
                    </div>
                    <textarea
                        value={emailBodyTemplate}
                        onChange={e => setEmailBodyTemplate(e.target.value)}
                        rows={11}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 resize-y"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        disabled={!selectedTermId || ineligibleCount === 0}
                        className="gap-2 bg-rose-600 hover:bg-rose-700"
                    >
                        <Mail className="w-4 h-4" />
                        Gửi thông báo ({ineligibleCount} sinh viên)
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

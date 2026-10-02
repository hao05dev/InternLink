'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Info } from 'lucide-react';

export interface EmailNoticePayload {
    pickupLocation: string;
    pickupDate: string;
    emailSubjectTemplate: string;
    emailBodyTemplate: string;
}

interface EmailNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: EmailNoticePayload) => Promise<void>;
    isLoading: boolean;
    eligibleCount: number;
    totalCount: number;
    selectedTermId: string;
}

const DEFAULT_EMAIL_BODY = `Kính gửi sinh viên {{studentName}},

Khoa Công nghệ Thông tin & Truyền thông thông báo:

Sinh viên {{studentName}} (MSSV: {{studentCode}}) đã đủ điều kiện tham gia kỳ thực tập {{termName}}.

📍 Địa điểm nhận giấy giới thiệu: {{pickupLocation}}
📅 Thời gian bắt đầu nhận: {{pickupDate}}
🕐 Giờ làm việc: 7:30 - 11:30 và 13:30 - 17:00 (Thứ 2 - Thứ 6)

Lưu ý khi đến nhận giấy:
- Mang theo thẻ sinh viên
- Điền đầy đủ thông tin vào phiếu đăng ký
- Giấy giới thiệu chỉ cấp 1 lần

Mọi thắc mắc xin liên hệ văn phòng khoa.

Trân trọng,
Ban Quản lý Thực tập - Khoa CNTT&TT`;

export function EmailNotificationModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    eligibleCount,
    totalCount,
    selectedTermId,
}: EmailNotificationModalProps) {
    const [pickupLocation, setPickupLocation] = useState('Văn phòng khoa - Phòng 202, Tòa nhà A');
    const [pickupDate, setPickupDate] = useState('');
    const [emailSubjectTemplate, setEmailSubjectTemplate] = useState('Thông báo nhận giấy giới thiệu thực tập - {{termName}}');
    const [emailBodyTemplate, setEmailBodyTemplate] = useState(DEFAULT_EMAIL_BODY);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            pickupLocation,
            pickupDate,
            emailSubjectTemplate,
            emailBodyTemplate,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gửi email thông báo nhận giấy giới thiệu" maxWidth="2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            Email sẽ được gửi đến <strong>{eligibleCount}</strong> sinh viên đủ điều kiện trong kỳ thực tập này.
                            Bạn có thể chỉnh sửa nội dung email trước khi gửi. Các biến dữ liệu như <code>{'{{studentName}}'}</code>, <code>{'{{studentCode}}'}</code>, <code>{'{{termName}}'}</code>, <code>{'{{pickupLocation}}'}</code>, <code>{'{{pickupDate}}'}</code> sẽ được tự động điền.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Địa điểm nhận giấy *"
                        placeholder="Văn phòng khoa, Phòng 202"
                        value={pickupLocation}
                        onChange={e => setPickupLocation(e.target.value)}
                        required
                    />
                    <Input
                        label="Ngày bắt đầu nhận *"
                        type="date"
                        value={pickupDate}
                        onChange={e => setPickupDate(e.target.value)}
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nội dung email (có thể chỉnh sửa)</label>
                    <textarea
                        value={emailBodyTemplate}
                        onChange={e => setEmailBodyTemplate(e.target.value)}
                        rows={14}
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
                        disabled={!selectedTermId || totalCount === 0}
                        className="gap-2"
                    >
                        <Mail className="w-4 h-4" />
                        Gửi thông báo ({eligibleCount} email)
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

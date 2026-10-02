'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, RefreshCw, Building2 } from 'lucide-react';
import { InternshipPlacement, TransferPlacementPayload } from '../../types/placement.types';

interface TransferPlacementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: TransferPlacementPayload) => Promise<void>;
    placement: InternshipPlacement | null;
    isLoading?: boolean;
}

export function TransferPlacementModal({
    isOpen,
    onClose,
    onSubmit,
    placement,
    isLoading = false,
}: TransferPlacementModalProps) {
    const [reason, setReason] = useState('');
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyTaxCode, setNewCompanyTaxCode] = useState('');
    const [newCompanyAddress, setNewCompanyAddress] = useState('');
    const [newJobTitle, setNewJobTitle] = useState('');
    const [newJobDescription, setNewJobDescription] = useState('');
    const [newMentorName, setNewMentorName] = useState('');
    const [newMentorEmail, setNewMentorEmail] = useState('');
    const [newMentorPhone, setNewMentorPhone] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');
    const [newAcceptanceLetterUrl, setNewAcceptanceLetterUrl] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!placement) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim() || !newCompanyName.trim() || !newJobTitle.trim() || !newMentorEmail.trim()) {
            setError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
            return;
        }

        setError(null);
        await onSubmit({
            placementId: placement.id,
            reason,
            newCompanyName,
            newCompanyTaxCode,
            newCompanyAddress,
            newJobTitle,
            newJobDescription,
            newMentorName,
            newMentorEmail,
            newMentorPhone,
            newStartDate,
            newEndDate,
            newAcceptanceLetterUrl,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Đơn Xin Đổi Đơn Vị Thực Tập"
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Warning note */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Đơn vị hiện tại: {placement.companyName} ({placement.jobTitle})</span>
                    </div>
                    <p>
                        Yêu cầu chuyển đổi đơn vị thực tập sẽ được gửi đến <strong>Ban Quản lý Khoa</strong> phê duyệt. Lịch sử thực tập tại đơn vị cũ sẽ được hệ thống lưu vết đầy đủ.
                    </p>
                </div>

                {/* Transfer Reason */}
                <div className="space-y-1">
                    <label htmlFor="transferReason" className="text-xs font-semibold text-slate-700">
                        Lý do xin đổi đơn vị thực tập <span className="text-rose-500">*</span>
                    </label>
                    <Textarea
                        id="transferReason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Nêu rõ lý do (VD: Công ty giải thể, dự án bị hủy, công việc không đúng chuyên ngành được giao...)"
                        rows={2}
                        required
                    />
                </div>

                {/* New Company Information */}
                <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-3">
                        <Building2 className="w-4 h-4 text-sky-600" />
                        <span>Thông tin Đơn vị thực tập mới</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Tên Doanh nghiệp mới"
                            id="newCompanyName"
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            placeholder="VD: FPT Software Cần Thơ"
                            required
                        />
                        <Input
                            label="Mã số thuế (nếu có)"
                            id="newCompanyTaxCode"
                            value={newCompanyTaxCode}
                            onChange={(e) => setNewCompanyTaxCode(e.target.value)}
                            placeholder="VD: 0101234567"
                        />
                        <div className="sm:col-span-2">
                            <Input
                                label="Địa chỉ làm việc"
                                id="newCompanyAddress"
                                value={newCompanyAddress}
                                onChange={(e) => setNewCompanyAddress(e.target.value)}
                                placeholder="Địa chỉ chi nhánh hoặc văn phòng công ty"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* New Job & Mentor info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <Input
                        label="Vị trí thực tập mới"
                        id="newJobTitle"
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        placeholder="VD: Frontend React Developer Intern"
                        required
                    />
                    <Input
                        label="Họ tên Mentor mới"
                        id="newMentorName"
                        value={newMentorName}
                        onChange={(e) => setNewMentorName(e.target.value)}
                        placeholder="VD: Trần Văn Quản Lý"
                        required
                    />
                    <Input
                        label="Email Mentor mới"
                        id="newMentorEmail"
                        type="email"
                        value={newMentorEmail}
                        onChange={(e) => setNewMentorEmail(e.target.value)}
                        placeholder="mentor@company.com"
                        required
                    />
                    <Input
                        label="SĐT Mentor mới"
                        id="newMentorPhone"
                        value={newMentorPhone}
                        onChange={(e) => setNewMentorPhone(e.target.value)}
                        placeholder="VD: 0901234567"
                        required
                    />
                    <div className="sm:col-span-2">
                        <Textarea
                            label="Mô tả công việc tại đơn vị mới"
                            id="newJobDescription"
                            value={newJobDescription}
                            onChange={(e) => setNewJobDescription(e.target.value)}
                            placeholder="Mô tả các nhiệm vụ và công nghệ chính sẽ làm việc..."
                            rows={2}
                            required
                        />
                    </div>
                    <Input
                        label="Ngày bắt đầu mới"
                        id="newStartDate"
                        type="date"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        required
                    />
                    <Input
                        label="Ngày kết thúc mới"
                        id="newEndDate"
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        required
                    />
                    <div className="sm:col-span-2">
                        <Input
                            label="Đường dẫn file Giấy tiếp nhận mới (PDF/Ảnh)"
                            id="newAcceptanceLetterUrl"
                            value={newAcceptanceLetterUrl}
                            onChange={(e) => setNewAcceptanceLetterUrl(e.target.value)}
                            placeholder="https://... hoặc link đính kèm minh chứng"
                        />
                    </div>
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
                        className="gap-1.5"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Gửi đơn xin đổi</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

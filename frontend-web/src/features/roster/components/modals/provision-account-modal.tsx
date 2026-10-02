'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { KeyRound, UserPlus } from 'lucide-react';
import { RosterStudent } from '../../types/roster.types';

interface ProvisionAccountModalProps {
    isOpen: boolean;
    student: RosterStudent | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

export function ProvisionAccountModal({
    isOpen,
    student,
    onClose,
    onConfirm,
    isLoading,
}: ProvisionAccountModalProps) {
    if (!student) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tạo tài khoản sinh viên"
            maxWidth="md"
        >
            <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex gap-2">
                        <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 space-y-1.5">
                            <p className="font-semibold">Sẽ tạo tài khoản sinh viên với thông tin:</p>
                            <div className="space-y-0.5">
                                <p>👤 <strong>{student.fullName}</strong></p>
                                <p>🆔 MSSV: <strong>{student.studentCode}</strong></p>
                                <p>📧 Email đăng nhập: <strong>{student.officialEmail}</strong></p>
                                <p>🔑 Mật khẩu mặc định: <strong>Internlink@ + 6 số cuối MSSV</strong></p>
                            </div>
                            <p className="text-amber-700 font-medium mt-2">
                                ⚠ Sinh viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
                            </p>
                            <p className="text-amber-600">
                                Nếu email <strong>{student.officialEmail}</strong> đã có tài khoản, hệ thống sẽ tự động liên kết.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={onConfirm} isLoading={isLoading} className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Xác nhận tạo tài khoản
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

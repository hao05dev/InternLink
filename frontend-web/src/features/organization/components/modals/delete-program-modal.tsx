'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AcademicProgram } from '../../types/organization.types';

interface DeleteProgramModalProps {
    isOpen: boolean;
    program: AcademicProgram | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

export function DeleteProgramModal({
    isOpen,
    program,
    onClose,
    onConfirm,
    isLoading,
}: DeleteProgramModalProps) {
    if (!program) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xác nhận xóa ngành đào tạo"
            description="Hành động này không thể hoàn tác nếu ngành đã bị xóa khỏi hệ thống."
            maxWidth="sm"
        >
            <div className="space-y-4 pt-2">
                <p className="text-sm text-slate-700">
                    Bạn có chắc chắn muốn xóa ngành{' '}
                    <strong className="text-slate-900 font-semibold">{program.name}</strong> (Mã:{' '}
                    <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        {program.code}
                    </code>
                    ) không?
                </p>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    <p className="font-semibold mb-1">Lưu ý an toàn dữ liệu:</p>
                    <p>
                        Nếu ngành này đã có sinh viên đăng ký, danh sách thực tập hoặc khung đánh giá CLO, hệ thống sẽ
                        từ chối xóa. Trong trường hợp đó, bạn có thể chuyển trạng thái sang{' '}
                        <strong>&quot;Ngừng hoạt động&quot;</strong>.
                    </p>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        Xác nhận xóa
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

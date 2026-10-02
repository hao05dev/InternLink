'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Department } from '../../types/organization.types';

interface DepartmentFormModalProps {
    isOpen: boolean;
    department: Department | null | 'new';
    onClose: () => void;
    onSubmit: (form: { code: string; name: string; contactEmail: string; isActive: boolean }) => Promise<boolean>;
    isLoading: boolean;
}

export function DepartmentFormModal({
    isOpen,
    department,
    onClose,
    onSubmit,
    isLoading,
}: DepartmentFormModalProps) {
    const [form, setForm] = useState({
        code: '',
        name: '',
        contactEmail: '',
        isActive: true,
    });

    useEffect(() => {
        if (department && department !== 'new') {
            setForm({
                code: department.code,
                name: department.name,
                contactEmail: department.contactEmail,
                isActive: department.isActive,
            });
        } else {
            setForm({ code: '', name: '', contactEmail: '', isActive: true });
        }
    }, [department]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onSubmit(form);
        if (success) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={department === 'new' ? 'Thêm khoa / đơn vị mới' : 'Cập nhật khoa'}
            description="Thiết lập mã định danh, tên và email đầu mối liên hệ cho khoa."
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <Input
                    label="Mã khoa"
                    placeholder="Ví dụ: CICT"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                />
                <Input
                    label="Tên khoa / đơn vị đào tạo"
                    placeholder="Ví dụ: Trường Công nghệ Thông tin và Truyền thông"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
                <Input
                    label="Email liên hệ chính thức"
                    type="email"
                    placeholder="cict@ctu.edu.vn"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    required
                />
                <div className="pt-1">
                    <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <span>Đang hoạt động trong kỳ này</span>
                    </label>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Lưu khoa
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

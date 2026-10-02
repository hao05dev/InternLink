'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Department, AcademicProgram } from '../../types/organization.types';

interface ProgramFormModalProps {
    isOpen: boolean;
    program: AcademicProgram | null | 'new';
    defaultDepartmentId?: string;
    departments: Department[];
    onClose: () => void;
    onSubmit: (form: {
        departmentId: string;
        code: string;
        name: string;
        degreeLevel: string;
        track: string;
        isActive: boolean;
    }) => Promise<boolean>;
    isLoading: boolean;
}

export function ProgramFormModal({
    isOpen,
    program,
    defaultDepartmentId,
    departments,
    onClose,
    onSubmit,
    isLoading,
}: ProgramFormModalProps) {
    const [form, setForm] = useState({
        departmentId: '',
        code: '',
        name: '',
        degreeLevel: 'UNDERGRADUATE',
        track: 'REGULAR',
        isActive: true,
    });

    useEffect(() => {
        if (program && program !== 'new') {
            setForm({
                departmentId: program.departmentId ?? defaultDepartmentId ?? departments[0]?.id ?? '',
                code: program.code,
                name: program.name,
                degreeLevel: program.degreeLevel ?? 'UNDERGRADUATE',
                track: program.track ?? 'REGULAR',
                isActive: program.isActive ?? true,
            });
        } else {
            setForm({
                departmentId: defaultDepartmentId ?? departments[0]?.id ?? '',
                code: '',
                name: '',
                degreeLevel: 'UNDERGRADUATE',
                track: 'REGULAR',
                isActive: true,
            });
        }
    }, [program, defaultDepartmentId, departments]);

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
            title={program === 'new' ? 'Thêm ngành đào tạo' : 'Cập nhật ngành đào tạo'}
            description="Khai báo thông tin ngành đào tạo trực thuộc khoa quản lý."
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <Select
                    label="Khoa quản lý"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    options={departments.map((department) => ({
                        value: department.id,
                        label: `${department.name} (${department.code})`,
                    }))}
                    required
                />
                <Input
                    label="Mã ngành"
                    placeholder="Ví dụ: 7480201 hoặc SE"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                />
                <Input
                    label="Tên ngành đào tạo"
                    placeholder="Ví dụ: Công nghệ thông tin"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <Select
                        label="Hệ đào tạo"
                        value={form.track}
                        onChange={(e) => setForm({ ...form, track: e.target.value })}
                        options={[
                            { value: 'REGULAR', label: 'Đại trà (Chính quy)' },
                            { value: 'CTCLC', label: 'Chất lượng cao' },
                        ]}
                        required
                    />
                    <Select
                        label="Trình độ"
                        value={form.degreeLevel}
                        onChange={(e) => setForm({ ...form, degreeLevel: e.target.value })}
                        options={[
                            { value: 'UNDERGRADUATE', label: 'Đại học' },
                            { value: 'POSTGRADUATE', label: 'Sau đại học' },
                        ]}
                        required
                    />
                </div>

                <div className="pt-1">
                    <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <span>Đang tuyển sinh & mở thực tập</span>
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
                        {program === 'new' ? 'Tạo ngành mới' : 'Cập nhật ngành'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
    BookOpen,
    GraduationCap,
    Plus,
    Building,
    CheckCircle2
} from 'lucide-react';
import type { AcademicProgram } from '@/types/portal';

interface DepartmentItem {
    id: string;
    name: string;
    code: string;
    programs: AcademicProgram[];
}

const SAMPLE_DEPARTMENTS: DepartmentItem[] = [
    {
        id: 'dept-1',
        name: 'Khoa Kỹ thuật Phần mềm',
        code: 'KTPM',
        programs: [
            { id: 'prog-1', name: 'Kỹ thuật phần mềm', code: '7480103' },
        ],
    },
    {
        id: 'dept-2',
        name: 'Khoa Khoa học Máy tính',
        code: 'KHMT',
        programs: [
            { id: 'prog-2', name: 'Khoa học máy tính', code: '7480101' },
            { id: 'prog-3', name: 'Trí tuệ nhân tạo', code: '7480107' },
        ],
    },
    {
        id: 'dept-3',
        name: 'Khoa Hệ thống Thông tin',
        code: 'HTTT',
        programs: [
            { id: 'prog-4', name: 'Hệ thống thông tin', code: '7480104' },
            { id: 'prog-5', name: 'Thương mại điện tử', code: '7340122' },
        ],
    },
    {
        id: 'dept-4',
        name: 'Khoa Truyền thông & Mạng máy tính',
        code: 'MMT',
        programs: [
            { id: 'prog-6', name: 'Mạng máy tính và truyền thông dữ liệu', code: '7480102' },
            { id: 'prog-7', name: 'An toàn thông tin', code: '7480202' },
        ],
    },
    {
        id: 'dept-5',
        name: 'Khoa Công nghệ Thông tin',
        code: 'CNTT',
        programs: [
            { id: 'prog-8', name: 'Công nghệ thông tin', code: '7480201' },
        ],
    },
];

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState<DepartmentItem[]>(SAMPLE_DEPARTMENTS);
    const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
    const [selectedDeptId, setSelectedDeptId] = useState(SAMPLE_DEPARTMENTS[0].id);
    const [progName, setProgName] = useState('');
    const [progCode, setProgCode] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleAddProgram = (e: React.FormEvent) => {
        e.preventDefault();
        const newProg: AcademicProgram = {
            id: `prog-${Date.now()}`,
            name: progName,
            code: progCode,
        };

        setDepartments(prev =>
            prev.map(d =>
                d.id === selectedDeptId
                    ? { ...d, programs: [...d.programs, newProg] }
                    : d
            )
        );

        setMessage({ type: 'success', text: `Thêm ngành đào tạo "${newProg.name}" thành công!` });
        setIsAddProgramModalOpen(false);
        setProgName('');
        setProgCode('');
    };

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Cơ Cấu Khoa & Ngành Đào Tạo (CICT)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản trị danh mục các khoa chuyên môn và ngành đào tạo thuộc Trường Công nghệ Thông tin & Truyền thông - ĐH Cần Thơ.
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsAddProgramModalOpen(true)}
                    className="gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm ngành đào tạo mới</span>
                </Button>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Đóng thông báo"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Departments Grid */}
            <div className="space-y-4">
                {departments.map((dept) => (
                    <Card key={dept.id}>
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                                        {dept.code}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base text-slate-900">{dept.name}</CardTitle>
                                        <CardDescription>Mã đơn vị: {dept.code}</CardDescription>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500 font-medium">
                                    {dept.programs.length} ngành đào tạo
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Các ngành đào tạo trực thuộc:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {dept.programs.map((prog) => (
                                    <div
                                        key={prog.id}
                                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-slate-800">{prog.name}</span>
                                        </div>
                                        <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            Mã ngành: {prog.code}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Program Modal */}
            <Modal
                isOpen={isAddProgramModalOpen}
                onClose={() => setIsAddProgramModalOpen(false)}
                title="Thêm ngành đào tạo mới"
                maxWidth="md"
            >
                <form onSubmit={handleAddProgram} className="space-y-4">
                    <Input
                        label="Tên ngành đào tạo"
                        id="progName"
                        value={progName}
                        onChange={(e) => setProgName(e.target.value)}
                        placeholder="VD: Kỹ thuật phần mềm"
                        required
                    />

                    <Input
                        label="Mã ngành đào tạo (Bộ GD&ĐT)"
                        id="progCode"
                        value={progCode}
                        onChange={(e) => setProgCode(e.target.value)}
                        placeholder="VD: 7480103"
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsAddProgramModalOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Lưu ngành đào tạo</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

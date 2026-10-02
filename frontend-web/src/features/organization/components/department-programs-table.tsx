'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { AcademicProgram } from '../types/organization.types';

interface DepartmentProgramsTableProps {
    programs: AcademicProgram[];
    onEditProgram: (program: AcademicProgram) => void;
    onDeleteProgram: (program: AcademicProgram) => void;
}

export function DepartmentProgramsTable({
    programs,
    onEditProgram,
    onDeleteProgram,
}: DepartmentProgramsTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-2xs">
            <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                    <tr>
                        <th className="py-2.5 px-4">Mã ngành</th>
                        <th className="py-2.5 px-4">Tên ngành đào tạo</th>
                        <th className="py-2.5 px-4">Hệ đào tạo</th>
                        <th className="py-2.5 px-4">Trình độ</th>
                        <th className="py-2.5 px-4">Trạng thái</th>
                        <th className="py-2.5 px-4 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {programs.map((program) => (
                        <tr
                            key={program.id}
                            className="hover:bg-slate-50/70 transition-colors"
                        >
                            <td className="py-3 px-4">
                                <Badge
                                    variant="outline"
                                    className="font-mono text-xs font-semibold bg-white text-slate-800 border-slate-200"
                                >
                                    {program.code}
                                </Badge>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                                {program.name}
                            </td>
                            <td className="py-3 px-4">
                                <Badge
                                    variant={
                                        program.track === 'CTCLC'
                                            ? 'warning'
                                            : 'primary'
                                    }
                                    className="text-[11px]"
                                >
                                    {program.track === 'CTCLC'
                                        ? 'Chất lượng cao'
                                        : 'Đại trà (Chính quy)'}
                                </Badge>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                                {program.degreeLevel === 'POSTGRADUATE'
                                    ? 'Sau đại học'
                                    : 'Đại học'}
                            </td>
                            <td className="py-3 px-4">
                                <Badge
                                    variant={
                                        program.isActive !== false
                                            ? 'success'
                                            : 'secondary'
                                    }
                                    className="text-[11px]"
                                >
                                    {program.isActive !== false
                                        ? 'Đang hoạt động'
                                        : 'Ngừng hoạt động'}
                                </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEditProgram(program)}
                                        className="h-7 px-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-medium"
                                        title="Chỉnh sửa ngành"
                                    >
                                        <Pencil className="w-3.5 h-3.5 mr-1" />
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteProgram(program)}
                                        className="h-7 px-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium"
                                        title="Xóa ngành"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                                        Xóa
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

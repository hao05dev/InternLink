'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Plus, Pencil, GraduationCap, BookOpen } from 'lucide-react';
import { Department, AcademicProgram } from '../types/organization.types';
import { DepartmentProgramsTable } from './department-programs-table';

interface DepartmentCardProps {
    department: Department;
    programs: AcademicProgram[];
    onEditDepartment: (dept: Department) => void;
    onAddProgram: (deptId: string) => void;
    onEditProgram: (program: AcademicProgram) => void;
    onDeleteProgram: (program: AcademicProgram) => void;
}

export function DepartmentCard({
    department,
    programs,
    onEditDepartment,
    onAddProgram,
    onEditProgram,
    onDeleteProgram,
}: DepartmentCardProps) {
    const deptPrograms = programs.filter((p) => p.departmentId === department.id);

    return (
        <Card className="border border-slate-200/90 shadow-xs rounded-2xl overflow-hidden bg-white transition hover:border-slate-300">
            {/* Department Info Header */}
            <CardHeader className="bg-slate-50/60 border-b border-slate-100/80 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900">
                                {department.name}
                            </CardTitle>
                            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                                {department.code}
                            </Badge>
                            <Badge
                                variant={department.isActive ? 'success' : 'secondary'}
                                className="text-[11px]"
                            >
                                {department.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pl-11">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{department.contactEmail}</span>
                        </div>
                    </div>

                    {/* Action Buttons for Department */}
                    <div className="flex items-center gap-2 self-start md:self-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddProgram(department.id)}
                            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm ngành cho khoa</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditDepartment(department)}
                            className="flex items-center gap-1.5 text-xs text-slate-700"
                        >
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                            <span>Sửa khoa</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* Majors / Academic Programs List */}
            <CardContent className="p-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            <span>Danh sách ngành đào tạo ({deptPrograms.length})</span>
                        </div>
                    </div>

                    {deptPrograms.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600">
                                Khoa này chưa có ngành đào tạo nào
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 mb-3">
                                Bắt đầu thêm ngành đào tạo để phục vụ công tác tuyển sinh và thực tập.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddProgram(department.id)}
                                className="text-xs inline-flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Thêm ngành ngay</span>
                            </Button>
                        </div>
                    ) : (
                        <DepartmentProgramsTable
                            programs={deptPrograms}
                            onEditProgram={onEditProgram}
                            onDeleteProgram={onDeleteProgram}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

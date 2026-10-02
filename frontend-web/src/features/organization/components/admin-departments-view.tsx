'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Building2,
    Plus,
    CheckCircle2,
    AlertCircle,
    X,
} from 'lucide-react';
import { Department, AcademicProgram } from '../types/organization.types';
import { useDepartmentsData } from '../hooks/use-departments-data';
import { DepartmentCard } from './department-card';
import { DepartmentFormModal } from './modals/department-form-modal';
import { ProgramFormModal } from './modals/program-form-modal';
import { DeleteProgramModal } from './modals/delete-program-modal';

export default function AdminDepartmentsView() {
    const {
        departments,
        programs,
        busy,
        feedback,
        setFeedback,
        saveDepartment,
        saveProgram,
        deleteProgram,
    } = useDepartmentsData();

    // Modal state
    const [editingDepartment, setEditingDepartment] = useState<Department | null | 'new'>(null);
    const [editingProgram, setEditingProgram] = useState<AcademicProgram | null | 'new'>(null);
    const [defaultDeptIdForProgram, setDefaultDeptIdForProgram] = useState<string | undefined>(undefined);
    const [deletingProgram, setDeletingProgram] = useState<AcademicProgram | null>(null);

    const handleOpenProgramModal = (program?: AcademicProgram, defaultDeptId?: string) => {
        setDefaultDeptIdForProgram(defaultDeptId);
        setEditingProgram(program ?? 'new');
    };

    return (
        <div className="max-w-6xl space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Khoa và ngành đào tạo</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản lý cơ cấu khoa/đơn vị và danh mục các ngành đào tạo trong hệ thống.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenProgramModal()}
                        disabled={!departments.length}
                        className="flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4 text-slate-600" />
                        <span>Thêm ngành</span>
                    </Button>
                    <Button
                        onClick={() => setEditingDepartment('new')}
                        className="flex items-center gap-1.5 shadow-xs"
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Thêm khoa</span>
                    </Button>
                </div>
            </div>

            {/* Notification / Feedback Banner */}
            {feedback && (
                <div
                    role="alert"
                    className={`flex items-start justify-between gap-3 rounded-xl p-4 text-sm border shadow-xs animate-in fade-in duration-150 ${
                        feedback.type === 'success'
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50/80 border-rose-200 text-rose-800'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {feedback.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                        <span className="font-medium">{feedback.message}</span>
                    </div>
                    <button
                        onClick={() => setFeedback(null)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition cursor-pointer"
                        title="Đóng thông báo"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Department List */}
            <div className="space-y-6">
                {departments.map((department) => (
                    <DepartmentCard
                        key={department.id}
                        department={department}
                        programs={programs}
                        onEditDepartment={(dept) => setEditingDepartment(dept)}
                        onAddProgram={(deptId) => handleOpenProgramModal(undefined, deptId)}
                        onEditProgram={(prog) => handleOpenProgramModal(prog)}
                        onDeleteProgram={(prog) => setDeletingProgram(prog)}
                    />
                ))}

                {!departments.length && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-xs">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-slate-800">Chưa có khoa trong cơ sở dữ liệu</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            Vui lòng khởi tạo khoa/đơn vị đầu tiên để quản lý các ngành đào tạo.
                        </p>
                        <Button onClick={() => setEditingDepartment('new')} className="inline-flex items-center gap-1.5">
                            <Plus className="w-4 h-4" />
                            <span>Thêm khoa mới</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <DepartmentFormModal
                isOpen={editingDepartment !== null}
                department={editingDepartment}
                onClose={() => setEditingDepartment(null)}
                onSubmit={(form) => saveDepartment(editingDepartment, form)}
                isLoading={busy}
            />

            <ProgramFormModal
                isOpen={editingProgram !== null}
                program={editingProgram}
                defaultDepartmentId={defaultDeptIdForProgram}
                departments={departments}
                onClose={() => setEditingProgram(null)}
                onSubmit={(form) => saveProgram(editingProgram, form)}
                isLoading={busy}
            />

            <DeleteProgramModal
                isOpen={deletingProgram !== null}
                program={deletingProgram}
                onClose={() => setDeletingProgram(null)}
                onConfirm={async () => {
                    if (deletingProgram) {
                        const success = await deleteProgram(deletingProgram);
                        if (success) setDeletingProgram(null);
                    }
                }}
                isLoading={busy}
            />
        </div>
    );
}

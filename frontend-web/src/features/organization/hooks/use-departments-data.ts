'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Department, AcademicProgram } from '../types/organization.types';

export function useDepartmentsData() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [programs, setPrograms] = useState<AcademicProgram[]>([]);
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const reload = useCallback(async () => {
        try {
            const [departmentResult, programResult] = await Promise.all([
                apiClient.get<Department[]>('/api/v1/departments'),
                apiClient.get<AcademicProgram[]>('/api/v1/academic-programs'),
            ]);
            setDepartments(departmentResult.data ?? []);
            setPrograms(programResult.data ?? []);
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Không tải được danh mục khoa và ngành.',
            });
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    const saveDepartment = async (
        editingDepartment: Department | null | 'new',
        form: { code: string; name: string; contactEmail: string; isActive: boolean }
    ): Promise<boolean> => {
        setBusy(true);
        try {
            if (editingDepartment && editingDepartment !== 'new') {
                await apiClient.put(`/api/v1/departments/${editingDepartment.id}`, form);
                setFeedback({ type: 'success', message: `Đã cập nhật thông tin khoa "${form.name}".` });
            } else {
                await apiClient.post('/api/v1/departments', form);
                setFeedback({ type: 'success', message: `Đã thêm khoa mới "${form.name}".` });
            }
            await reload();
            return true;
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Không lưu được khoa.',
            });
            return false;
        } finally {
            setBusy(false);
        }
    };

    const saveProgram = async (
        editingProgram: AcademicProgram | null | 'new',
        form: { departmentId: string; code: string; name: string; degreeLevel: string; track: string; isActive: boolean }
    ): Promise<boolean> => {
        setBusy(true);
        try {
            if (editingProgram && editingProgram !== 'new') {
                await apiClient.put(`/api/v1/academic-programs/${editingProgram.id}`, form);
                setFeedback({ type: 'success', message: `Đã cập nhật ngành đào tạo "${form.name}".` });
            } else {
                await apiClient.post('/api/v1/academic-programs', form);
                setFeedback({ type: 'success', message: `Đã thêm ngành đào tạo "${form.name}".` });
            }
            await reload();
            return true;
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Không lưu được ngành đào tạo.',
            });
            return false;
        } finally {
            setBusy(false);
        }
    };

    const deleteProgram = async (program: AcademicProgram): Promise<boolean> => {
        setBusy(true);
        try {
            await apiClient.delete(`/api/v1/academic-programs/${program.id}`);
            setFeedback({
                type: 'success',
                message: `Đã xóa ngành đào tạo "${program.name}" (${program.code}).`,
            });
            await reload();
            return true;
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Không thể xóa ngành đào tạo này.',
            });
            return false;
        } finally {
            setBusy(false);
        }
    };

    return {
        departments,
        programs,
        busy,
        feedback,
        setFeedback,
        reload,
        saveDepartment,
        saveProgram,
        deleteProgram,
    };
}

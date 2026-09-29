'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Building2,
    GraduationCap,
    Plus,
    Pencil,
    Trash2,
    Mail,
    CheckCircle2,
    AlertCircle,
    X,
    Layers,
    BookOpen
} from 'lucide-react';
import { Department, AcademicProgram } from '../types/organization.types';

export default function AdminDepartmentsView() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [programs, setPrograms] = useState<AcademicProgram[]>([]);
    const [editingDepartment, setEditingDepartment] = useState<Department | null | 'new'>(null);
    const [departmentForm, setDepartmentForm] = useState({
        code: '',
        name: '',
        contactEmail: '',
        isActive: true,
    });

    const [editingProgram, setEditingProgram] = useState<AcademicProgram | null | 'new'>(null);
    const [programForm, setProgramForm] = useState({
        departmentId: '',
        code: '',
        name: '',
        degreeLevel: 'UNDERGRADUATE',
        track: 'REGULAR',
        isActive: true,
    });

    const [deletingProgram, setDeletingProgram] = useState<AcademicProgram | null>(null);

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

    // --- Department Actions ---
    const openDepartmentModal = (department?: Department) => {
        setEditingDepartment(department ?? 'new');
        setDepartmentForm(
            department
                ? {
                      code: department.code,
                      name: department.name,
                      contactEmail: department.contactEmail,
                      isActive: department.isActive,
                  }
                : { code: '', name: '', contactEmail: '', isActive: true }
        );
    };

    const saveDepartment = async (event: React.FormEvent) => {
        event.preventDefault();
        setBusy(true);
        try {
            if (editingDepartment && editingDepartment !== 'new') {
                await apiClient.put(`/api/v1/departments/${editingDepartment.id}`, departmentForm);
                setFeedback({ type: 'success', message: `Đã cập nhật thông tin khoa "${departmentForm.name}".` });
            } else {
                await apiClient.post('/api/v1/departments', departmentForm);
                setFeedback({ type: 'success', message: `Đã thêm khoa mới "${departmentForm.name}".` });
            }
            setEditingDepartment(null);
            await reload();
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Không lưu được khoa.',
            });
        } finally {
            setBusy(false);
        }
    };

    // --- Program Actions ---
    const openProgramModal = (program?: AcademicProgram, defaultDepartmentId?: string) => {
        setEditingProgram(program ?? 'new');
        if (program) {
            setProgramForm({
                departmentId: program.departmentId ?? defaultDepartmentId ?? departments[0]?.id ?? '',
                code: program.code,
                name: program.name,
                degreeLevel: program.degreeLevel ?? 'UNDERGRADUATE',
                track: program.track ?? 'REGULAR',
                isActive: program.isActive ?? true,
            });
        } else {
            setProgramForm({
                departmentId: defaultDepartmentId ?? departments[0]?.id ?? '',
                code: '',
                name: '',
                degreeLevel: 'UNDERGRADUATE',
                track: 'REGULAR',
                isActive: true,
            });
        }
    };

    const saveProgram = async (event: React.FormEvent) => {
        event.preventDefault();
        setBusy(true);
        try {
            if (editingProgram && editingProgram !== 'new') {
                await apiClient.put(`/api/v1/academic-programs/${editingProgram.id}`, programForm);
                setFeedback({ type: 'success', message: `Đã cập nhật ngành đào tạo "${programForm.name}".` });
            } else {
                await apiClient.post('/api/v1/academic-programs', programForm);
                setFeedback({ type: 'success', message: `Đã thêm ngành đào tạo "${programForm.name}".` });
            }
            setEditingProgram(null);
            await reload();
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Không lưu được ngành đào tạo.',
            });
        } finally {
            setBusy(false);
        }
    };

    const confirmDeleteProgram = async () => {
        if (!deletingProgram) return;
        setBusy(true);
        try {
            await apiClient.delete(`/api/v1/academic-programs/${deletingProgram.id}`);
            setFeedback({
                type: 'success',
                message: `Đã xóa ngành đào tạo "${deletingProgram.name}" (${deletingProgram.code}).`,
            });
            setDeletingProgram(null);
            await reload();
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Không thể xóa ngành đào tạo này.',
            });
        } finally {
            setBusy(false);
        }
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
                        onClick={() => openProgramModal()}
                        disabled={!departments.length}
                        className="flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4 text-slate-600" />
                        <span>Thêm ngành</span>
                    </Button>
                    <Button
                        onClick={() => openDepartmentModal()}
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
                {departments.map((department) => {
                    const deptPrograms = programs.filter((p) => p.departmentId === department.id);

                    return (
                        <Card
                            key={department.id}
                            className="border border-slate-200/90 shadow-xs rounded-2xl overflow-hidden bg-white transition hover:border-slate-300"
                        >
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
                                            onClick={() => openProgramModal(undefined, department.id)}
                                            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Thêm ngành cho khoa</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openDepartmentModal(department)}
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
                                                onClick={() => openProgramModal(undefined, department.id)}
                                                className="text-xs inline-flex items-center gap-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Thêm ngành ngay</span>
                                            </Button>
                                        </div>
                                    ) : (
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
                                                    {deptPrograms.map((program) => (
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
                                                                        onClick={() => openProgramModal(program)}
                                                                        className="h-7 px-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-medium"
                                                                        title="Chỉnh sửa ngành"
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5 mr-1" />
                                                                        Sửa
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setDeletingProgram(program)}
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
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {!departments.length && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-xs">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-slate-800">Chưa có khoa trong cơ sở dữ liệu</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-4">
                            Vui lòng khởi tạo khoa/đơn vị đầu tiên để quản lý các ngành đào tạo.
                        </p>
                        <Button onClick={() => openDepartmentModal()} className="inline-flex items-center gap-1.5">
                            <Plus className="w-4 h-4" />
                            <span>Thêm khoa mới</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal: Thêm / Sửa Khoa */}
            <Modal
                isOpen={editingDepartment !== null}
                onClose={() => setEditingDepartment(null)}
                title={editingDepartment === 'new' ? 'Thêm khoa / đơn vị mới' : 'Cập nhật khoa'}
                description="Thiết lập mã định danh, tên và email đầu mối liên hệ cho khoa."
                maxWidth="md"
            >
                <form onSubmit={saveDepartment} className="space-y-4 pt-2">
                    <Input
                        label="Mã khoa"
                        placeholder="Ví dụ: CICT"
                        value={departmentForm.code}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, code: e.target.value })}
                        required
                    />
                    <Input
                        label="Tên khoa / đơn vị đào tạo"
                        placeholder="Ví dụ: Trường Công nghệ Thông tin và Truyền thông"
                        value={departmentForm.name}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email liên hệ chính thức"
                        type="email"
                        placeholder="cict@ctu.edu.vn"
                        value={departmentForm.contactEmail}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, contactEmail: e.target.value })}
                        required
                    />
                    <div className="pt-1">
                        <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                checked={departmentForm.isActive}
                                onChange={(e) => setDepartmentForm({ ...departmentForm, isActive: e.target.checked })}
                            />
                            <span>Đang hoạt động trong kỳ này</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingDepartment(null)}
                            disabled={busy}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={busy}>
                            Lưu khoa
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Thêm / Sửa Ngành đào tạo */}
            <Modal
                isOpen={editingProgram !== null}
                onClose={() => setEditingProgram(null)}
                title={editingProgram === 'new' ? 'Thêm ngành đào tạo' : 'Cập nhật ngành đào tạo'}
                description="Khai báo thông tin ngành đào tạo trực thuộc khoa quản lý."
                maxWidth="md"
            >
                <form onSubmit={saveProgram} className="space-y-4 pt-2">
                    <Select
                        label="Khoa quản lý"
                        value={programForm.departmentId}
                        onChange={(e) => setProgramForm({ ...programForm, departmentId: e.target.value })}
                        options={departments.map((department) => ({
                            value: department.id,
                            label: `${department.name} (${department.code})`,
                        }))}
                        required
                    />
                    <Input
                        label="Mã ngành"
                        placeholder="Ví dụ: 7480201 hoặc SE"
                        value={programForm.code}
                        onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })}
                        required
                    />
                    <Input
                        label="Tên ngành đào tạo"
                        placeholder="Ví dụ: Công nghệ thông tin"
                        value={programForm.name}
                        onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Select
                            label="Hệ đào tạo"
                            value={programForm.track}
                            onChange={(e) => setProgramForm({ ...programForm, track: e.target.value })}
                            options={[
                                { value: 'REGULAR', label: 'Đại trà (Chính quy)' },
                                { value: 'CTCLC', label: 'Chất lượng cao' },
                            ]}
                            required
                        />
                        <Select
                            label="Trình độ"
                            value={programForm.degreeLevel}
                            onChange={(e) => setProgramForm({ ...programForm, degreeLevel: e.target.value })}
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
                                checked={programForm.isActive}
                                onChange={(e) => setProgramForm({ ...programForm, isActive: e.target.checked })}
                            />
                            <span>Đang tuyển sinh & mở thực tập</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingProgram(null)}
                            disabled={busy}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={busy}>
                            {editingProgram === 'new' ? 'Tạo ngành mới' : 'Cập nhật ngành'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Xác nhận Xóa Ngành đào tạo */}
            <Modal
                isOpen={deletingProgram !== null}
                onClose={() => setDeletingProgram(null)}
                title="Xác nhận xóa ngành đào tạo"
                description="Hành động này không thể hoàn tác nếu ngành đã bị xóa khỏi hệ thống."
                maxWidth="sm"
            >
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-slate-700">
                        Bạn có chắc chắn muốn xóa ngành{' '}
                        <strong className="text-slate-900 font-semibold">{deletingProgram?.name}</strong> (Mã:{' '}
                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                            {deletingProgram?.code}
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
                            onClick={() => setDeletingProgram(null)}
                            disabled={busy}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={confirmDeleteProgram}
                            isLoading={busy}
                        >
                            Xác nhận xóa
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

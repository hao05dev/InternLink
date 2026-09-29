'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/features/auth/types/auth.types';
import { User, UserPlus, Search, Edit3, Lock, Unlock, Mail, Shield } from 'lucide-react';

interface ManagedUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    departmentId?: string;
    companyId?: string;
}

interface Organization {
    id: string;
    name?: string;
    companyName?: string;
}

interface Form {
    email: string;
    fullName: string;
    role: UserRole;
    temporaryPassword: string;
    departmentId: string;
    companyId: string;
    isActive: boolean;
}

const emptyForm: Form = {
    email: '',
    fullName: '',
    role: 'STUDENT',
    temporaryPassword: '',
    departmentId: '',
    companyId: '',
    isActive: true,
};

const ROLE_CONFIG: Record<UserRole, { label: string; variant: 'brand' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' }> = {
    ADMIN: { label: 'Quản trị viên', variant: 'warning' },
    FACULTY_ADMIN: { label: 'Ban Quản lý Khoa', variant: 'primary' },
    LECTURER: { label: 'Giảng viên', variant: 'secondary' },
    STUDENT: { label: 'Sinh viên', variant: 'brand' },
    COMPANY_REP: { label: 'Đại diện Doanh nghiệp', variant: 'warning' },
    COMPANY_MENTOR: { label: 'Mentor Doanh nghiệp', variant: 'success' },
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'STUDENT', label: 'Sinh viên' },
    { value: 'LECTURER', label: 'Giảng viên hướng dẫn' },
    { value: 'FACULTY_ADMIN', label: 'Ban Quản lý Khoa' },
    { value: 'COMPANY_REP', label: 'Đại diện Doanh nghiệp' },
    { value: 'COMPANY_MENTOR', label: 'Mentor Doanh nghiệp' },
    { value: 'ADMIN', label: 'Quản trị viên' },
];

export default function AdminUsersView() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [departments, setDepartments] = useState<Organization[]>([]);
    const [companies, setCompanies] = useState<Organization[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Form>(emptyForm);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    const reload = useCallback(async () => {
        try {
            const [userResult, departmentResult, companyResult] = await Promise.all([
                apiClient.get<ManagedUser[]>('/api/v1/admin/users'),
                apiClient.get<Organization[]>('/api/v1/departments'),
                apiClient.get<Organization[]>('/api/v1/companies'),
            ]);
            setUsers(userResult.data ?? []);
            setDepartments(departmentResult.data ?? []);
            setCompanies(companyResult.data ?? []);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Không tải được danh sách người dùng.');
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    const openCreate = () => {
        setEditingId('new');
        setForm({ ...emptyForm, departmentId: departments[0]?.id ?? '' });
    };

    const openEdit = (user: ManagedUser) => {
        setEditingId(user.id);
        setForm({
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            temporaryPassword: '',
            departmentId: user.departmentId ?? departments[0]?.id ?? '',
            companyId: user.companyId ?? companies[0]?.id ?? '',
            isActive: user.isActive,
        });
    };

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        setBusy(true);
        try {
            if (editingId === 'new') {
                await apiClient.post('/api/v1/admin/users', form);
            } else if (editingId) {
                await apiClient.put(`/api/v1/admin/users/${editingId}`, {
                    fullName: form.fullName,
                    role: form.role,
                    isActive: form.isActive,
                    departmentId: form.departmentId || null,
                    companyId: form.companyId || null,
                });
            }
            setEditingId(null);
            setMessage('Đã lưu thông tin tài khoản thành công.');
            await reload();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Không lưu được tài khoản.');
        } finally {
            setBusy(false);
        }
    };

    const toggle = async (user: ManagedUser) => {
        if (user.id === currentUser?.id) {
            setMessage('Không thể tự khóa tài khoản của chính mình.');
            return;
        }
        try {
            await apiClient.put(`/api/v1/admin/users/${user.id}`, {
                fullName: user.fullName,
                role: user.role,
                isActive: !user.isActive,
                departmentId: user.departmentId ?? null,
                companyId: user.companyId ?? null,
            });
            setMessage('Đã cập nhật trạng thái tài khoản.');
            await reload();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Không cập nhật được tài khoản.');
        }
    };

    const filtered = users.filter((user) => {
        const query = search.toLowerCase();
        const roleLabel = (ROLE_CONFIG[user.role]?.label || user.role).toLowerCase();
        return (
            user.fullName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query) ||
            roleLabel.includes(query)
        );
    });

    const needsDepartment = ['FACULTY_ADMIN', 'LECTURER', 'STUDENT'].includes(form.role);
    const needsCompany = ['COMPANY_REP', 'COMPANY_MENTOR'].includes(form.role);

    return (
        <div className="max-w-6xl space-y-6">
            {/* Professional Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Quản lý người dùng
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Danh sách tài khoản, phân quyền vai trò và trạng thái hoạt động trong hệ thống.
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2 cursor-pointer shrink-0">
                    <UserPlus className="w-4 h-4" />
                    <span>Tạo tài khoản mới</span>
                </Button>
            </div>

            {message && (
                <div role="alert" className="rounded-xl bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 text-sm flex items-center justify-between">
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} className="text-blue-500 hover:text-blue-700 text-xs font-semibold cursor-pointer">
                        Đóng
                    </button>
                </div>
            )}

            {/* Search filter input */}
            <div className="relative">
                <Input
                    placeholder="Tìm tên, email hoặc vai trò"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* User List Cards */}
            <div className="space-y-3">
                {filtered.map((user) => {
                    const roleInfo = ROLE_CONFIG[user.role] || { label: user.role, variant: 'secondary' as const };
                    return (
                        <Card key={user.id} className="hover:border-slate-300 transition shadow-2xs">
                            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">
                                <div className="flex items-center space-x-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-slate-900 text-sm">{user.fullName}</span>
                                            <Badge variant={roleInfo.variant} className="text-[11px] px-2 py-0.5">
                                                {roleInfo.label}
                                            </Badge>
                                            <Badge
                                                variant={user.isActive ? 'success' : 'destructive'}
                                                className="text-[11px] px-2 py-0.5"
                                            >
                                                {user.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEdit(user)}
                                        className="gap-1.5 cursor-pointer text-xs"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Sửa</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => void toggle(user)}
                                        disabled={user.id === currentUser?.id}
                                        className={`gap-1.5 cursor-pointer text-xs ${
                                            user.isActive
                                                ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                                                : 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                                        }`}
                                    >
                                        {user.isActive ? (
                                            <>
                                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Khóa</span>
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Mở khóa</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {!filtered.length && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600">Không tìm thấy người dùng phù hợp.</p>
                        <p className="text-xs text-slate-400 mt-1">Vui lòng thử tìm kiếm theo từ khóa khác.</p>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal Form */}
            {editingId && (
                <Card className="border-sky-200 shadow-md">
                    <CardContent className="p-6">
                        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2 border-b border-slate-100 pb-3">
                                <h2 className="text-base font-bold text-slate-900">
                                    {editingId === 'new' ? 'Tạo tài khoản người dùng mới' : 'Cập nhật thông tin tài khoản'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Điền thông tin tài khoản và phân công vai trò tương ứng.
                                </p>
                            </div>

                            <Input
                                label="Địa chỉ Email"
                                type="email"
                                value={form.email}
                                onChange={(event) => setForm({ ...form, email: event.target.value })}
                                disabled={editingId !== 'new'}
                                required
                            />

                            <Input
                                label="Họ và tên"
                                value={form.fullName}
                                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                                required
                            />

                            <Select
                                label="Vai trò người dùng"
                                value={form.role}
                                onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
                                options={ROLE_OPTIONS}
                            />

                            {needsDepartment && (
                                <Select
                                    label="Khoa / Đơn vị đào tạo"
                                    value={form.departmentId}
                                    onChange={(event) => setForm({ ...form, departmentId: event.target.value })}
                                    options={departments.map((department) => ({
                                        value: department.id,
                                        label: department.name ?? department.id,
                                    }))}
                                    required
                                />
                            )}

                            {needsCompany && (
                                <Select
                                    label="Doanh nghiệp tiếp nhận"
                                    value={form.companyId}
                                    onChange={(event) => setForm({ ...form, companyId: event.target.value })}
                                    options={companies.map((company) => ({
                                        value: company.id,
                                        label: company.companyName ?? company.id,
                                    }))}
                                    required
                                />
                            )}

                            {editingId === 'new' && (
                                <Input
                                    label="Mật khẩu tạm thời (tối thiểu 8 ký tự)"
                                    type="password"
                                    minLength={8}
                                    value={form.temporaryPassword}
                                    onChange={(event) => setForm({ ...form, temporaryPassword: event.target.value })}
                                    required
                                />
                            )}

                            {editingId !== 'new' && (
                                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="user-active-checkbox"
                                        checked={form.isActive}
                                        onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                                    />
                                    <label htmlFor="user-active-checkbox" className="text-sm font-medium text-slate-700 cursor-pointer">
                                        Kích hoạt tài khoản (Đang hoạt động)
                                    </label>
                                </div>
                            )}

                            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={() => setEditingId(null)} className="cursor-pointer">
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" isLoading={busy} className="cursor-pointer">
                                    Lưu tài khoản
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

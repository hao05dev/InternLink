'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import type { UserRole } from '@/features/auth/types/auth.types';
import { 
    User, 
    UserPlus, 
    Search, 
    Edit3, 
    Lock, 
    Unlock, 
    Mail, 
    Shield, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw,
    X
} from 'lucide-react';

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
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const reload = useCallback(async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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

    const toggleStatus = async (user: ManagedUser) => {
        setBusy(true);
        try {
            await apiClient.put(`/api/v1/admin/users/${user.id}`, {
                fullName: user.fullName,
                role: user.role,
                isActive: !user.isActive,
                departmentId: user.departmentId || null,
                companyId: user.companyId || null,
            });
            setMessage(`Đã ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản ${user.email}.`);
            await reload();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Không cập nhật được trạng thái tài khoản.');
        } finally {
            setBusy(false);
        }
    };

    // Filter users
    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return users.filter((u) => {
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            const matchesSearch =
                !query ||
                u.fullName.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                ROLE_CONFIG[u.role]?.label.toLowerCase().includes(query);
            return matchesRole && matchesSearch;
        });
    }, [users, search, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Quản Lý Người Dùng & Phân Quyền</h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Quản lý danh sách tài khoản, vai trò và trạng thái kích hoạt trên toàn hệ thống
                        </p>
                    </div>
                </div>

                <Button onClick={openCreate} className="gap-2 text-xs self-start sm:self-auto">
                    <UserPlus className="w-4 h-4" />
                    Tạo tài khoản mới
                </Button>
            </div>

            {/* Alert message */}
            {message && (
                <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between text-xs font-medium animate-in fade-in duration-150"
                >
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMessage('')}
                        className="text-slate-400 hover:text-slate-600 text-base leading-none"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Toolbar: Search + Role Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Tìm tên, email hoặc vai trò"
                        className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Vai trò:</span>
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                    >
                        <option value="ALL">Tất cả vai trò ({users.length})</option>
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-xs text-slate-500">Đang tải danh sách người dùng...</p>
                </div>
            ) : (
                <Card className="min-w-0 overflow-hidden border-slate-200/80 shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-4 py-3.5 w-12 text-center">STT</th>
                                    <th className="px-4 py-3.5">Họ và tên</th>
                                    <th className="px-4 py-3.5">Email tài khoản</th>
                                    <th className="px-4 py-3.5">Vai trò</th>
                                    <th className="px-4 py-3.5">Trực thuộc</th>
                                    <th className="px-4 py-3.5 text-center">Trạng thái</th>
                                    <th className="px-4 py-3.5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                                            Không tìm thấy người dùng nào phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((u, idx) => {
                                        const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                                        const dept = departments.find((d) => d.id === u.departmentId);
                                        const comp = companies.find((c) => c.id === u.companyId);
                                        const isSelf = currentUser?.id === u.id;

                                        return (
                                            <tr key={u.id} className="hover:bg-sky-50/40 transition-colors">
                                                <td className="px-4 py-3 text-center text-slate-400 font-medium">
                                                    {globalIdx}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {u.fullName}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                                                    {u.email}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={ROLE_CONFIG[u.role]?.variant ?? 'secondary'}
                                                        className="text-[10px]"
                                                    >
                                                        {ROLE_CONFIG[u.role]?.label ?? u.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {dept?.name || comp?.companyName || comp?.name || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {u.isActive ? (
                                                        <Badge variant="success" className="text-[10px]">
                                                            Hoạt động
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="text-[10px]">
                                                            Đã khóa
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEdit(u)}
                                                            className="text-xs h-7 px-2"
                                                        >
                                                            <Edit3 className="w-3 h-3 mr-1" />
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            variant={u.isActive ? 'danger' : 'secondary'}
                                                            size="sm"
                                                            disabled={isSelf || busy}
                                                            onClick={() => toggleStatus(u)}
                                                            className="text-xs h-7 px-2"
                                                        >
                                                            {u.isActive ? (
                                                                <>
                                                                    <Lock className="w-3 h-3 mr-1" />
                                                                    Khóa
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Unlock className="w-3 h-3 mr-1" />
                                                                    Mở
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Integrated Pagination */}
                    {filteredUsers.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-1">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredUsers.length}
                                pageSize={pageSize}
                                pageSizeOptions={[10, 25, 50, 100]}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(sz) => {
                                    setPageSize(sz);
                                    setCurrentPage(1);
                                }}
                                itemLabel="tài khoản"
                            />
                        </div>
                    )}
                </Card>
            )}

            {/* Modal Edit / Create */}
            {editingId && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <Card className="max-w-lg w-full shadow-2xl border-slate-200">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="font-bold text-sm text-slate-900">
                                    {editingId === 'new' ? 'Tạo tài khoản mới' : 'Chỉnh sửa tài khoản'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={save} className="space-y-3.5 text-xs">
                                <Input
                                    label="Email tài khoản"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    disabled={editingId !== 'new'}
                                    required
                                />
                                <Input
                                    label="Họ và tên"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    required
                                />
                                {editingId === 'new' && (
                                    <Input
                                        label="Mật khẩu tạm thời"
                                        type="password"
                                        value={form.temporaryPassword}
                                        onChange={(e) => setForm({ ...form, temporaryPassword: e.target.value })}
                                        required
                                    />
                                )}
                                <Select
                                    label="Vai trò (Role)"
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                                    options={ROLE_OPTIONS}
                                />

                                {(form.role === 'FACULTY_ADMIN' || form.role === 'LECTURER' || form.role === 'STUDENT') && (
                                    <Select
                                        label="Khoa / Bộ môn"
                                        value={form.departmentId}
                                        onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                                        options={[
                                            { value: '', label: '— Chưa chọn khoa —' },
                                            ...departments.map((d) => ({
                                                value: d.id,
                                                label: d.name || d.id,
                                            })),
                                        ]}
                                    />
                                )}

                                {(form.role === 'COMPANY_REP' || form.role === 'COMPANY_MENTOR') && (
                                    <Select
                                        label="Doanh nghiệp trực thuộc"
                                        value={form.companyId}
                                        onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                                        options={[
                                            { value: '', label: '— Chưa chọn doanh nghiệp —' },
                                            ...companies.map((c) => ({
                                                value: c.id,
                                                label: c.companyName || c.name || c.id,
                                            })),
                                        ]}
                                    />
                                )}

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingId(null)}
                                        className="text-xs"
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" isLoading={busy} className="text-xs">
                                        Lưu tài khoản
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

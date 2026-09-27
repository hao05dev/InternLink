'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
    Users,
    Search,
    Shield,
    CheckCircle2,
    XCircle,
    UserPlus,
    Lock,
    KeyRound,
    Building2,
    GraduationCap,
    School
} from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface ManagedUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
}

const SAMPLE_USERS: ManagedUser[] = [
    { id: 'u-01', email: 'admin@ctu.edu.vn', fullName: 'Quản Trị Viên Hệ Thống', role: 'ADMIN', isActive: true, createdAt: '2026-08-01' },
    { id: 'u-02', email: 'bql.cict@ctu.edu.vn', fullName: 'BQL Thực tập Khoa CNTT&TT', role: 'FACULTY_ADMIN', isActive: true, createdAt: '2026-08-01' },
    { id: 'u-03', email: 'nvhuong@ctu.edu.vn', fullName: 'TS. Nguyễn Văn Hướng', role: 'LECTURER', isActive: true, createdAt: '2026-08-05' },
    { id: 'u-04', email: 'contact@fpt.com', fullName: 'Đại diện FPT Software Cần Thơ', role: 'COMPANY_REP', isActive: true, createdAt: '2026-08-10' },
    { id: 'u-05', email: 'hoangtm@fpt-software.com', fullName: 'Trần Minh Hoàng', role: 'COMPANY_MENTOR', isActive: true, createdAt: '2026-08-12' },
    { id: 'u-06', email: 'nguyenvana@ctu.edu.vn', fullName: 'Nguyễn Văn A', role: 'STUDENT', isActive: true, createdAt: '2026-08-15' },
    { id: 'u-07', email: 'bichngoc@ctu.edu.vn', fullName: 'Trần Thị Bích Ngọc', role: 'STUDENT', isActive: true, createdAt: '2026-08-15' },
];

const ROLE_LABEL_MAP: Record<UserRole, { label: string; color: string }> = {
    ADMIN: { label: 'Quản Trị Viên', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    FACULTY_ADMIN: { label: 'BQL Khoa', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    LECTURER: { label: 'Giảng Viên', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    COMPANY_REP: { label: 'Doanh Nghiệp', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    COMPANY_MENTOR: { label: 'Mentor', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    STUDENT: { label: 'Sinh Viên', color: 'bg-sky-50 text-sky-700 border-sky-200' },
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<ManagedUser[]>(SAMPLE_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newFullName, setNewFullName] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('STUDENT');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const filtered = users.filter(u => {
        const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchRole && matchSearch;
    });

    const handleToggleActive = (userId: string) => {
        setUsers(prev =>
            prev.map(u => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
        );
        setMessage({ type: 'success', text: 'Cập nhật trạng thái kích hoạt tài khoản thành công.' });
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: ManagedUser = {
            id: `u-${Date.now()}`,
            email: newEmail,
            fullName: newFullName,
            role: newRole,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers([newUser, ...users]);
        setMessage({ type: 'success', text: `Tạo tài khoản người dùng "${newUser.email}" thành công!` });
        setIsCreateModalOpen(false);
        setNewEmail('');
        setNewFullName('');
    };

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Quản Lý Người Dùng & Phân Quyền (RBAC)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản trị tài khoản cho tất cả 6 vai trò trong hệ thống: Sinh viên, Doanh nghiệp, Mentor, Giảng viên, BQL Khoa và Admin.
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gap-2 self-start sm:self-auto"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Tạo người dùng mới</span>
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Tìm theo họ tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="w-full sm:w-60">
                    <Select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        options={[
                            { value: 'ALL', label: 'Tất cả vai trò' },
                            { value: 'STUDENT', label: 'Sinh viên' },
                            { value: 'COMPANY_REP', label: 'Đại diện Doanh nghiệp' },
                            { value: 'COMPANY_MENTOR', label: 'Cán bộ hướng dẫn (Mentor)' },
                            { value: 'LECTURER', label: 'Giảng viên hướng dẫn' },
                            { value: 'FACULTY_ADMIN', label: 'Ban Quản lý Khoa' },
                            { value: 'ADMIN', label: 'Quản trị viên hệ thống' },
                        ]}
                    />
                </div>
            </div>

            {/* Users Table Card */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Họ và tên</th>
                                <th className="px-6 py-4">Email đăng nhập</th>
                                <th className="px-6 py-4">Vai trò hệ thống</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Ngày tạo</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                            {filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{u.fullName}</td>
                                    <td className="px-6 py-4 text-slate-600 font-mono">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${ROLE_LABEL_MAP[u.role].color}`}>
                                            {ROLE_LABEL_MAP[u.role].label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {u.isActive ? (
                                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                                Đã khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-500">{u.createdAt}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant={u.isActive ? 'danger' : 'outline'}
                                            size="sm"
                                            onClick={() => handleToggleActive(u.id)}
                                            className="text-xs"
                                        >
                                            {u.isActive ? 'Khóa' : 'Kích hoạt'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Tạo tài khoản người dùng mới"
                maxWidth="md"
            >
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <Input
                        label="Họ và tên"
                        id="newFullName"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="VD: TS. Nguyễn Văn A"
                        required
                    />

                    <Input
                        label="Email đăng nhập"
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="VD: user@ctu.edu.vn"
                        required
                    />

                    <Select
                        label="Vai trò hệ thống"
                        id="newRole"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        options={[
                            { value: 'STUDENT', label: 'Sinh viên (STUDENT)' },
                            { value: 'COMPANY_REP', label: 'Đại diện Doanh nghiệp (COMPANY_REP)' },
                            { value: 'COMPANY_MENTOR', label: 'Cán bộ hướng dẫn (COMPANY_MENTOR)' },
                            { value: 'LECTURER', label: 'Giảng viên hướng dẫn (LECTURER)' },
                            { value: 'FACULTY_ADMIN', label: 'Ban Quản lý Khoa (FACULTY_ADMIN)' },
                            { value: 'ADMIN', label: 'Quản trị viên (ADMIN)' },
                        ]}
                    />

                    <p className="text-[11px] text-slate-500">
                        * Mật khẩu mặc định khởi tạo là <code>Password@123</code>. Người dùng sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Tạo tài khoản</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

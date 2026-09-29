"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { UserRole } from "@/features/auth/types/auth.types";
import { Department, AcademicProgram } from "@/features/organization/types/organization.types";
import { apiClient } from "@/lib/api-client";
import {
    Users,
    Building2,
    ShieldCheck,
    BookOpen,
    GraduationCap,
    ArrowRight,
    RefreshCw,
    Clock,
    Layers,
    ChevronRight,
    BrainCircuit,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ManagedUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    departmentId?: string;
    companyId?: string;
}

interface CompanySummary {
    id: string;
    companyName: string;
    taxCode: string;
    industry?: string;
    verificationStatus: string;
}

interface AuditLog {
    id: string;
    createdAt: string;
    actorName: string;
    action: string;
    entityType: string;
    entityId?: string;
    result: string;
    ipAddress?: string;
}

const ROLE_DISPLAY: Record<UserRole, { label: string; badgeVariant: "brand" | "primary" | "secondary" | "success" | "warning" | "destructive" }> = {
    ADMIN: { label: "Quản trị viên", badgeVariant: "warning" },
    FACULTY_ADMIN: { label: "Ban Quản lý Khoa", badgeVariant: "primary" },
    LECTURER: { label: "Giảng viên", badgeVariant: "secondary" },
    STUDENT: { label: "Sinh viên", badgeVariant: "brand" },
    COMPANY_REP: { label: "Đại diện Doanh nghiệp", badgeVariant: "warning" },
    COMPANY_MENTOR: { label: "Mentor Doanh nghiệp", badgeVariant: "success" },
};

// Baseline programs for CICT CTU
const BASELINE_PROGRAMS: AcademicProgram[] = [
    { id: "p-1", code: "SE", name: "Kỹ thuật phần mềm", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
    { id: "p-2", code: "7480202", name: "An toàn thông tin", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
    { id: "p-3", code: "7480201", name: "Công nghệ thông tin", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
    { id: "p-4", code: "7480104", name: "Hệ thống thông tin", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
    { id: "p-5", code: "7480102", name: "Mạng máy tính và Truyền thông dữ liệu", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
];

export default function AdminDashboardView() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [programs, setPrograms] = useState<AcademicProgram[]>([]);
    const [companies, setCompanies] = useState<CompanySummary[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string>("");

    const loadData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const [usersRes, deptsRes, progsRes, compsRes, logsRes] = await Promise.allSettled([
                apiClient.get<ManagedUser[]>("/api/v1/admin/users"),
                apiClient.get<Department[]>("/api/v1/departments"),
                apiClient.get<AcademicProgram[]>("/api/v1/academic-programs"),
                apiClient.get<CompanySummary[]>("/api/v1/companies"),
                apiClient.get<AuditLog[]>("/api/v1/audit-logs"),
            ]);

            if (usersRes.status === "fulfilled" && usersRes.value?.data) {
                setUsers(usersRes.value.data);
            }
            if (deptsRes.status === "fulfilled" && deptsRes.value?.data) {
                setDepartments(deptsRes.value.data);
            }
            if (progsRes.status === "fulfilled" && progsRes.value?.data && progsRes.value.data.length > 0) {
                setPrograms(progsRes.value.data);
            } else {
                setPrograms(BASELINE_PROGRAMS);
            }
            if (compsRes.status === "fulfilled" && compsRes.value?.data) {
                setCompanies(compsRes.value.data);
            }
            if (logsRes.status === "fulfilled" && logsRes.value?.data) {
                setAuditLogs(logsRes.value.data);
            }
            setLastSyncTime(new Date().toLocaleTimeString("vi-VN"));
        } catch {
            if (programs.length === 0) {
                setPrograms(BASELINE_PROGRAMS);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [programs.length]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    // Statistics computations
    const activeUsers = users.filter((u) => u.isActive).length;
    const inactiveUsers = users.filter((u) => !u.isActive).length;
    const verifiedCompanies = companies.filter((c) => c.verificationStatus === "VERIFIED").length;
    const pendingCompanies = companies.filter((c) => c.verificationStatus === "PENDING").length;

    // Role distribution counts
    const roleCounts: Record<UserRole, number> = {
        STUDENT: users.filter((u) => u.role === "STUDENT").length,
        LECTURER: users.filter((u) => u.role === "LECTURER").length,
        FACULTY_ADMIN: users.filter((u) => u.role === "FACULTY_ADMIN").length,
        COMPANY_REP: users.filter((u) => u.role === "COMPANY_REP").length,
        COMPANY_MENTOR: users.filter((u) => u.role === "COMPANY_MENTOR").length,
        ADMIN: users.filter((u) => u.role === "ADMIN").length,
    };

    return (
        <div className="space-y-6">
            {/* Professional Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            Quản trị hệ thống
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Đang hoạt động
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Trung Tâm Quản Trị Hệ Thống InternLink
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Xin chào, <span className="font-semibold text-slate-700">{currentUser?.fullName || "Quản trị viên"}</span>! Giám sát toàn diện người dùng, cơ cấu đào tạo CICT • CTU và doanh nghiệp liên kết.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {lastSyncTime && (
                        <span className="text-xs text-slate-400 hidden sm:inline-block">
                            Cập nhật lúc: {lastSyncTime}
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void loadData()}
                        disabled={isRefreshing}
                        className="gap-2 cursor-pointer text-xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        <span>Làm mới</span>
                    </Button>
                </div>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Users */}
                <Link href="/admin/users" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-2xs transition h-full">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-sky-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-black text-slate-900">
                                    {isLoading ? "—" : users.length}
                                </div>
                                <div className="text-xs font-bold text-slate-700 mt-0.5 group-hover:text-sky-700 transition">
                                    Tài khoản người dùng
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                                    <span className="text-emerald-600 font-medium">● {activeUsers} hoạt động</span>
                                    <span>·</span>
                                    <span className="text-slate-400">{inactiveUsers} tạm khóa</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* 2. Departments & Programs */}
                <Link href="/admin/departments" className="block group">
                    <Card className="hover:border-indigo-300 hover:shadow-2xs transition h-full">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-black text-slate-900">
                                    {isLoading ? "—" : `${programs.length} Ngành`}
                                </div>
                                <div className="text-xs font-bold text-slate-700 mt-0.5 group-hover:text-indigo-700 transition">
                                    Cơ cấu Khoa & Ngành
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    Trường CNTT&TT (CICT • CTU)
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* 3. Companies */}
                <Link href="/admin/companies" className="block group">
                    <Card className="hover:border-emerald-300 hover:shadow-2xs transition h-full">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-black text-slate-900">
                                    {isLoading ? "—" : companies.length}
                                </div>
                                <div className="text-xs font-bold text-slate-700 mt-0.5 group-hover:text-emerald-700 transition">
                                    Doanh nghiệp liên kết
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                                    <span className="text-emerald-600 font-medium">● {verifiedCompanies} đã thẩm định</span>
                                    <span>·</span>
                                    <span className="text-amber-600">{pendingCompanies} chờ duyệt</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* 4. Audit Logs */}
                <Link href="/admin/audit-logs" className="block group">
                    <Card className="hover:border-amber-300 hover:shadow-2xs transition h-full">
                        <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-black text-slate-900">
                                    {isLoading ? "—" : auditLogs.length}
                                </div>
                                <div className="text-xs font-bold text-slate-700 mt-0.5 group-hover:text-amber-700 transition">
                                    Nhật ký kiểm toán
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    Lịch sử thao tác & đăng nhập
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Main Content Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Role Breakdown & Academic Programs (7/12) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* User Role Distribution Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-sky-700" />
                                    Phân bố tài khoản theo vai trò
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Các nhóm người dùng trong quy trình thực tập và tiếp nhận sinh viên
                                </p>
                            </div>
                            <Link href="/admin/users">
                                <Button variant="secondary" size="sm" className="text-xs gap-1 cursor-pointer">
                                    Quản lý <ArrowRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(["STUDENT", "LECTURER", "FACULTY_ADMIN", "COMPANY_REP", "COMPANY_MENTOR", "ADMIN"] as UserRole[]).map((role) => {
                                    const meta = ROLE_DISPLAY[role];
                                    const count = roleCounts[role];
                                    const percent = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                                    return (
                                        <div
                                            key={role}
                                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 flex flex-col justify-between"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {meta.label}
                                                </span>
                                                <Badge variant={meta.badgeVariant} className="text-[10px] px-1.5 py-0">
                                                    {percent}%
                                                </Badge>
                                            </div>
                                            <div className="flex items-baseline justify-between mt-1">
                                                <span className="text-xl font-black text-slate-900">{count}</span>
                                                <span className="text-[11px] text-slate-400">tài khoản</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Programs CICT Summary Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-indigo-700" />
                                    Danh mục Ngành đào tạo trực thuộc Khoa (CICT)
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Trường Công nghệ Thông tin & Truyền thông – Đại học Cần Thơ
                                </p>
                            </div>
                            <Link href="/admin/departments">
                                <Button variant="secondary" size="sm" className="text-xs gap-1 cursor-pointer">
                                    Cấu hình <ArrowRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-2.5">
                            {programs.map((prog) => (
                                <div
                                    key={prog.id}
                                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-150 flex items-center justify-between hover:bg-slate-50 transition"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                            {prog.code}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{prog.name}</p>
                                            <p className="text-xs text-slate-400">
                                                Mã ngành: <span className="font-medium text-slate-600">{prog.code}</span> • Hệ {prog.track === "HIGH_QUALITY" ? "Chất lượng cao" : "Chính quy"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            Đang đào tạo
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Core Management Hub & Live Audit Trail (5/12) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Core Hub Actions */}
                    <Card>
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-slate-700" />
                                5 Phân hệ quản trị cốt lõi
                            </CardTitle>
                            <p className="text-xs text-slate-500">
                                Lối tắt truy cập các khu vực quản lý hệ thống
                            </p>
                        </CardHeader>
                        <CardContent className="pt-3 divide-y divide-slate-100">
                            <Link href="/admin/ai" className="py-3 flex items-center justify-between group hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0"><BrainCircuit className="w-4 h-4" /></div>
                                    <div><p className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">Quản lý AI</p><p className="text-[11px] text-slate-500">Theo dõi dịch vụ, kết quả xử lý CV và xử lý lại lượt lỗi</p></div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition" />
                            </Link>
                            <Link
                                href="/admin/users"
                                className="py-3 flex items-center justify-between group hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">
                                            Quản lý người dùng & Phân quyền
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Tạo tài khoản, gán vai trò, quản lý trạng thái truy cập
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition" />
                            </Link>

                            <Link
                                href="/admin/departments"
                                className="py-3 flex items-center justify-between group hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition">
                                            Cơ cấu Khoa & Ngành đào tạo
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Quản lý danh mục ngành: KTPM, ATTT, CNTT, HTTT, MMT
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
                            </Link>

                            <Link
                                href="/admin/companies"
                                className="py-3 flex items-center justify-between group hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                                            Danh bạ Doanh nghiệp liên kết
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Hồ sơ pháp nhân, mã số thuế và kết quả thẩm định
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                            </Link>

                            <Link
                                href="/admin/audit-logs"
                                className="py-3 flex items-center justify-between group hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                                            Nhật ký kiểm toán & Giám sát
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Theo dõi lịch sử truy cập và nhật ký thao tác
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Recent Audit Logs Feed */}
                    <Card>
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    Nhật ký hoạt động gần đây
                                </CardTitle>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Các sự kiện và thao tác được ghi nhận mới nhất
                                </p>
                            </div>
                            <Link href="/admin/audit-logs">
                                <Button variant="secondary" size="sm" className="text-xs gap-1 cursor-pointer">
                                    Tất cả <ArrowRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-3">
                            {auditLogs.length > 0 ? (
                                <div className="space-y-3">
                                    {auditLogs.slice(0, 5).map((log) => (
                                        <div
                                            key={log.id}
                                            className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
                                        >
                                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                                <span>{log.actorName}</span>
                                                <span>{new Date(log.createdAt).toLocaleTimeString("vi-VN")}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="font-semibold text-slate-800">
                                                    {log.action} <span className="font-normal text-slate-500">({log.entityType})</span>
                                                </p>
                                                <Badge
                                                    variant={log.result === "SUCCESS" ? "success" : "destructive"}
                                                    className="text-[9px] px-1.5 py-0"
                                                >
                                                    {log.result}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs">
                                    <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                    Chưa có nhật ký phát sinh mới
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

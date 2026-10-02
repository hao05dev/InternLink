"use client";

import React from "react";
import Link from "next/link";
import { Users, Building2, ShieldCheck, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminStatsOverviewProps {
    isLoading: boolean;
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalPrograms: number;
    totalCompanies: number;
    verifiedCompanies: number;
    pendingCompanies: number;
    totalAuditLogs: number;
}

export function AdminStatsOverview({
    isLoading,
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalPrograms,
    totalCompanies,
    verifiedCompanies,
    pendingCompanies,
    totalAuditLogs,
}: AdminStatsOverviewProps) {
    return (
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
                                {isLoading ? "—" : totalUsers}
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
                                {isLoading ? "—" : `${totalPrograms} Ngành`}
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
                                {isLoading ? "—" : totalCompanies}
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
                                {isLoading ? "—" : totalAuditLogs}
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
    );
}

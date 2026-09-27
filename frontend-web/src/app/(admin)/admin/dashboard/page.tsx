"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Users, Building2, ShieldCheck, BookOpen, Clock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient } from "@/lib/api-client";

export default function AdminDashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Trung Tâm Quản Trị Hệ Thống (System Admin)
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Quản trị người dùng 6 vai trò, phê duyệt pháp nhân doanh nghiệp và kiểm toán bảo mật
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/users" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-xs transition h-full">
                        <CardContent className="p-5 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">
                                    Quản lý người dùng
                                </div>
                                <div className="text-[11px] text-slate-500">6 nhóm vai trò</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/companies" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-xs transition h-full">
                        <CardContent className="p-5 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">
                                    Doanh nghiệp & MOU
                                </div>
                                <div className="text-[11px] text-slate-500">Thẩm định pháp nhân</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/departments" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-xs transition h-full">
                        <CardContent className="p-5 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">
                                    Cơ cấu Khoa/Ngành
                                </div>
                                <div className="text-[11px] text-slate-500">CICT • CTU</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/audit-logs" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-xs transition h-full">
                        <CardContent className="p-5 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition">
                                    Nhật ký kiểm toán
                                </div>
                                <div className="text-[11px] text-slate-500">Audit Logs & Security</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

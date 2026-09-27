"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Users, Building2, CheckSquare, Calendar, Layers, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient } from "@/lib/api-client";

export default function FacultyDashboardPage() {
    const { user } = useAuth();
    const [terms, setTerms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        apiClient.get<any[]>("/api/v1/terms/by-department/11111111-1111-1111-1111-111111111111")
            .then(res => {
                if (mounted && Array.isArray(res.data)) {
                    setTerms(res.data);
                }
            })
            .catch(() => {})
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Tổng Quan Ban Quản Lý Thực Tập (CICT)
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Xin chào <strong>{user?.fullName}</strong> • Điều phối kỳ thực tập tốt nghiệp & thẩm định đối tác
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/faculty/job-approvals">
                        <Button variant="default" size="sm" className="text-xs">
                            <CheckSquare className="w-3.5 h-3.5 mr-1" />
                            Duyệt tin tuyển dụng
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">120</div>
                            <div className="text-xs text-slate-500">Sinh viên đủ điều kiện</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">15</div>
                            <div className="text-xs text-slate-500">Doanh nghiệp tiếp nhận</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">3</div>
                            <div className="text-xs text-slate-500">Vị trí chờ Khoa duyệt</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">18</div>
                            <div className="text-xs text-slate-500">Giảng viên hướng dẫn</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Kỳ thực tập hiện hành</CardTitle>
                    <Link href="/faculty/terms" className="text-xs text-sky-700 font-semibold hover:underline">
                        Quản lý kỳ thực tập
                    </Link>
                </CardHeader>
                <CardContent className="pt-2">
                    {loading ? (
                        <div className="py-6 text-center text-xs text-slate-400">Đang tải thông tin kỳ...</div>
                    ) : terms.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                            Học kỳ 1 Năm học 2026-2027 (HK1_2026_2027) - Đang nhận hồ sơ ứng tuyển
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {terms.map(t => (
                                <div key={t.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold text-slate-900">{t.termName}</div>
                                        <div className="text-[11px] text-slate-500">Mã kỳ: {t.code} • Năm học: {t.academicYear}</div>
                                    </div>
                                    <StatusBadge status={t.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

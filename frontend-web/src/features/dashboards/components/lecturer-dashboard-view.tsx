"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Users, CheckSquare, Award, Clock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/workflow/components/status-badge";
import { apiClient } from "@/lib/api-client";

export default function LecturerDashboardView() {
    const { user } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        apiClient.get<any[]>("/api/v1/placements/lecturer/my-students")
            .then(res => {
                if (mounted && Array.isArray(res.data)) {
                    setStudents(res.data);
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
                        Bàn Làm Việc Giảng Viên Hướng Dẫn
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Xin chào <strong>{user?.fullName}</strong> • Giám sát học phần thực tập & đánh giá chuẩn đầu ra (CLO)
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">{students.length}</div>
                            <div className="text-xs text-slate-500">Sinh viên được phân công</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">
                                {students.filter(s => s.status === 'ACTIVE' || !s.status).length}
                            </div>
                            <div className="text-xs text-slate-500">Đang trong tiến trình thực tập</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">
                                {students.filter(s => s.status === 'COMPLETED').length}
                            </div>
                            <div className="text-xs text-slate-500">Đã hoàn tất đánh giá</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Danh sách sinh viên hướng dẫn</CardTitle>
                    <Link href="/lecturer/supervision" className="text-xs text-sky-700 font-semibold hover:underline">
                        Giám sát chi tiết
                    </Link>
                </CardHeader>
                <CardContent className="pt-2">
                    {loading ? (
                        <div className="py-6 text-center text-xs text-slate-400">Đang tải danh sách...</div>
                    ) : students.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                            Chưa có sinh viên nào trong danh sách hướng dẫn học kỳ này.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {students.map((st) => (
                                <div key={st.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50/50 transition">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-900">{st.studentName}</div>
                                        <div className="text-[11px] text-slate-500">Doanh nghiệp: {st.companyName} • Mentor: {st.mentorName || "Chưa có"}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={st.status || "ACTIVE"} />
                                        <Link href={`/lecturer/supervision`}>
                                            <Button variant="outline" size="sm" className="text-xs">
                                                Xem tiến độ
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

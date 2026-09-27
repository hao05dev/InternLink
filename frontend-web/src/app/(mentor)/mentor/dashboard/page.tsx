"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { CheckSquare, Users, Award, Clock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient } from "@/lib/api-client";

export default function MentorDashboardPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        apiClient.get<any[]>("/api/v1/placements/mentor/my-students")
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
                        Bàn Làm Việc Cán Bộ Hướng Dẫn (Mentor)
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Xin chào <strong>{user?.fullName}</strong> • Quản lý & Đánh giá Thực tập sinh Doanh nghiệp
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
                            <div className="text-xs text-slate-500">Sinh viên phụ trách</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">2</div>
                            <div className="text-xs text-slate-500">Nhật ký tuần chờ nhận xét</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">0</div>
                            <div className="text-xs text-slate-500">Phiếu đánh giá cuối kỳ</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Danh sách sinh viên đang hướng dẫn</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    {loading ? (
                        <div className="py-6 text-center text-xs text-slate-400">Đang tải danh sách...</div>
                    ) : students.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                            Hiện tại chưa có sinh viên nào được phân công cho bạn.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {students.map((st) => (
                                <div key={st.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50/50 transition">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-900">{st.studentName}</div>
                                        <div className="text-[11px] text-slate-500">Vị trí: {st.jobTitle} • {st.departmentName}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={st.status || "ACTIVE"} />
                                        <Link href={`/mentor/weekly-evaluations`}>
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

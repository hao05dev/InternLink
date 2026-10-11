"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { 
    Users, CheckSquare, Award, Clock, ArrowRight, AlertTriangle, 
    BookOpen, CheckCircle2, ChevronRight, MessageSquare, Sparkles 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/workflow/components/status-badge";
import { apiClient } from "@/lib/api-client";
import { AcademicHeroBanner } from "./academic-hero-banner";
import { AcademicStatCard } from "./academic-stat-card";
import { AcademicAiInsightCard } from "./academic-ai-insight-card";

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

    const activeCount = students.filter(s => s.status === 'ACTIVE' || !s.status).length;
    const completedCount = students.filter(s => s.status === 'COMPLETED').length;
    const totalCount = students.length || 1;
    const completionPercent = Math.round((completedCount / totalCount) * 100);

    const userCode = useMemo(() => {
        if (!user?.email) return "CB-GVHD";
        return user.email.split("@")[0].toUpperCase();
    }, [user?.email]);

    return (
        <div className="space-y-6">
            {/* Academic Hero Banner (Phong cách HCMUE PLUS) */}
            <AcademicHeroBanner
                roleBadge="Giảng Viên Hướng Dẫn • CICT"
                userName={user?.fullName || "Quý Thầy/Cô"}
                userCode={userCode}
                departmentOrCompany="Trường Công nghệ Thông tin & Truyền thông • Đại học Cần Thơ"
                academicYear="Năm học 2026-2027 • Học kỳ 1"
                nextEvent={{
                    badgeTitle: "Nhiệm vụ sư phạm tuần này",
                    title: `Giám sát tiến độ & Duyệt nhật ký (${students.length} sinh viên)`,
                    time: "Hạn chót xác nhận: Thứ Sáu, 17:00",
                    locationOrDetail: "Hệ thống giám sát thực tập CICT",
                    mentorOrLecturer: "Học phần CT466",
                    actionLabel: "Chấm điểm & Nhận xét",
                    actionHref: "/lecturer/supervision",
                }}
                progress={{
                    label: "Tiến độ hoàn tất đánh giá CLO",
                    current: completedCount,
                    total: students.length,
                    unit: "SV",
                    percentage: completionPercent,
                }}
            />

            {/* 3 Thẻ Chỉ Số Sư Phạm (HCMUE PLUS Stat Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AcademicStatCard
                    title="Sinh viên hướng dẫn"
                    value={students.length}
                    targetOrStatus="100% đã được kết nối với doanh nghiệp"
                    icon={Users}
                    iconColor="text-sky-700"
                    iconBg="bg-sky-50"
                    href="/lecturer/supervision"
                />

                <AcademicStatCard
                    title="Cảnh báo học vụ (At-risk)"
                    value="0"
                    targetOrStatus="Tất cả sinh viên đều duy trì nhật ký đều đặn"
                    icon={AlertTriangle}
                    iconColor="text-amber-700"
                    iconBg="bg-amber-50"
                    trend={{ value: "An toàn", isPositive: true }}
                />

                <AcademicStatCard
                    title="Chuẩn đầu ra CLO đã chấm"
                    value={`${completedCount}/${students.length}`}
                    targetOrStatus={`${activeCount} sinh viên đang thực tập thực tế`}
                    icon={Award}
                    iconColor="text-emerald-700"
                    iconBg="bg-emerald-50"
                    href="/lecturer/grading"
                />
            </div>

            {/* Bố cục nội dung chính 2 cột */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Cột trái (8 cols): Hàng chờ giám sát & danh sách sinh viên */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-sky-700" />
                                    Danh sách sinh viên hướng dẫn ({students.length})
                                </CardTitle>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Theo dõi tiến độ nhật ký, liên hệ doanh nghiệp và nhận xét sư phạm
                                </p>
                            </div>
                            <Link href="/lecturer/supervision" className="text-xs text-sky-700 font-bold hover:underline">
                                Xem tất cả
                            </Link>
                        </CardHeader>
                        <CardContent className="p-5 pt-3">
                            {loading ? (
                                <div className="py-8 text-center text-xs text-slate-400">Đang tải danh sách sinh viên...</div>
                            ) : students.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    Chưa có sinh viên nào được phân công hướng dẫn trong kỳ này.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {students.slice(0, 6).map((st) => (
                                        <div key={st.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition px-2 rounded-xl">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900">{st.studentName}</span>
                                                    <StatusBadge status={st.status || "ACTIVE"} />
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                                                    <span>DN: <strong>{st.companyName}</strong></span>
                                                    <span>•</span>
                                                    <span>Mentor: {st.mentorName || "Đang phân công"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link href={`/lecturer/supervision`}>
                                                    <Button variant="outline" size="sm" className="text-xs rounded-xl font-bold">
                                                        Nhật ký & Tiến độ
                                                    </Button>
                                                </Link>
                                                <Link href={`/lecturer/grading`}>
                                                    <Button size="sm" className="text-xs rounded-xl bg-cict-navy hover:bg-cict-700 text-white font-bold">
                                                        Chấm Rubric
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

                {/* Cột phải (4 cols): Việc cần làm của Thầy/Cô & AI Insights */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Thẻ Việc cần làm (To-do) */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900">Việc cần làm</CardTitle>
                            <span className="text-xs text-slate-400 font-medium">Học vụ</span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2.5 text-xs">
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Duyệt nhật ký tuần mới nộp</div>
                                    <div className="text-[11px] text-slate-500">Hạn chót: 17:00 Thứ Sáu</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Phản hồi báo cáo đề cương thực tập</div>
                                    <div className="text-[11px] text-slate-500">Giữa kỳ thực tập</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Tổng hợp điểm chuẩn đầu ra CLO</div>
                                    <div className="text-[11px] text-slate-500">Cuối kỳ thực tập</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Insights Card cho Giảng Viên */}
                    <AcademicAiInsightCard
                        title="AI Pedagogical Insights"
                        highlightText="Gợi ý sư phạm & Đảm bảo chất lượng:"
                        advice="Nhóm sinh viên hướng dẫn của Thầy/Cô đang có tỷ lệ hoàn thành nhật ký 100%. Các đề tài liên quan đến Cloud & Web API đang được sinh viên thực hiện tích cực tại doanh nghiệp."
                        actionHref="/lecturer/ai"
                        actionLabel="Phân tích chất lượng bằng AI"
                    />

                    {/* Liên hệ Bộ môn & Ban quản lý khoa */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card bg-slate-50/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                                Điều phối học phần CT466
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5 text-[11px] text-slate-600">
                            <div>Phụ trách: Ban Quản Lý Thực Tập CICT</div>
                            <div>Quy định: Tối thiểu 15 tuần thực tập thực tế tại doanh nghiệp</div>
                            <div className="pt-2">
                                <Link href="/lecturer/grading" className="text-sky-700 font-bold hover:underline inline-flex items-center gap-1">
                                    Xem bảng tiêu chí Rubric & CLO
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { 
    CheckSquare, Users, Award, Clock, ArrowRight, Building2, 
    Briefcase, Sparkles, Phone, MessageSquare, ChevronRight, UserCheck 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/workflow/components/status-badge";
import { apiClient } from "@/lib/api-client";
import { AcademicHeroBanner } from "./academic-hero-banner";
import { AcademicStatCard } from "./academic-stat-card";
import { AcademicAiInsightCard } from "./academic-ai-insight-card";

export default function MentorDashboardView() {
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

    const activeCount = students.filter(s => s.status === 'ACTIVE' || !s.status).length;
    const completedCount = students.filter(s => s.status === 'COMPLETED').length;
    const totalCount = students.length || 1;
    const completionPercent = Math.round((completedCount / totalCount) * 100);

    const userCode = useMemo(() => {
        if (!user?.email) return "MENTOR-DN";
        return user.email.split("@")[0].toUpperCase();
    }, [user?.email]);

    return (
        <div className="space-y-6">
            {/* Academic Hero Banner (Phong cách HCMUE PLUS) */}
            <AcademicHeroBanner
                roleBadge="Cán Bộ Hướng Dẫn Doanh Nghiệp • Mentor"
                userName={user?.fullName || "Quý Mentor"}
                userCode={userCode}
                departmentOrCompany="Đơn vị tiếp nhận & Hướng dẫn Thực tập sinh CICT - CTU"
                academicYear="Năm học 2026-2027 • Học kỳ 1"
                nextEvent={{
                    badgeTitle: "Nhiệm vụ huấn luyện tuần này",
                    title: `Đánh giá ca làm việc & Kiểm tra nhật ký (${students.length} TTS)`,
                    time: "Hằng tuần • Check-in tiến độ dự án",
                    locationOrDetail: "Dự án phần mềm & Văn phòng làm việc",
                    mentorOrLecturer: "Kết nối cùng GVHD Trường CNTT&TT",
                    actionLabel: "Duyệt nhật ký tuần",
                    actionHref: "/mentor/weekly-evaluations",
                }}
                progress={{
                    label: "Tiến độ đánh giá doanh nghiệp",
                    current: completedCount,
                    total: students.length,
                    unit: "TTS",
                    percentage: completionPercent,
                }}
            />

            {/* 3 Thẻ Chỉ Số Huấn Luyện Thực Tế (HCMUE PLUS Stat Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AcademicStatCard
                    title="Thực tập sinh phụ trách"
                    value={students.length}
                    targetOrStatus="Đang tham gia dự án thực tế tại công ty"
                    icon={Users}
                    iconColor="text-sky-700"
                    iconBg="bg-sky-50"
                    href="/mentor/internship-record"
                />

                <AcademicStatCard
                    title="Nhật ký ca làm chờ duyệt"
                    value={activeCount}
                    targetOrStatus="Cần xác nhận giờ làm & kết quả công việc"
                    icon={CheckSquare}
                    iconColor="text-amber-700"
                    iconBg="bg-amber-50"
                    href="/mentor/weekly-evaluations"
                />

                <AcademicStatCard
                    title="Đánh giá kết thúc kỳ"
                    value={`${completedCount}/${students.length}`}
                    targetOrStatus="Phiếu chấm điểm kỹ năng & thái độ doanh nghiệp"
                    icon={Award}
                    iconColor="text-emerald-700"
                    iconBg="bg-emerald-50"
                    href="/mentor/final-assessment"
                />
            </div>

            {/* Bố cục nội dung chính 2 cột */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Cột trái (8 cols): Bảng theo dõi thực tập sinh & Công việc */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-emerald-700" />
                                    Danh sách thực tập sinh trực tiếp kèm cặp ({students.length})
                                </CardTitle>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Theo dõi thời gian, khối lượng công việc và nhận xét thái độ nghề nghiệp
                                </p>
                            </div>
                            <Link href="/mentor/weekly-evaluations" className="text-xs text-sky-700 font-bold hover:underline">
                                Xem tất cả
                            </Link>
                        </CardHeader>
                        <CardContent className="p-5 pt-3">
                            {loading ? (
                                <div className="py-8 text-center text-xs text-slate-400">Đang tải danh sách...</div>
                            ) : students.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    Hiện tại chưa có sinh viên nào được phân công cho bạn.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {students.map((st) => (
                                        <div key={st.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition px-2 rounded-xl">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900">{st.studentName}</span>
                                                    <StatusBadge status={st.status || "ACTIVE"} />
                                                </div>
                                                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                                                    <span>Vị trí: <strong>{st.jobTitle || "Thực tập sinh"}</strong></span>
                                                    <span>•</span>
                                                    <span>Phòng ban: {st.departmentName || "Khối Công nghệ"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link href={`/mentor/weekly-evaluations`}>
                                                    <Button variant="outline" size="sm" className="text-xs rounded-xl font-bold">
                                                        Duyệt nhật ký
                                                    </Button>
                                                </Link>
                                                <Link href={`/mentor/final-assessment`}>
                                                    <Button size="sm" className="text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                                                        Phiếu đánh giá DN
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

                {/* Cột phải (4 cols): Nhiệm vụ của Mentor & AI Insights */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Thẻ Việc cần làm (To-do) */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900">Việc cần làm</CardTitle>
                            <span className="text-xs text-slate-400 font-medium">Doanh nghiệp</span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2.5 text-xs">
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Xác nhận nhật ký tuần của TTS</div>
                                    <div className="text-[11px] text-slate-500">Kiểm tra kết quả công việc</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Trao đổi định kỳ với GVHD Trường</div>
                                    <div className="text-[11px] text-slate-500">Giữa kỳ thực tập</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Chấm điểm phiếu đánh giá doanh nghiệp</div>
                                    <div className="text-[11px] text-slate-500">Khi kết thúc kỳ thực tập</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Insights Card cho Mentor */}
                    <AcademicAiInsightCard
                        title="AI Mentoring Assistant"
                        highlightText="Gợi ý đánh giá kỹ năng nghề nghiệp:"
                        advice="Thực tập sinh CICT - CTU có nền tảng tư duy thuật toán tốt. Bạn có thể giao thêm các task liên quan đến CI/CD và Unit Test để giúp sinh viên cọ xát thực tế tốt hơn!"
                        actionHref="/mentor/ai"
                        actionLabel="Mở gợi ý AI"
                    />

                    {/* Hộp kết nối 3 bên */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card bg-slate-50/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                                Hợp tác Đào tạo CICT - Doanh Nghiệp
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5 text-[11px] text-slate-600">
                            <div>Đại học Cần Thơ cam kết đồng hành cùng doanh nghiệp trong suốt kỳ thực tập.</div>
                            <div className="pt-2">
                                <Link href="/mentor/internship-record" className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
                                    Quy định hồ sơ thực tập doanh nghiệp
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

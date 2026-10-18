"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { 
    Briefcase, Calendar, CheckCircle2, Clock, FileText, 
    ArrowRight, AlertCircle, BookOpen, User, Send, ChevronRight,
    Award, CheckSquare, Sparkles, MapPin, ExternalLink
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/workflow/components/status-badge";
import { apiClient } from "@/lib/api-client";
import { AcademicHeroBanner } from "./academic-hero-banner";
import { AcademicStatCard } from "./academic-stat-card";
import { AcademicAiInsightCard } from "./academic-ai-insight-card";
import { StudentAssignedLecturerCard } from "./cards/student-assigned-lecturer-card";

export default function StudentDashboardView() {
    const { user } = useAuth();
    const [placement, setPlacement] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        Promise.allSettled([
            apiClient.get<any[]>("/api/v1/placements/my-placement"),
            apiClient.get<any[]>("/api/v1/applications/my-applications"),
        ]).then(([placementRes, appRes]) => {
            if (!mounted) return;
            if (placementRes.status === "fulfilled" && placementRes.value.data?.[0]) {
                setPlacement(placementRes.value.data[0]);
            }
            if (appRes.status === "fulfilled" && Array.isArray(appRes.value.data)) {
                setApplications(appRes.value.data);
            }
            setLoading(false);
        });

        return () => { mounted = false; };
    }, []);

    const acceptedApp = applications.find(a => a.status === "ACCEPTED");

    const studentMssv = useMemo(() => {
        if (!user?.email) return "B2110940";
        const prefix = user.email.split("@")[0].toUpperCase();
        return prefix;
    }, [user?.email]);

    // Tiến độ thực tập 15 tuần
    const completedWeeks = placement?.completedWeeks || (placement ? 6 : 0);
    const totalWeeks = 15;
    const progressPercent = Math.min(100, Math.round((completedWeeks / totalWeeks) * 100));

    // Xác định sự kiện kế tiếp hiển thị trên Hero Banner
    const heroNextEvent = useMemo(() => {
        if (placement) {
            return {
                badgeTitle: "Ca làm việc tiếp theo: Thứ Hai",
                title: `${placement.jobTitle || "Thực tập sinh"} • ${placement.companyName || "Doanh nghiệp"}`,
                time: "08:00 - 17:30 • Ca chính khóa",
                locationOrDetail: "Văn phòng dự án / Trụ sở DN",
                mentorOrLecturer: placement.mentorName ? `Mentor: ${placement.mentorName}` : "Cán bộ hướng dẫn",
                actionLabel: "Viết nhật ký ngày",
                actionHref: "/student/daily-logs",
            };
        }
        if (acceptedApp) {
            return {
                badgeTitle: "Mốc quan trọng kế tiếp: Ký Thỏa Thuận",
                title: `Đã trúng tuyển vị trí ${acceptedApp.jobTitle}`,
                time: "Hạn chót: Thứ Sáu tuần này",
                locationOrDetail: acceptedApp.companyName || "Doanh nghiệp tiếp nhận",
                mentorOrLecturer: "Chờ thẩm định GVHD",
                actionLabel: "Ký Thỏa thuận 3 bên",
                actionHref: "/student/learning-agreement",
            };
        }
        return {
            badgeTitle: "Học phần kế tiếp: Thực tập tốt nghiệp",
            title: "Ứng tuyển vị trí thực tập doanh nghiệp (CT466)",
            time: "Học kỳ 1 • Khóa K48",
            locationOrDetail: "Khoa CNTT&TT • ĐH Cần Thơ",
            actionLabel: "Khám phá việc làm thực tập",
            actionHref: "/jobs",
        };
    }, [placement, acceptedApp]);

    return (
        <div className="space-y-6">
            {/* Academic Hero Banner (Phong cách HCMUE PLUS) */}
            <AcademicHeroBanner
                roleBadge="Cổng Sinh Viên Thực Tập • CICT"
                userName={user?.fullName || "Sinh viên"}
                userCode={studentMssv}
                departmentOrCompany={placement ? `Đơn vị thực tập: ${placement.companyName}` : "Khoa Công nghệ Thông tin & Truyền thông — CICT CTU"}
                academicYear="Năm học 2026-2027 • Học kỳ 1"
                nextEvent={heroNextEvent}
                progress={{
                    label: "Tiến độ học phần CT466",
                    current: completedWeeks,
                    total: totalWeeks,
                    unit: "Tuần",
                    percentage: progressPercent,
                }}
            />

            {/* Hàng 3 thẻ chỉ số nhanh (Metric Cards) chuẩn phong cách HCMUE PLUS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AcademicStatCard
                    title="Mục tiêu GPA & Tốt nghiệp"
                    value="3.70"
                    targetOrStatus="GPA hiện tại: 3.60 • Đủ điều kiện CT466"
                    icon={Award}
                    iconColor="text-sky-700"
                    iconBg="bg-sky-50"
                    trend={{ value: "+0.15", isPositive: true }}
                />

                <AcademicStatCard
                    title="CV & AI Readiness"
                    value="92/100"
                    targetOrStatus="Hồ sơ năng lực khớp 92% thị trường"
                    icon={Sparkles}
                    iconColor="text-indigo-700"
                    iconBg="bg-indigo-50"
                    href="/student/profile"
                />

                <AcademicStatCard
                    title="Nhật ký thực tập"
                    value={`${completedWeeks}/${totalWeeks}`}
                    targetOrStatus={placement ? "Đã được Mentor & GVHD duyệt" : "Chưa kích hoạt kỳ thực tập"}
                    icon={CheckSquare}
                    iconColor="text-emerald-700"
                    iconBg="bg-emerald-50"
                    href="/student/weekly-logs"
                />
            </div>

            {/* Bố cục nội dung chính 2 cột (Main Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Cột trái (8 cols): Sự kiện tiếp theo, Tiến trình 3 bên & Đơn ứng tuyển */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Thẻ Sự kiện tiếp theo dạng Timeline (như Buổi học tiếp theo trong mẫu HCMUE PLUS) */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-sky-700" />
                                Lịch trình & Sự kiện sắp tới
                            </CardTitle>
                            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-100">
                                Còn 2 ngày
                            </span>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                                            08:00 - 17:30
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">
                                            {placement ? `${placement.jobTitle} tại ${placement.companyName}` : "Nộp báo cáo tiến độ tuần"}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                                        <span>Địa điểm: {placement ? "Khu công nghệ FPT CTU" : "Hệ thống InternLink"}</span>
                                        <span>•</span>
                                        <span>GVHD: {placement?.lecturerName || "ThS. Sơn (CICT)"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link href={placement ? "/student/daily-logs" : "/jobs"}>
                                        <Button size="sm" variant="outline" className="text-xs rounded-xl font-bold">
                                            {placement ? "Viết nhật ký" : "Tìm vị trí"}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lộ trình thực tập tốt nghiệp 5 giai đoạn (Educational Progression) */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-sky-700" />
                                    Lộ trình thực tập 3 bên (Học phần CT466)
                                </CardTitle>
                                {placement ? (
                                    <StatusBadge status={placement.status || "ACTIVE"} />
                                ) : acceptedApp ? (
                                    <StatusBadge status="ACCEPTED" customLabel="Đã trúng tuyển" />
                                ) : (
                                    <span className="text-xs text-slate-400 font-medium">Giai đoạn ứng tuyển</span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-1">
                            {/* Visual Timeline Stepper */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold">
                                    <div className="text-[10px] text-emerald-600">Bước 1</div>
                                    Xét duyệt hồ sơ
                                </div>
                                <div className={applications.length > 0 ? "p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold" : "p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200"}>
                                    <div className="text-[10px] text-slate-400">Bước 2</div>
                                    Ứng tuyển & PV
                                </div>
                                <div className={placement ? "p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold" : acceptedApp ? "p-2.5 rounded-xl bg-sky-100 text-sky-800 border border-sky-300 font-bold ring-2 ring-sky-300" : "p-2.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200"}>
                                    <div className="text-[10px] text-slate-400">Bước 3</div>
                                    Thỏa thuận 3 bên
                                </div>
                                <div className={placement ? "p-2.5 rounded-xl bg-sky-100 text-sky-800 border border-sky-300 font-bold ring-2 ring-sky-300" : "p-2.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200"}>
                                    <div className="text-[10px] text-slate-400">Bước 4</div>
                                    Nhật ký thực tập
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200">
                                    <div className="text-[10px] text-slate-400">Bước 5</div>
                                    Báo cáo & CLO
                                </div>
                            </div>

                            {/* Active Internship Info Box */}
                            {placement ? (
                                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2 text-xs">
                                    <div className="font-bold text-slate-900 text-sm">{placement.jobTitle || "Thực tập sinh"}</div>
                                    <div className="text-slate-600">Đơn vị tiếp nhận: <strong>{placement.companyName}</strong></div>
                                    <div className="text-slate-500">Cán bộ hướng dẫn (Mentor): <strong>{placement.mentorName || "Đang phân công"}</strong></div>
                                    <div className="text-slate-500">Giảng viên hướng dẫn (GVHD): <strong>{placement.lecturerName || "ThS. Sơn (CICT)"}</strong></div>
                                </div>
                            ) : acceptedApp ? (
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                                    <div className="text-xs text-emerald-900 font-semibold">
                                        Chúc mừng! Bạn đã trúng tuyển vị trí <strong>{acceptedApp.jobTitle}</strong> tại <strong>{acceptedApp.companyName}</strong>.
                                    </div>
                                    <Link href="/student/learning-agreement">
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs rounded-xl mt-1">
                                            Ký Thỏa thuận học tập
                                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-4 text-center rounded-2xl bg-slate-50 text-xs text-slate-500 space-y-2">
                                    <p>Bạn chưa kích hoạt vị trí thực tập chính thức. Hãy nộp đơn ứng tuyển các vị trí được Khoa thẩm định.</p>
                                    <Link href="/jobs">
                                        <Button size="sm" className="text-xs rounded-xl">
                                            Khám phá tin tuyển dụng
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Đơn ứng tuyển gần đây */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900">
                                Đơn ứng tuyển gần đây ({applications.length})
                            </CardTitle>
                            <Link href="/student/applications" className="text-xs font-semibold text-sky-700 hover:underline">
                                Xem tất cả
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            {applications.length === 0 ? (
                                <div className="py-6 text-center text-xs text-slate-400">
                                    Chưa có đơn ứng tuyển nào trong kỳ.
                                </div>
                            ) : (
                                applications.slice(0, 3).map((app) => (
                                    <div 
                                        key={app.id}
                                        className="p-3.5 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50/80 transition"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="text-xs font-bold text-slate-800">{app.jobTitle}</div>
                                            <div className="text-[11px] text-slate-500">{app.companyName}</div>
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Cột phải (4 cols): Giảng viên hướng dẫn & Việc cần làm & AI Insights & Hỗ trợ học vụ */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Thẻ Giảng viên hướng dẫn phân công */}
                    <StudentAssignedLecturerCard fallbackLecturerName={placement?.lecturerName} />

                    {/* Thẻ Việc cần làm (To-do / Deadlines Checklist) như mẫu HCMUE PLUS */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900">Việc cần làm</CardTitle>
                            <Link href="/student/weekly-logs" className="text-xs font-bold text-sky-700 hover:underline">
                                Mở lịch
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2.5 text-xs">
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Nộp nhật ký tuần 6</div>
                                    <div className="text-[11px] text-slate-500">Chủ Nhật, 23:59</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Cập nhật kỹ năng mới vào CV</div>
                                    <div className="text-[11px] text-slate-500">Thứ Ba tuần tới</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Ký phụ lục Thỏa thuận học tập</div>
                                    <div className="text-[11px] text-slate-500">Học kỳ 1</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Insights Card (Tương đương HCMUE Plus AI Insights) */}
                    <AcademicAiInsightCard
                        title="InternLink AI Insights"
                        highlightText={`Chào buổi sáng ${user?.fullName ? user.fullName.split(" ").slice(-1)[0] : "bạn"}!`}
                        advice="Hệ thống phân tích thấy GPA của bạn đang đạt 3.60, rất gần mục tiêu 3.70. Điểm CV Readiness của bạn đạt 92%, hãy hoàn thành báo cáo tuần đúng hạn để tối ưu chuẩn đầu ra CLO!"
                        actionHref="/student/ai"
                        actionLabel="Hỏi trợ lý AI"
                    />

                    {/* Thông tin hỗ trợ học vụ CICT */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card bg-slate-50/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                                Văn Phòng Khoa CNTT&TT (CICT)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5 text-[11px] text-slate-600">
                            <div>Đại học Cần Thơ • Khu 2, Đường 3/2, Q. Ninh Kiều</div>
                            <div>Email: cict@ctu.edu.vn • ĐT: (0292) 3831 301</div>
                            <div className="pt-2">
                                <Link href="/career-guide" className="text-sky-700 font-bold hover:underline inline-flex items-center gap-1">
                                    Cẩm nang thực tập tốt nghiệp
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

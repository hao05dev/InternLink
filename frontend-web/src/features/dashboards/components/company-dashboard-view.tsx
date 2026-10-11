"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { 
    Briefcase, Users, UserCheck, Plus, CheckCircle2, ChevronRight, 
    Clock, BarChart2, Building2, Sparkles, Send, ArrowRight 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/workflow/components/status-badge";
import { apiClient } from "@/lib/api-client";
import { RecruitmentFunnelChart, type FunnelStageData } from "@/components/ui/charts";
import { AcademicHeroBanner } from "./academic-hero-banner";
import { AcademicStatCard } from "./academic-stat-card";
import { AcademicAiInsightCard } from "./academic-ai-insight-card";

export default function CompanyDashboardView() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        Promise.allSettled([
            apiClient.get<any[]>("/api/v1/jobs/company/mine"),
            apiClient.get<any[]>("/api/v1/applications/company/mine")
        ]).then(([jobsRes, appsRes]) => {
            if (!mounted) return;
            if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value.data)) {
                setJobs(jobsRes.value.data);
            }
            if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value.data)) {
                setApplications(appsRes.value.data);
            }
        }).finally(() => {
            if (mounted) setLoading(false);
        });

        return () => { mounted = false; };
    }, []);

    const funnelData: FunnelStageData = {
        submitted: applications.length,
        interviewing: applications.filter(a => a.status === 'INTERVIEWING' || a.status === 'INTERVIEW_SCHEDULED').length,
        offered: applications.filter(a => a.status === 'OFFERED' || a.status === 'ACCEPTED').length,
        accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    };

    const totalVacancies = jobs.reduce((sum, j) => sum + (j.vacancies || 0), 0) || 1;
    const fillRatePercent = Math.min(100, Math.round((funnelData.accepted / totalVacancies) * 100));

    const userCode = useMemo(() => {
        if (!user?.email) return "DOANH_NGHIEP";
        return user.email.split("@")[0].toUpperCase();
    }, [user?.email]);

    return (
        <div className="space-y-6">
            {/* Academic Hero Banner (Phong cách HCMUE PLUS) */}
            <AcademicHeroBanner
                roleBadge="Cổng Tuyển Dụng Doanh Nghiệp • Đối tác CICT"
                userName={user?.fullName || "Đại diện Doanh Nghiệp"}
                userCode={userCode}
                departmentOrCompany="Đối tác chiến lược đào tạo thực tập sinh — Đại học Cần Thơ"
                academicYear="Năm học 2026-2027 • Học kỳ 1"
                nextEvent={{
                    badgeTitle: "Tiến trình tuyển dụng thực tập",
                    title: `Sàng lọc & Tiếp nhận ứng viên (${funnelData.interviewing} đang phỏng vấn)`,
                    time: "Học kỳ 1 • Đợt 1",
                    locationOrDetail: `${jobs.length} vị trí mở • ${totalVacancies} chỉ tiêu tiếp nhận`,
                    actionLabel: "Duyệt hồ sơ ứng viên",
                    actionHref: "/company/candidates",
                }}
                progress={{
                    label: "Chỉ tiêu tiếp nhận đã hoàn thành",
                    current: funnelData.accepted,
                    total: totalVacancies,
                    unit: "SV",
                    percentage: fillRatePercent,
                }}
            />

            {/* 3 Thẻ Chỉ Số Tuyển Dụng & Đối Tác (HCMUE PLUS Stat Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AcademicStatCard
                    title="Vị trí tuyển dụng mở"
                    value={jobs.length}
                    targetOrStatus={`${totalVacancies} chỉ tiêu thực tập sinh`}
                    icon={Briefcase}
                    iconColor="text-sky-700"
                    iconBg="bg-sky-50"
                    href="/company/jobs"
                />

                <AcademicStatCard
                    title="Ứng viên đang phỏng vấn"
                    value={funnelData.interviewing}
                    targetOrStatus={`${applications.length} tổng hồ sơ sinh viên nộp`}
                    icon={UserCheck}
                    iconColor="text-indigo-700"
                    iconBg="bg-indigo-50"
                    href="/company/candidates"
                />

                <AcademicStatCard
                    title="Thực tập sinh chính thức"
                    value={`${funnelData.accepted}/${totalVacancies}`}
                    targetOrStatus="Đã ký thỏa thuận 3 bên với Nhà trường"
                    icon={CheckCircle2}
                    iconColor="text-emerald-700"
                    iconBg="bg-emerald-50"
                    href="/company/interns"
                />
            </div>

            {/* Bố cục nội dung chính 2 cột */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Cột trái (8 cols): Biểu đồ phễu tuyển dụng & Danh sách vị trí */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Recruitment Funnel Chart */}
                    {applications.length > 0 && (
                        <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                            <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <BarChart2 className="w-4 h-4 text-sky-700" />
                                    Phễu tuyển dụng thực tập sinh CICT
                                </CardTitle>
                                <span className="text-xs text-slate-400 font-medium">Học kỳ 1</span>
                            </CardHeader>
                            <CardContent className="p-5">
                                <RecruitmentFunnelChart
                                    data={funnelData}
                                    title="Tiến trình tuyển chọn từ nộp đơn đến tiếp nhận"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Danh sách vị trí tuyển dụng */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900">
                                    Vị trí thực tập đang công bố ({jobs.length})
                                </CardTitle>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Được thẩm định và hiển thị cho toàn bộ sinh viên Khoa CNTT&TT
                                </p>
                            </div>
                            <Link href="/company/jobs/new">
                                <Button size="sm" className="text-xs rounded-xl bg-cict-navy hover:bg-cict-700 text-white font-bold">
                                    <Plus className="w-3.5 h-3.5 mr-1" />
                                    Đăng tin mới
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-5 pt-3">
                            {loading ? (
                                <div className="py-8 text-center text-xs text-slate-400">Đang tải dữ liệu...</div>
                            ) : jobs.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-400">Chưa có vị trí tuyển dụng nào.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {jobs.map((job) => (
                                        <div 
                                            key={job.id}
                                            className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition px-2 rounded-xl"
                                        >
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold text-slate-900">{job.title}</div>
                                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                                    <span>Chỉ tiêu: <strong>{job.vacancies}</strong></span>
                                                    <span>•</span>
                                                    <span>Hình thức: {job.workFormat || "On-site"}</span>
                                                    <span>•</span>
                                                    <span>Địa điểm: {job.location || "Cần Thơ"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <StatusBadge status={job.status} />
                                                <Link href={`/jobs/${job.id}`}>
                                                    <Button variant="outline" size="sm" className="text-xs rounded-xl font-bold">
                                                        Chi tiết
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

                {/* Cột phải (4 cols): Việc cần làm & AI Insights & Hợp tác */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Thẻ Việc cần làm (To-do) */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900">Việc cần làm</CardTitle>
                            <Link href="/company/candidates" className="text-xs font-bold text-sky-700 hover:underline">
                                Xem ứng viên
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2.5 text-xs">
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Sơ loại CV sinh viên ứng tuyển</div>
                                    <div className="text-[11px] text-slate-500">12 hồ sơ mới tuần này</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Xác nhận kết quả phỏng vấn</div>
                                    <div className="text-[11px] text-slate-500">Gửi kết quả trước Thứ Sáu</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <div className="font-bold text-slate-800">Phân công Mentor kèm cặp</div>
                                    <div className="text-[11px] text-slate-500">Đối với TTS đã nhận offer</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Insights Card cho Doanh Nghiệp */}
                    <AcademicAiInsightCard
                        title="AI Talent Matcher"
                        highlightText="Phân tích chất lượng ứng viên:"
                        advice="Hồ sơ ứng viên từ ngành Kỹ thuật Phần mềm & Hệ thống Thông tin có độ tương thích kỹ năng với công ty bạn lên tới 88%. Hãy ưu tiên phỏng vấn các ứng viên có chứng chỉ chuyên môn!"
                        actionHref="/company/ai"
                        actionLabel="Phân tích CV bằng AI"
                    />

                    {/* Quan hệ Hợp tác Đại học Cần Thơ */}
                    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card bg-slate-50/60">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-sky-700" />
                                Hợp Tác Viện - Trường (CICT)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1.5 text-[11px] text-slate-600">
                            <div>Đại diện Khoa CNTT&TT sẵn sàng hỗ trợ thẩm định và tổ chức Career Day tuyển dụng.</div>
                            <div className="pt-2">
                                <Link href="/company/interns" className="text-sky-700 font-bold hover:underline inline-flex items-center gap-1">
                                    Quản lý thực tập sinh & Mentor
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

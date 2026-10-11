"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Briefcase, Users, UserCheck, Plus, CheckCircle2, ChevronRight, Clock, BarChart2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/workflow/components/status-badge";
import { apiClient } from "@/lib/api-client";
import { RecruitmentFunnelChart, type FunnelStageData } from "@/components/ui/charts";

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

    return (
        <div className="space-y-6">
            {/* Header Greeting */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Cổng Tuyển Dụng Doanh Nghiệp
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Xin chào <strong>{user?.fullName}</strong> • Tiếp nhận & Đào tạo Thực tập sinh CICT - CTU
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/company/jobs">
                        <Button variant="default" size="sm" className="text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Đăng vị trí tuyển dụng mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">{jobs.length}</div>
                            <div className="text-xs text-slate-500">Tổng tin tuyển dụng</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-indigo-700">{funnelData.interviewing}</div>
                            <div className="text-xs text-slate-500">Ứng viên đang phỏng vấn</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-emerald-700">
                                {funnelData.offered}
                            </div>
                            <div className="text-xs text-slate-500">Offer đã phát hành</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">
                                {jobs.reduce((sum, j) => sum + (j.vacancies || 0), 0)}
                            </div>
                            <div className="text-xs text-slate-500">Tổng chỉ tiêu tiếp nhận (SV)</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel Chart Section */}
            {applications.length > 0 && (
                <RecruitmentFunnelChart
                    data={funnelData}
                    title="Tiến trình tuyển dụng & Phỏng vấn ứng viên"
                />
            )}

            {/* Recruitment Positions Table */}
            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Danh sách vị trí thực tập</CardTitle>
                    <Link href="/company/jobs" className="text-xs text-sky-700 font-semibold hover:underline">
                        Quản lý tuyển dụng
                    </Link>
                </CardHeader>
                <CardContent className="pt-2">
                    {loading ? (
                        <div className="py-6 text-center text-xs text-slate-400">Đang tải dữ liệu...</div>
                    ) : jobs.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">Chưa có vị trí tuyển dụng nào.</div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map(job => (
                                <div 
                                    key={job.id}
                                    className="p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                                >
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-900">{job.title}</div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                            <span>Chỉ tiêu: {job.vacancies}</span>
                                            <span>•</span>
                                            <span>Hình thức: {job.workFormat}</span>
                                            <span>•</span>
                                            <span>Địa điểm: {job.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={job.status} />
                                        <Link href={`/jobs/${job.id}`}>
                                            <Button variant="outline" size="sm" className="text-xs">
                                                Xem tin
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

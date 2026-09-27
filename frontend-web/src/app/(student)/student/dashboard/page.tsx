"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { 
    Briefcase, Calendar, CheckCircle2, Clock, FileText, 
    ArrowRight, AlertCircle, BookOpen, User, Send, ChevronRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient } from "@/lib/api-client";

export default function StudentDashboardPage() {
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

    return (
        <div className="space-y-6">
            {/* Header Greeting */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Xin chào, {user?.fullName || "Sinh viên"}!
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Cổng Quản lý Thực tập Tốt nghiệp • Trường CNTT&TT - ĐH Cần Thơ
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/jobs">
                        <Button variant="default" size="sm" className="text-xs">
                            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                            Tìm kiếm vị trí thực tập
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link href="/student/profile" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-xs transition-all h-full">
                        <CardContent className="p-5 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition">
                                    Hồ sơ & CV
                                </div>
                                <div className="text-[11px] text-slate-500">Cập nhật kỹ năng</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/student/applications" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-xs transition-all h-full">
                        <CardContent className="p-5 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                                <Send className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition">
                                    Đơn ứng tuyển ({applications.length})
                                </div>
                                <div className="text-[11px] text-slate-500">Tiến độ phỏng vấn</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/student/learning-agreement" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-xs transition-all h-full">
                        <CardContent className="p-5 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition">
                                    Thỏa thuận 3 bên
                                </div>
                                <div className="text-[11px] text-slate-500">Xác nhận tiếp nhận</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/student/weekly-logs" className="block group">
                    <Card className="hover:border-sky-300 hover:shadow-xs transition-all h-full">
                        <CardContent className="p-5 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition">
                                    Nhật ký tuần
                                </div>
                                <div className="text-[11px] text-slate-500">Nộp báo cáo Weekly Log</div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Main Dashboard Rows */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Current Internship Status / Applications */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Internship Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-sky-700" />
                                    Tình trạng thực tập hiện tại
                                </CardTitle>
                                {placement ? (
                                    <StatusBadge status={placement.status || "ACTIVE"} />
                                ) : acceptedApp ? (
                                    <StatusBadge status="ACCEPTED" customLabel="Đã trúng tuyển - Chờ kích hoạt" />
                                ) : (
                                    <span className="text-xs text-slate-400 font-medium">Đang tìm kiếm nơi thực tập</span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {placement ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                                        <div className="font-bold text-slate-900 text-sm">{placement.jobTitle || "Thực tập sinh"}</div>
                                        <div className="text-slate-600">Đơn vị tiếp nhận: <strong>{placement.companyName}</strong></div>
                                        <div className="text-slate-500">Cán bộ hướng dẫn (Mentor): <strong>{placement.mentorName || "Đang phân công"}</strong></div>
                                        <div className="text-slate-500">Giảng viên hướng dẫn (GVHD): <strong>{placement.lecturerName || "Đang phân công"}</strong></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <span className="text-slate-500">Tiến độ hoàn thành:</span>
                                        <span className="font-bold text-sky-700">{placement.completedWeeks || 0} / 15 tuần</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-sky-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, ((placement.completedWeeks || 1) / 15) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ) : acceptedApp ? (
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-3">
                                    <div className="text-xs text-emerald-900 font-semibold">
                                        Chúc mừng! Bạn đã trúng tuyển vị trí <strong>{acceptedApp.jobTitle}</strong> tại <strong>{acceptedApp.companyName}</strong>.
                                    </div>
                                    <p className="text-xs text-emerald-800">
                                        Vui lòng truy cập mục <strong>Thỏa thuận 3 bên</strong> để ký xác nhận Thỏa thuận học tập trước khi bắt đầu học kỳ thực tập.
                                    </p>
                                    <Link href="/student/learning-agreement">
                                        <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs">
                                            Ký Thỏa thuận học tập
                                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-6 text-center space-y-3">
                                    <p className="text-xs text-slate-500">
                                        Bạn chưa có nơi thực tập chính thức. Hãy khám phá các vị trí tuyển dụng được thẩm định bởi Khoa CNTT&TT.
                                    </p>
                                    <Link href="/jobs">
                                        <Button variant="default" size="sm" className="text-xs">
                                            Xem vị trí tuyển dụng mở
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Applications List */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold">Đơn ứng tuyển gần đây</CardTitle>
                                <Link href="/student/applications" className="text-xs font-semibold text-sky-700 hover:underline">
                                    Xem tất cả
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {applications.length === 0 ? (
                                <div className="py-6 text-center text-xs text-slate-400">
                                    Chưa có đơn ứng tuyển nào.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {applications.slice(0, 3).map((app) => (
                                        <div 
                                            key={app.id}
                                            className="p-3.5 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50/50 transition"
                                        >
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold text-slate-800">{app.jobTitle}</div>
                                                <div className="text-[11px] text-slate-500">{app.companyName}</div>
                                            </div>
                                            <StatusBadge status={app.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Reminders & Term Information */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-amber-600" />
                                Mốc thời gian học kỳ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                                <div className="font-bold text-amber-900">Hạn nộp hồ sơ đợt 1</div>
                                <div className="text-amber-700">30/11/2026 (còn 64 ngày)</div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                <div className="font-bold text-slate-800">Thời gian thực tập chính thức</div>
                                <div className="text-slate-600">15/12/2026 - 30/03/2027 (15 tuần)</div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                <div className="font-bold text-slate-800">Hạn nộp báo cáo nghiệm thu</div>
                                <div className="text-slate-600">05/04/2027</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Support Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-sky-700" />
                                Hỗ trợ sinh viên
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs text-slate-600">
                            <p>Ban Quản lý Thực tập Khoa CNTT&TT - ĐH Cần Thơ</p>
                            <p className="text-slate-500">Email: cict@ctu.edu.vn</p>
                            <p className="text-slate-500">Điện thoại: (0292) 3831 301</p>
                            <div className="pt-2">
                                <Link href="/cam-nang" className="text-sky-700 font-semibold hover:underline inline-flex items-center gap-1">
                                    Đọc cẩm nang thực tập
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

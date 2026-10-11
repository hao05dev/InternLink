'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar, Users, ClipboardCheck, Building2, CheckSquare, Layers,
    GraduationCap, TrendingUp, ArrowRight, BookOpen, BarChart3, Award
} from 'lucide-react';
import { CtuGradeChart, CloAchievementChart, type CloMetricItem } from '@/components/ui/charts';

type Term = { id: string; code: string; termName: string; academicYear: string; status: string };

interface CloReportData {
    termId: string;
    termCode: string;
    termName: string;
    totalPlacements: number;
    evaluatedPlacements: number;
    passedPlacements: number;
    overallPassRate: number;
    averageFinalScore: number;
    letterGradeDistribution: Record<string, number>;
    cloMetrics: CloMetricItem[];
}

const NAV_ITEMS = [
    {
        label: 'Kỳ thực tập (Terms)',
        description: 'Tạo và quản lý các kỳ thực tập của khoa',
        href: '/faculty/terms',
        icon: Calendar,
        color: 'bg-sky-100 text-sky-700',
        border: 'border-sky-200 hover:border-sky-400',
    },
    {
        label: 'Danh sách sinh viên',
        description: 'Import, xem và quản lý roster sinh viên đăng ký thực tập',
        href: '/faculty/roster',
        icon: Users,
        color: 'bg-violet-100 text-violet-700',
        border: 'border-violet-200 hover:border-violet-400',
    },
    {
        label: 'Quản lý tiến trình thực tập',
        description: 'Xác nhận nhận giấy giới thiệu và công ty chấp nhận sinh viên',
        href: '/faculty/internship-management',
        icon: ClipboardCheck,
        color: 'bg-indigo-100 text-indigo-700',
        border: 'border-indigo-200 hover:border-indigo-400',
        highlight: true,
    },
    {
        label: 'Thẩm định doanh nghiệp',
        description: 'Duyệt và xác minh hồ sơ doanh nghiệp đăng ký',
        href: '/faculty/companies',
        icon: Building2,
        color: 'bg-amber-100 text-amber-700',
        border: 'border-amber-200 hover:border-amber-400',
    },
    {
        label: 'Duyệt tin tuyển dụng',
        description: 'Phê duyệt vị trí thực tập do doanh nghiệp đăng',
        href: '/faculty/job-approvals',
        icon: CheckSquare,
        color: 'bg-emerald-100 text-emerald-700',
        border: 'border-emerald-200 hover:border-emerald-400',
    },
    {
        label: 'Phân công GVHD',
        description: 'Giao giảng viên hướng dẫn cho sinh viên',
        href: '/faculty/assignments',
        icon: Layers,
        color: 'bg-rose-100 text-rose-700',
        border: 'border-rose-200 hover:border-rose-400',
    },
];

const TERM_STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'brand' | 'secondary' | 'outline' }> = {
    ACTIVE: { label: 'Đang hoạt động', variant: 'success' },
    REGISTRATION_OPEN: { label: 'Đang mở đăng ký', variant: 'brand' },
    APPLICATION_OPEN: { label: 'Đang nhận hồ sơ', variant: 'brand' },
    EVALUATING: { label: 'Đang đánh giá', variant: 'warning' },
    DRAFT: { label: 'Nháp', variant: 'secondary' },
    CLOSED: { label: 'Đã kết thúc', variant: 'outline' },
};

export default function FacultyDashboardView() {
    const { user } = useAuth();
    const [terms, setTerms] = useState<Term[]>([]);
    const [cloReport, setCloReport] = useState<CloReportData | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.departmentId) return;
        apiClient.get<Term[]>(`/api/v1/terms/by-department/${user.departmentId}`)
            .then(result => {
                const termsData = result.data ?? [];
                setTerms(termsData);

                const active = termsData.find(t => t.status === 'ACTIVE' || t.status === 'EVALUATING' || t.status === 'REGISTRATION_OPEN' || t.status === 'APPLICATION_OPEN') || termsData[0];
                if (active) {
                    apiClient.get<CloReportData>(`/api/v1/evaluations/clo-report/term/${active.id}`)
                        .then(reportRes => setCloReport(reportRes.data ?? null))
                        .catch(() => setCloReport(null));
                }
            })
            .catch(reason => setError(reason instanceof Error ? reason.message : 'Không tải được kỳ thực tập.'));
    }, [user?.departmentId]);

    const activeTerm = terms.find(t => t.status === 'ACTIVE' || t.status === 'REGISTRATION_OPEN' || t.status === 'APPLICATION_OPEN');

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-br from-sky-700 to-indigo-800 p-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Xin chào, {user?.fullName}!</h1>
                        <p className="text-sky-100 text-sm mt-0.5">
                            Ban Quản lý Thực tập · Khoa CNTT&TT · Đại học Cần Thơ
                        </p>
                        {activeTerm && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Kỳ đang hoạt động: {activeTerm.termName} ({activeTerm.academicYear})
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && <p role="alert" className="text-rose-700 text-sm">{error}</p>}

            {/* Analytics & Charts Section */}
            {cloReport && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-sky-600" />
                            Phân tích kết quả & Chuẩn đầu ra ({cloReport.termName || cloReport.termCode})
                        </h2>
                        <Link href="/faculty/evaluations" className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1">
                            Xem chi tiết bảng điểm <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Summary KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium">Tổng thực tập sinh</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{cloReport.totalPlacements}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium">Đã tổng kết điểm</p>
                            <p className="text-xl font-bold text-indigo-600 mt-1">{cloReport.evaluatedPlacements}</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium">Tỷ lệ hoàn thành (Đạt)</p>
                            <p className="text-xl font-bold text-emerald-600 mt-1">{cloReport.overallPassRate}%</p>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium">Điểm TB toàn kỳ</p>
                            <p className="text-xl font-bold text-amber-600 mt-1">{cloReport.averageFinalScore?.toFixed(2) ?? '—'} / 10</p>
                        </div>
                    </div>

                    {/* 2 Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <CtuGradeChart
                            data={cloReport.letterGradeDistribution || {}}
                            totalEvaluated={cloReport.evaluatedPlacements}
                            title="Phổ điểm chữ chuẩn CTU (A, B+, B, C+, C, D+, D, F)"
                        />
                        <CloAchievementChart
                            metrics={cloReport.cloMetrics || []}
                            targetThreshold={70.0}
                            title="Tỷ lệ đạt Chuẩn đầu ra (CLO Attainment Rate)"
                        />
                    </div>
                </div>
            )}

            {/* Quick Action Cards */}
            <div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                    Chức năng quản lý
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Card className={`h-full border-2 ${item.border} transition-all hover:shadow-md group ${item.highlight ? 'bg-indigo-50/40' : ''}`}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                                                    {item.highlight && (
                                                        <Badge variant="brand" className="text-[9px] px-1.5 py-0.5">Mới</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0 mt-0.5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Terms List */}
            <div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    Các kỳ thực tập của khoa
                </h2>
                {terms.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">Chưa có kỳ thực tập nào được tạo.</p>
                            <Link href="/faculty/terms" className="inline-block mt-3 text-xs font-semibold text-sky-600 hover:underline">
                                Tạo kỳ thực tập đầu tiên →
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {terms.map(term => {
                            const statusInfo = TERM_STATUS_MAP[term.status] || { label: term.status, variant: 'secondary' as const };
                            return (
                                <Link key={term.id} href="/faculty/terms">
                                    <Card className="hover:border-sky-300 transition-colors hover:shadow-sm group">
                                        <CardContent className="p-4 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">{term.termName}</p>
                                                    <p className="text-xs text-slate-500">{term.code} · Năm học {term.academicYear}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={statusInfo.variant} className="text-[10px]">{statusInfo.label}</Badge>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

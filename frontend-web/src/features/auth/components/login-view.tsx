"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    Building2,
    Mail,
    Lock,
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Briefcase,
    School,
    ShieldCheck
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { PublicShell } from "@/components/layouts/public-shell";

type TabType = "school" | "company";

interface TestAccount {
    label: string;
    email: string;
    role: string;
    category: TabType;
    description: string;
}

const TEST_ACCOUNTS: TestAccount[] = [
    {
        label: "Sinh viên",
        email: "b2110940@student.ctu.edu.vn",
        role: "STUDENT",
        category: "school",
        description: "Ứng tuyển, nộp kế hoạch & viết nhật ký tuần",
    },
    {
        label: "GVHD",
        email: "gvhd.son@ctu.edu.vn",
        role: "LECTURER",
        category: "school",
        description: "Theo dõi thực tập & đánh giá chấm điểm",
    },
    {
        label: "BQL Khoa",
        email: "qltt.cict@ctu.edu.vn",
        role: "FACULTY_ADMIN",
        category: "school",
        description: "Phân công GVHD, duyệt đối tác & quản lý đợt",
    },
    {
        label: "Quản trị viên",
        email: "admin.cict@ctu.edu.vn",
        role: "ADMIN",
        category: "school",
        description: "Quản trị phân quyền & cấu hình hệ thống",
    },
    {
        label: "Đại diện Doanh nghiệp",
        email: "tuyendung.fptct@fpt.com",
        role: "COMPANY_REP",
        category: "company",
        description: "Đăng tin tuyển dụng & tiếp nhận thực tập sinh",
    },
    {
        label: "Cán bộ Hướng dẫn (Mentor)",
        email: "mentor.nam@fpt.com",
        role: "COMPANY_MENTOR",
        category: "company",
        description: "Xác nhận nhật ký tuần & chấm điểm DN",
    },
];

export default function LoginView() {
    const router = useRouter();
    const { login } = useAuth();

    const [activeTab, setActiveTab] = useState<TabType>("school");
    const [email, setEmail] = useState("b2110940@student.ctu.edu.vn");
    const [password, setPassword] = useState("Password@123");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDemoAccounts, setShowDemoAccounts] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const authData = await login({ email: email.trim(), password });
            const roleRedirects: Record<string, string> = {
                STUDENT: "/student/dashboard",
                COMPANY_REP: "/company/dashboard",
                COMPANY_MENTOR: "/mentor/dashboard",
                FACULTY_ADMIN: "/faculty/dashboard",
                LECTURER: "/lecturer/dashboard",
                ADMIN: "/admin/dashboard",
            };
            const targetUrl = roleRedirects[authData.role] || "/";
            router.push(targetUrl);
        } catch (err: any) {
            if (err instanceof ApiError) {
                setErrorMsg(err.message || "Tài khoản hoặc mật khẩu không chính xác");
            } else {
                setErrorMsg(err?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setErrorMsg(null);
        // Pre-fill primary test account for the selected tab for seamless testing
        if (tab === "company") {
            setEmail("tuyendung.fptct@fpt.com");
            setPassword("Password@123");
        } else {
            setEmail("b2110940@student.ctu.edu.vn");
            setPassword("Password@123");
        }
    };

    const handleSelectTestAccount = (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword("Password@123");
        setErrorMsg(null);
    };

    const handleQuickLogin = async (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword("Password@123");
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const authData = await login({ email: demoEmail, password: "Password@123" });
            const roleRedirects: Record<string, string> = {
                STUDENT: "/student/dashboard",
                COMPANY_REP: "/company/dashboard",
                COMPANY_MENTOR: "/mentor/dashboard",
                FACULTY_ADMIN: "/faculty/dashboard",
                LECTURER: "/lecturer/dashboard",
                ADMIN: "/admin/dashboard",
            };
            const targetUrl = roleRedirects[authData.role] || "/";
            router.push(targetUrl);
        } catch (err: any) {
            if (err instanceof ApiError) {
                setErrorMsg(err.message || "Tài khoản hoặc mật khẩu không chính xác");
            } else {
                setErrorMsg(err?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const currentTabAccounts = TEST_ACCOUNTS.filter((acc) => acc.category === activeTab);

    return (
        <PublicShell>
            <div className="min-h-[calc(100vh-8rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200/80 bg-white shadow-xl overflow-hidden">
                    {/* Left Branding Showcase */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-cict-dark via-cict-navy to-sky-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative space-y-6">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-200 hover:text-white transition"
                            >
                                <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
                            </Link>

                            <div className="space-y-3 pt-2">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                                    {activeTab === "school" ? (
                                        <GraduationCap className="w-7 h-7 text-sky-300" />
                                    ) : (
                                        <Building2 className="w-7 h-7 text-sky-300" />
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                    InternLink
                                </h1>
                                <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                                    {activeTab === "school"
                                        ? "Cổng thông tin quản lý và theo dõi học phần thực tập doanh nghiệp dành cho Nhà trường"
                                        : "Nền tảng kết nối tuyển dụng, tiếp nhận và quản lý thực tập sinh dành cho Doanh nghiệp"}
                                </p>
                            </div>

                            {/* Core Pillars based on active tab */}
                            <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-200">
                                {activeTab === "school" ? (
                                    <>
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                                            <span>Tìm kiếm và ứng tuyển vị trí thực tập phù hợp</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Ký kết và số hóa thỏa thuận đào tạo 3 bên</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span>Ghi nhận nhật ký tuần và báo cáo tiến độ trực tuyến</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                                            <span>Theo dõi đánh giá từ GVHD và hoàn tất học phần</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                                            <span>Đăng tin tuyển dụng và tiếp cận sinh viên tiềm năng</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>Xác thực và ký thỏa thuận hợp tác đào tạo</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span>Phân công Mentor theo dõi & duyệt nhật ký công việc</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                                            <span>Đánh giá kết quả thực tập theo tiêu chuẩn doanh nghiệp</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="relative pt-8 text-[11px] text-sky-200/70 border-t border-white/10 mt-8 flex items-center justify-between">
                            <span>Học phần Thực tập Doanh nghiệp</span>
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-sky-300" /> Hệ thống CICT - CTU
                            </span>
                        </div>
                    </div>

                    {/* Right Login Form */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Đăng nhập hệ thống
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {activeTab === "school"
                                        ? "Đăng nhập dành cho Sinh viên, Giảng viên và Ban Quản lý Khoa"
                                        : "Đăng nhập dành cho Đại diện Doanh nghiệp và Cán bộ hướng dẫn (Mentor)"}
                                </p>
                            </div>

                            {/* 2 Tabs: Cho Trường & Cho Doanh Nghiệp */}
                            <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("school")}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                        activeTab === "school"
                                            ? "bg-white text-sky-900 shadow-xs border border-slate-200/70"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                    }`}
                                >
                                    <School className={`w-4 h-4 ${activeTab === "school" ? "text-sky-600" : "text-slate-400"}`} />
                                    <span>Cho Nhà trường</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("company")}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                        activeTab === "company"
                                            ? "bg-white text-blue-900 shadow-xs border border-slate-200/70"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                    }`}
                                >
                                    <Briefcase className={`w-4 h-4 ${activeTab === "company" ? "text-blue-600" : "text-slate-400"}`} />
                                    <span>Cho Doanh nghiệp</span>
                                </button>
                            </div>

                            {/* Test Accounts disclosure (Filtered by active tab) */}
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Tài khoản kiểm thử nhanh ({activeTab === "school" ? "Nhà trường" : "Doanh nghiệp"})
                                    </span>
                                    {showDemoAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {showDemoAccounts && (
                                    <div className="p-3.5 pt-1 border-t border-slate-200/60 space-y-2.5">
                                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                                            <span>Nhấn để chọn và tự động đăng nhập:</span>
                                            <span className="font-mono text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600">MK: Password@123</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {currentTabAccounts.map((acc) => (
                                                <div
                                                    key={acc.role}
                                                    onClick={() => handleSelectTestAccount(acc.email)}
                                                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                                                        email === acc.email
                                                            ? "bg-sky-50/90 text-sky-950 border-sky-400 shadow-2xs ring-1 ring-sky-300"
                                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-slate-900">{acc.label}</span>
                                                            <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                                                                {acc.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                            {acc.description}
                                                        </p>
                                                        <span className="text-[10px] font-mono text-slate-400 block mt-1 truncate">
                                                            {acc.email}
                                                        </span>
                                                    </div>
                                                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleQuickLogin(acc.email);
                                                            }}
                                                            className="text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-100/70 hover:bg-sky-200/80 px-2.5 py-1 rounded-lg transition"
                                                        >
                                                            Đăng nhập ngay →
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Alert */}
                            {errorMsg && (
                                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        {activeTab === "school"
                                            ? "Email tài khoản trường (@ctu.edu.vn)"
                                            : "Email tài khoản doanh nghiệp"}
                                    </label>
                                    <Input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={
                                            activeTab === "school"
                                                ? "b21xxxxx@student.ctu.edu.vn hoặc gvhd@ctu.edu.vn"
                                                : "tuyendung@company.com hoặc mentor@company.com"
                                        }
                                        leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Mật khẩu
                                        </label>
                                    </div>
                                    <Input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={isLoading}
                                        className="w-full justify-center text-xs sm:text-sm py-3 font-bold rounded-full bg-slate-950 hover:bg-slate-900 text-white shadow-md cursor-pointer gap-2"
                                    >
                                        <span>
                                            Đăng nhập {activeTab === "school" ? "Nhà trường" : "Doanh nghiệp"}
                                        </span>
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Footer Help */}
                        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1.5">
                            {activeTab === "school" ? (
                                <p>
                                    Cần hỗ trợ về quy trình hoặc tài khoản sinh viên/giảng viên?{" "}
                                    <Link href="/cam-nang" className="text-sky-700 font-semibold hover:underline">
                                        Xem Cẩm nang hướng dẫn
                                    </Link>
                                </p>
                            ) : (
                                <p>
                                    Doanh nghiệp chưa có tài khoản hoặc cần kết nối hợp tác?{" "}
                                    <Link href="/doanh-nghiep" className="text-sky-700 font-semibold hover:underline">
                                        Tìm hiểu cổng hợp tác Doanh nghiệp
                                    </Link>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicShell>
    );
}

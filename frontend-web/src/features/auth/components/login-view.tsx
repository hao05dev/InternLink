"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { PublicShell } from "@/components/layouts/public-shell";

export default function LoginView() {
    const router = useRouter();
    const { login, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSelectTestAccount = (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword("Password@123");
        setErrorMsg(null);
    };

    return (
        <PublicShell>
            <div className="min-h-[calc(100vh-8rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200/80 bg-white shadow-xl overflow-hidden">
                    {/* Left Branding Showcase (5 cols on lg) */}
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
                                    <GraduationCap className="w-7 h-7 text-sky-300" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                    InternLink CICT • CTU
                                </h1>
                                <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                                    Cổng Quản lý Toàn trình Thực tập & Tuyển dụng Doanh nghiệp trực thuộc Trường CNTT&TT — Đại học Cần Thơ.
                                </p>
                            </div>

                            {/* Core Pillars */}
                            <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-slate-200">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                                    <span>Quy trình 12 bước chuẩn hóa 3 bên</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span>Ký kết Thỏa thuận 3 bên số hóa</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span>Nhật ký tuần & Đánh giá Rubric / CLO</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                                    <span>Đối sánh kỹ năng AI Matching</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative pt-8 text-[11px] text-sky-200/70 border-t border-white/10 mt-8">
                            © 2026 Trường Công nghệ Thông tin & Truyền thông — ĐH Cần Thơ
                        </div>
                    </div>

                    {/* Right Login Form & Quick Role Fill (7 cols on lg) */}
                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Đăng Nhập Hệ Thống
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Sử dụng tài khoản CTU hoặc tài khoản doanh nghiệp đã được kích hoạt
                                </p>
                            </div>

                            {/* Quick Test Accounts Switcher */}
                            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/70 space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-sky-900">
                                    <span>Chọn nhanh tài khoản kiểm thử (Demo 1-Click):</span>
                                    <span className="text-[10px] font-normal text-sky-700">MK: Password@123</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { label: "Sinh viên", email: "b2110940@student.ctu.edu.vn", role: "STUDENT" },
                                        { label: "GVHD", email: "gvhd.son@ctu.edu.vn", role: "LECTURER" },
                                        { label: "BQL Khoa", email: "qltt.cict@ctu.edu.vn", role: "FACULTY_ADMIN" },
                                        { label: "Tuyển dụng", email: "tuyendung.fptct@fpt.com", role: "COMPANY_REP" },
                                        { label: "Mentor", email: "mentor.nam@fpt.com", role: "COMPANY_MENTOR" },
                                        { label: "Quản trị", email: "admin.cict@ctu.edu.vn", role: "ADMIN" },
                                    ].map((acc) => (
                                        <button
                                            key={acc.role}
                                            type="button"
                                            onClick={() => handleSelectTestAccount(acc.email)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                                                email === acc.email
                                                    ? "bg-sky-700 text-white border-sky-700 shadow-2xs"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-sky-100/60 hover:text-sky-800"
                                            }`}
                                        >
                                            {acc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Email tài khoản
                                    </label>
                                    <Input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@ctu.edu.vn hoặc email doanh nghiệp"
                                        leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold text-slate-700">
                                            Mật khẩu
                                        </label>
                                        <a href="#" className="text-[11px] font-semibold text-sky-700 hover:underline">
                                            Quên mật khẩu?
                                        </a>
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
                                        className="w-full justify-center text-xs sm:text-sm py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                                    >
                                        Đăng nhập hệ thống
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
                            <p>
                                Doanh nghiệp mới chưa có tài khoản?{" "}
                                <Link href="/doanh-nghiep" className="text-sky-700 font-bold hover:underline">
                                    Đăng ký liên kết
                                </Link>
                            </p>
                            <p>
                                Sinh viên cần trợ giúp tài khoản?{" "}
                                <Link href="/cam-nang" className="text-sky-700 font-bold hover:underline">
                                    Xem hướng dẫn cẩm nang
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicShell>
    );
}

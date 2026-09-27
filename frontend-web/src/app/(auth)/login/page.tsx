"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
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
            await login({ email: email.trim(), password });
            // Sau khi đăng nhập thành công, chuyển hướng về trang chủ
            router.push("/");
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

    return (
        <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
                    </Link>

                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Đăng Nhập Hệ Thống</h2>
                            <p className="text-xs text-slate-500">Cổng Thực Tập & Tuyển Dụng Doanh Nghiệp</p>
                        </div>
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
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Email tài khoản
                        </label>
                        <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@ctu.edu.vn hoặc email doanh nghiệp"
                            leftIcon={<Mail className="w-4 h-4" />}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700">
                                Mật khẩu
                            </label>
                            <a href="#" className="text-[11px] text-blue-600 hover:underline">
                                Quên mật khẩu?
                            </a>
                        </div>
                        <Input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            leftIcon={<Lock className="w-4 h-4" />}
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                            className="w-full justify-center text-sm py-2.5"
                        >
                            Đăng nhập
                        </Button>
                    </div>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
                    <p>
                        Doanh nghiệp mới chưa có tài khoản?{" "}
                        <Link href="/register-company" className="text-blue-600 font-semibold hover:underline">
                            Đăng ký liên kết
                        </Link>
                    </p>
                    <p>
                        Sinh viên cần kích hoạt tài khoản?{" "}
                        <Link href="/claim-student" className="text-blue-600 font-semibold hover:underline">
                            Kích hoạt theo mã số sinh viên
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

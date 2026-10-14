"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Lock, AlertCircle, School, Briefcase, Clock, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LoginTabType } from "./login-branding-panel";

interface LoginFormCardProps {
    activeTab: LoginTabType;
    onTabChange: (tab: LoginTabType) => void;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    errorMsg: string | null;
    retryAfterSeconds?: number;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export function LoginFormCard({
    activeTab,
    onTabChange,
    email,
    setEmail,
    password,
    setPassword,
    errorMsg,
    retryAfterSeconds = 0,
    isLoading,
    onSubmit,
}: LoginFormCardProps) {
    const [secondsLeft, setSecondsLeft] = useState(retryAfterSeconds);

    useEffect(() => {
        setSecondsLeft(retryAfterSeconds);
    }, [retryAfterSeconds]);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    const formatRemainingTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const isLocked = secondsLeft > 0;

    return (
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

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1.5">
                <button
                    type="button"
                    onClick={() => onTabChange("school")}
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
                    onClick={() => onTabChange("company")}
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

            {/* Error & Lockout Alert */}
            {errorMsg && (
                <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                    isLocked 
                        ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs" 
                        : "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                    {isLocked ? (
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    )}
                    <div className="space-y-1">
                        <span className="font-medium leading-relaxed block">{errorMsg}</span>
                        {isLocked && (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded text-[11px]">
                                <Clock className="w-3.5 h-3.5" /> Thử lại sau: {formatRemainingTime(secondsLeft)}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {activeTab === "school"
                            ? "Email tài khoản trường (@ctu.edu.vn)"
                            : "Email tài khoản doanh nghiệp"}
                    </label>
                    <Input
                        type="email"
                        required
                        disabled={isLocked || isLoading}
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Mật khẩu
                    </label>
                    <Input
                        type="password"
                        required
                        disabled={isLocked || isLoading}
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
                        disabled={isLocked}
                        className="w-full justify-center text-xs sm:text-sm py-3 font-bold rounded-full bg-slate-950 hover:bg-slate-900 text-white shadow-md cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>
                            {isLocked
                                ? `Tài khoản tạm khóa (${formatRemainingTime(secondsLeft)})`
                                : `Đăng nhập ${activeTab === "school" ? "Nhà trường" : "Doanh nghiệp"}`}
                        </span>
                    </Button>
                </div>
            </form>

            {/* Footer Help */}
            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1.5">
                {activeTab === "school" ? (
                    <p>
                        Cần hỗ trợ về quy trình hoặc tài khoản sinh viên/giảng viên?{" "}
                        <Link href="/career-guide" className="text-sky-700 font-semibold hover:underline">
                            Xem Tin tức & Hướng dẫn
                        </Link>
                    </p>
                ) : (
                    <p>
                        Doanh nghiệp chưa có tài khoản hoặc cần kết nối hợp tác?{" "}
                        <Link href="/companies" className="text-sky-700 font-semibold hover:underline">
                            Tìm hiểu cổng hợp tác Doanh nghiệp
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}

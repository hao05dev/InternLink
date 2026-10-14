"use client";

import React from "react";
import Link from "next/link";
import {
    GraduationCap,
    Building2,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck
} from "lucide-react";

export type LoginTabType = "school" | "company";

interface LoginBrandingPanelProps {
    activeTab: LoginTabType;
}

export function LoginBrandingPanel({ activeTab }: LoginBrandingPanelProps) {
    return (
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
    );
}

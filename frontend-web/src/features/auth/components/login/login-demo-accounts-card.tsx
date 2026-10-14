"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LoginTabType } from "./login-branding-panel";

export interface TestAccount {
    label: string;
    email: string;
    role: string;
    category: LoginTabType;
    description: string;
}

export const TEST_ACCOUNTS: TestAccount[] = [
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
        label: "Biên tập viên Blog",
        email: "editor.blog@ctu.edu.vn",
        role: "BLOG_MANAGER",
        category: "school",
        description: "Đăng tải bài viết, quản lý blog & truyền thông",
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

interface LoginDemoAccountsCardProps {
    activeTab: LoginTabType;
    selectedEmail: string;
    onSelectAccount: (email: string) => void;
    onQuickLogin: (email: string) => void;
}

export function LoginDemoAccountsCard({
    activeTab,
    selectedEmail,
    onSelectAccount,
    onQuickLogin,
}: LoginDemoAccountsCardProps) {
    const [showAccounts, setShowAccounts] = useState(true);
    const tabAccounts = TEST_ACCOUNTS.filter((acc) => acc.category === activeTab);

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 overflow-hidden">
            <button
                type="button"
                onClick={() => setShowAccounts(!showAccounts)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Tài khoản kiểm thử nhanh ({activeTab === "school" ? "Nhà trường" : "Doanh nghiệp"})
                </span>
                {showAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAccounts && (
                <div className="p-3.5 pt-1 border-t border-slate-200/60 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Nhấn để chọn và tự động đăng nhập:</span>
                        <span className="font-mono text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600">MK: Password@123</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tabAccounts.map((acc) => (
                            <div
                                key={acc.role}
                                onClick={() => onSelectAccount(acc.email)}
                                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                                    selectedEmail === acc.email
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
                                            onQuickLogin(acc.email);
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
    );
}

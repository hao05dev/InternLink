"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { GraduationCap, LogIn, LogOut, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLE_LABELS: Record<string, string> = {
    STUDENT: "Sinh viên",
    COMPANY_REP: "Doanh nghiệp",
    COMPANY_MENTOR: "Mentor DN",
    LECTURER: "Giảng viên",
    FACULTY_ADMIN: "Ban Quản lý Khoa",
    ADMIN: "Quản trị viên",
};

export function Navbar() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo & Tên Cổng */}
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-black text-slate-900 tracking-tight">InternLink</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                                CICT • CTU
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 hidden sm:block">
                            Cổng Thực Tập & Tuyển Dụng Doanh Nghiệp
                        </p>
                    </div>
                </Link>

                {/* Điều hướng Desktop */}
                <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
                    <a href="#jobs" className="hover:text-blue-600 transition">
                        Vị trí tuyển dụng
                    </a>
                    <a href="#portals" className="hover:text-blue-600 transition">
                        Cổng thông tin
                    </a>
                    <a href="#quy-trinh" className="hover:text-blue-600 transition">
                        Quy trình thực tập
                    </a>
                    <a href="#companies" className="hover:text-blue-600 transition">
                        Doanh nghiệp liên kết
                    </a>
                </nav>

                {/* Khu vực Xác thực & Điều khiển người dùng */}
                <div className="hidden md:flex items-center space-x-4">
                    {isLoading ? (
                        <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-lg" />
                    ) : isAuthenticated && user ? (
                        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="text-left text-xs leading-tight">
                                <p className="font-semibold text-slate-800 line-clamp-1">{user.fullName}</p>
                                <span className="text-[10px] text-blue-600 font-medium">
                                    {ROLE_LABELS[user.role] || user.role}
                                </span>
                            </div>
                            <button
                                onClick={() => logout()}
                                title="Đăng xuất"
                                className="ml-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link href="/login">
                                <Button variant="primary" size="sm" className="gap-1.5">
                                    <LogIn className="w-4 h-4" />
                                    Đăng nhập
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Nút Hamburger Mobile */}
                <div className="flex md:hidden items-center space-x-2">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Menu di động (Mobile Drawer) */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white px-4 pt-3 pb-6 space-y-3">
                    <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
                        <a
                            href="#jobs"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50"
                        >
                            Vị trí tuyển dụng
                        </a>
                        <a
                            href="#portals"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50"
                        >
                            Cổng thông tin
                        </a>
                        <a
                            href="#quy-trinh"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50"
                        >
                            Quy trình thực tập
                        </a>
                        <a
                            href="#companies"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50"
                        >
                            Doanh nghiệp liên kết
                        </a>
                    </nav>

                    <div className="pt-3 border-t">
                        {isAuthenticated && user ? (
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                                <div>
                                    <p className="font-semibold text-sm text-slate-900">{user.fullName}</p>
                                    <p className="text-xs text-blue-600">{ROLE_LABELS[user.role] || user.role}</p>
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        logout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="gap-1 text-xs"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                                </Button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="primary" className="w-full gap-2 justify-center">
                                    <LogIn className="w-4 h-4" /> Đăng nhập hệ thống
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

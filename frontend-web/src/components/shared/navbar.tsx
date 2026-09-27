"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { GraduationCap, LogIn, LogOut, User, Menu, X, ChevronDown, Briefcase, Building2, BookOpen } from "lucide-react";
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
                {/* Logo & Portal Identity */}
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 rounded-xl bg-sky-700 flex items-center justify-center text-white shadow-sm shadow-sky-600/20 group-hover:bg-sky-800 transition">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-black text-slate-900 tracking-tight">InternLink</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                                CICT • CTU
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 hidden sm:block">
                            Cổng Thực Tập & Tuyển Dụng Doanh Nghiệp
                        </p>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
                    <Link href="/jobs" className="hover:text-sky-700 transition flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        Vị trí thực tập
                    </Link>
                    <Link href="/doanh-nghiep" className="hover:text-sky-700 transition flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        Doanh nghiệp liên kết
                    </Link>
                    <Link href="/cam-nang" className="hover:text-sky-700 transition flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        Cẩm nang & Quy chế
                    </Link>
                    <Link href="/#quy-trinh" className="hover:text-sky-700 transition">
                        Quy trình 12 bước
                    </Link>
                </nav>

                {/* User Auth Controls */}
                <div className="hidden md:flex items-center space-x-4">
                    {isLoading ? (
                        <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-lg" />
                    ) : isAuthenticated && user ? (
                        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="text-left text-xs leading-tight">
                                <p className="font-semibold text-slate-800 line-clamp-1">{user.fullName}</p>
                                <span className="text-[10px] text-sky-700 font-medium">
                                    {ROLE_LABELS[user.role] || user.role}
                                </span>
                            </div>
                            <button
                                onClick={() => logout()}
                                title="Đăng xuất"
                                className="ml-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link href="/login">
                                <Button variant="primary" size="sm" className="gap-1.5 bg-sky-700 hover:bg-sky-600 text-white cursor-pointer shadow-sm">
                                    <LogIn className="w-4 h-4" />
                                    Đăng nhập
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center space-x-2">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white px-4 pt-3 pb-6 space-y-3">
                    <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
                        <Link
                            href="/jobs"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                        >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            Vị trí thực tập
                        </Link>
                        <Link
                            href="/doanh-nghiep"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                        >
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Doanh nghiệp liên kết
                        </Link>
                        <Link
                            href="/cam-nang"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            Cẩm nang & Quy chế
                        </Link>
                        <Link
                            href="/#quy-trinh"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50"
                        >
                            Quy trình 12 bước
                        </Link>
                    </nav>

                    <div className="pt-3 border-t">
                        {isAuthenticated && user ? (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-lg">
                                    <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{user.fullName}</p>
                                        <p className="text-xs text-sky-700 font-medium">
                                            {ROLE_LABELS[user.role] || user.role} • {user.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-600 rounded-lg shadow-sm transition"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Đăng nhập hệ thống</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

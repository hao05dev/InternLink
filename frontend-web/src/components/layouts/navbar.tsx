"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { UserRole } from "@/features/auth/types/auth.types";
import {
    GraduationCap,
    LogIn,
    LogOut,
    User,
    Menu,
    X,
    ChevronDown,
    Briefcase,
    Building2,
    BookOpen,
    LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/features/notifications/components/notification-center";

interface RoleNavConfig {
    portalName: string;
    badgeClass: string;
    dashboardLabel: string;
    dashboardHref: string;
    profileHref?: string;
}

const ROLE_NAV_CONFIG: Record<UserRole, RoleNavConfig> = {
    ADMIN: {
        portalName: "Quản trị viên",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        dashboardLabel: "Bảng điều khiển quản trị",
        dashboardHref: "/admin/dashboard",
    },
    FACULTY_ADMIN: {
        portalName: "Ban Quản lý Khoa",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        dashboardLabel: "Cổng quản lý Khoa",
        dashboardHref: "/faculty/dashboard",
    },
    COMPANY_REP: {
        portalName: "Đại diện Doanh nghiệp",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        dashboardLabel: "Bàn làm việc doanh nghiệp",
        dashboardHref: "/company/dashboard",
    },
    COMPANY_MENTOR: {
        portalName: "Mentor Doanh nghiệp",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dashboardLabel: "Bàn làm việc Mentor",
        dashboardHref: "/mentor/dashboard",
    },
    LECTURER: {
        portalName: "Giảng viên",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dashboardLabel: "Bàn làm việc Giảng viên",
        dashboardHref: "/lecturer/dashboard",
    },
    STUDENT: {
        portalName: "Sinh viên",
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
        dashboardLabel: "Bàn làm việc sinh viên",
        dashboardHref: "/student/dashboard",
        profileHref: "/student/profile",
    },
};

export function Navbar() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click or Escape key
    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setDropdownOpen(false);
            }
        }

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [dropdownOpen]);

    const currentRoleConfig = (user?.role && ROLE_NAV_CONFIG[user.role as UserRole]) || null;

    return (
        <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Logo & Portal Identity */}
                <Link href="/" className="flex items-center space-x-3 group shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-700 flex items-center justify-center text-white shadow-sm shadow-sky-600/20 group-hover:bg-sky-800 transition shrink-0">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="shrink-0">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                                InternLink
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 whitespace-nowrap">
                                CICT • CTU
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 hidden lg:block whitespace-nowrap">
                            Cổng Thực tập & Tuyển dụng Doanh nghiệp
                        </p>
                    </div>
                </Link>

                {/* Desktop Navigation - Clean, single-line with icons */}
                <nav className="hidden md:flex items-center space-x-5 lg:space-x-7 text-sm font-medium text-slate-600 shrink-0">
                    <Link
                        href="/jobs"
                        className="hover:text-sky-700 transition flex items-center gap-1.5 whitespace-nowrap py-1"
                    >
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Vị trí tuyển dụng</span>
                    </Link>
                    <Link
                        href="/doanh-nghiep"
                        className="hover:text-sky-700 transition flex items-center gap-1.5 whitespace-nowrap py-1"
                    >
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Doanh nghiệp</span>
                    </Link>
                    <Link
                        href="/cam-nang"
                        className="hover:text-sky-700 transition flex items-center gap-1.5 whitespace-nowrap py-1"
                    >
                        <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Cẩm nang</span>
                    </Link>
                    <Link
                        href="/#quy-trinh"
                        className="hover:text-sky-700 transition whitespace-nowrap py-1"
                    >
                        <span>Quy trình 12 bước</span>
                    </Link>
                </nav>

                {/* User Auth Controls */}
                <div className="hidden md:flex items-center shrink-0">
                    {isLoading ? (
                        <div className="w-9 h-9 bg-slate-100 animate-pulse rounded-full" />
                    ) : isAuthenticated && user ? (
                        <div className="flex items-center gap-2.5">
                            <NotificationCenter />
                            {/* Compact Avatar Button with Minimal Role-Focused Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                type="button"
                                aria-expanded={dropdownOpen}
                                aria-haspopup="true"
                                aria-label="Menu tài khoản"
                                className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-sky-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ring-2 ring-white">
                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "w-3.5 h-3.5 mr-1 text-slate-400 group-hover:text-slate-600 transition-transform duration-200",
                                        dropdownOpen && "rotate-180"
                                    )}
                                />
                            </button>

                            {/* Minimal Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-50 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* User Identity Header */}
                                    <div className="px-4 py-3 bg-gradient-to-b from-slate-50/80 to-white">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-900 truncate" title={user.fullName}>
                                                    {user.fullName}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate" title={user.email}>
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <span
                                                className={cn(
                                                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block",
                                                    currentRoleConfig?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
                                                )}
                                            >
                                                {currentRoleConfig?.portalName || user.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Primary Portal / Dashboard Link */}
                                    <div className="py-1.5">
                                        <Link
                                            href={currentRoleConfig?.dashboardHref || "/"}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition-colors mx-1.5 rounded-lg font-medium group"
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors shrink-0" />
                                            <span className="truncate">
                                                {currentRoleConfig?.dashboardLabel || "Bảng điều khiển"}
                                            </span>
                                        </Link>

                                        {/* Optional Profile link for Student */}
                                        {currentRoleConfig?.profileHref && (
                                            <Link
                                                href={currentRoleConfig.profileHref}
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition-colors mx-1.5 rounded-lg font-medium group"
                                            >
                                                <User className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors shrink-0" />
                                                <span className="truncate">Hồ sơ cá nhân & CV</span>
                                            </Link>
                                        )}
                                    </div>

                                    {/* Logout Action */}
                                    <div className="py-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mx-1.5 rounded-lg font-medium group cursor-pointer text-left"
                                        >
                                            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors shrink-0" />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link href="/login">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="gap-1.5 bg-sky-700 hover:bg-sky-600 text-white cursor-pointer shadow-sm whitespace-nowrap"
                                >
                                    <LogIn className="w-4 h-4 shrink-0" />
                                    <span>Đăng nhập</span>
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button & Notification */}
                <div className="flex md:hidden items-center space-x-1.5">
                    {isAuthenticated && user && <NotificationCenter />}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Mở menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white px-4 pt-3 pb-6 space-y-3">
                    <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-700">
                        <Link
                            href="/jobs"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2.5"
                        >
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>Vị trí tuyển dụng</span>
                        </Link>
                        <Link
                            href="/doanh-nghiep"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2.5"
                        >
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span>Doanh nghiệp</span>
                        </Link>
                        <Link
                            href="/cam-nang"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2.5"
                        >
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span>Cẩm nang</span>
                        </Link>
                        <Link
                            href="/#quy-trinh"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-slate-50"
                        >
                            <span>Quy trình 12 bước</span>
                        </Link>
                    </nav>

                    <div className="pt-3 border-t">
                        {isAuthenticated && user ? (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 px-3 py-2.5 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-sky-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-900 text-sm truncate">{user.fullName}</p>
                                        <p className="text-xs text-sky-700 font-medium truncate">
                                            {currentRoleConfig?.portalName || user.role} • {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Link
                                        href={currentRoleConfig?.dashboardHref || "/"}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-700 font-medium"
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>{currentRoleConfig?.dashboardLabel || "Bảng điều khiển"}</span>
                                    </Link>
                                    {currentRoleConfig?.profileHref && (
                                        <Link
                                            href={currentRoleConfig.profileHref}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-700 font-medium"
                                        >
                                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span>Hồ sơ cá nhân & CV</span>
                                        </Link>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition cursor-pointer"
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

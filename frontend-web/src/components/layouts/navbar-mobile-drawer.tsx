'use client';

import React from "react";
import Link from "next/link";
import { UserSummary } from "@/features/auth/types/auth.types";
import {
    Briefcase,
    Building2,
    BookOpen,
    HelpCircle,
    LayoutDashboard,
    User,
    LogOut,
    ArrowUpRight,
} from "lucide-react";
import { ROLE_NAV_CONFIG } from "./navbar-types";

interface NavbarMobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
    user: UserSummary | null;
    logout: () => void;
}

export function NavbarMobileDrawer({
    isOpen,
    onClose,
    isAuthenticated,
    user,
    logout,
}: NavbarMobileDrawerProps) {
    if (!isOpen) return null;

    const currentRoleConfig = (user?.role && ROLE_NAV_CONFIG[user.role]) || null;

    return (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-1 text-base font-semibold text-slate-800 dark:text-slate-200">
                <Link
                    href="/jobs"
                    onClick={onClose}
                    className="px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                >
                    <Briefcase className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span>Vị trí tuyển dụng</span>
                </Link>
                <Link
                    href="/companies"
                    onClick={onClose}
                    className="px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                >
                    <Building2 className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span>Doanh nghiệp</span>
                </Link>
                <Link
                    href="/career-guide"
                    onClick={onClose}
                    className="px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                >
                    <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span>Tin tức & Blog</span>
                </Link>
                <Link
                    href="/about"
                    onClick={onClose}
                    className="px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                >
                    <HelpCircle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span>Về Trường (CICT • CTU)</span>
                </Link>
            </nav>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {isAuthenticated && user ? (
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-sky-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{user.fullName}</p>
                                <p className="text-xs text-sky-700 dark:text-sky-400 font-medium truncate">
                                    {currentRoleConfig?.portalName || user.role} • {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Link
                                href={currentRoleConfig?.dashboardHref || "/"}
                                onClick={onClose}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400 font-medium"
                            >
                                <LayoutDashboard className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>{currentRoleConfig?.dashboardLabel || "Bảng điều khiển"}</span>
                            </Link>
                            {currentRoleConfig?.profileHref && (
                                <Link
                                    href={currentRoleConfig.profileHref}
                                    onClick={onClose}
                                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400 font-medium"
                                >
                                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>Hồ sơ cá nhân & CV</span>
                                </Link>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                onClose();
                                logout();
                            }}
                            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold uppercase tracking-wider text-white bg-slate-950 hover:bg-slate-900 rounded-full shadow-md transition-colors"
                    >
                        <span>Đăng nhập hệ thống</span>
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    );
}

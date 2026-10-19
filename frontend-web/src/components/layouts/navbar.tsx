"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
    ArrowUpRight,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavbarUserDropdown } from "./navbar-user-dropdown";
import { NavbarMobileDrawer } from "./navbar-mobile-drawer";

export function Navbar() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200 shadow-2xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-22 flex items-center justify-between gap-4">
                {/* 1. BRAND LOGO */}
                <Link href="/" className="shrink-0">
                    <BrandLogo showText size={36} textClassName="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 dark:text-slate-100 tracking-tighter transition-colors group-hover:text-sky-700" />
                </Link>

                {/* 2. CENTER FLOATING PILL MENU */}
                <nav className="hidden md:flex items-center gap-1.5 px-4 lg:px-5 py-2 rounded-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-inner transition-colors">
                    <Link
                        href="/jobs"
                        className="px-4 py-2 rounded-full hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 text-[13.5px] lg:text-[15px] font-semibold tracking-tight"
                    >
                        <span>Vị trí tuyển dụng</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                        href="/companies"
                        className="px-4 py-2 rounded-full hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 text-[13.5px] lg:text-[15px] font-semibold tracking-tight"
                    >
                        <span>Doanh nghiệp</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                        href="/career-guide"
                        className="px-4 py-2 rounded-full hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 text-[13.5px] lg:text-[15px] font-semibold tracking-tight"
                    >
                        <span>Tin tức & Blog</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                        href="/about"
                        className="px-4 py-2 rounded-full hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors text-[13.5px] lg:text-[15px] font-semibold tracking-tight"
                    >
                        <span>Về trường</span>
                    </Link>
                </nav>

                {/* 3. RIGHT CONTROLS (DESKTOP) */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    <ThemeToggle />

                    {!isLoading && isAuthenticated && user ? (
                        <div className="flex items-center gap-3">
                            <NotificationCenter />
                            <NavbarUserDropdown user={user} logout={logout} />
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2.5 px-5.5 py-2.5 lg:px-6 lg:py-3 rounded-full bg-slate-950 dark:bg-white hover:bg-slate-900 dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs lg:text-sm font-bold uppercase tracking-wider shadow-md transition-colors duration-200 group cursor-pointer"
                            >
                                <span>Đăng nhập</span>
                                <div className="w-5.5 h-5.5 rounded-full bg-white dark:bg-slate-950 text-slate-950 dark:text-white flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* 4. MOBILE CONTROLS */}
                <div className="flex md:hidden items-center space-x-2">
                    <ThemeToggle />

                    {isAuthenticated && user ? (
                        <>
                            <NotificationCenter />
                            <Link
                                href="/"
                                className="w-9 h-9 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-xs"
                            >
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm"
                        >
                            <span>Đăng nhập</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    )}

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="Mở menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* MOBILE DRAWER */}
            <NavbarMobileDrawer
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                isAuthenticated={isAuthenticated}
                user={user}
                logout={logout}
            />
        </header>
    );
}

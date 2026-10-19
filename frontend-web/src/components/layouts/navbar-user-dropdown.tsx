'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserSummary } from "@/features/auth/types/auth.types";
import { LayoutDashboard, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_NAV_CONFIG } from "./navbar-types";

interface NavbarUserDropdownProps {
    user: UserSummary;
    logout: () => void;
}

export function NavbarUserDropdown({ user, logout }: NavbarUserDropdownProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const currentRoleConfig = (user?.role && ROLE_NAV_CONFIG[user.role]) || null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                type="button"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="Menu tài khoản"
                className="flex items-center gap-1.5 p-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ring-2 ring-white dark:ring-slate-800">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 mr-1 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200",
                        dropdownOpen && "rotate-180"
                    )}
                />
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-1.5 z-50 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Identity Header */}
                    <div className="px-4 py-3 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-800/80 dark:to-slate-900">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate" title={user.fullName}>
                                    {user.fullName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={user.email}>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <span
                                className={cn(
                                    "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block",
                                    currentRoleConfig?.badgeClass || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
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
                            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors mx-1.5 rounded-xl font-medium group"
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
                                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors mx-1.5 rounded-xl font-medium group"
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
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 transition-colors mx-1.5 rounded-xl font-medium group cursor-pointer text-left"
                        >
                            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors shrink-0" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

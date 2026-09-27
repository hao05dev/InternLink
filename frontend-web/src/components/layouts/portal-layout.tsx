"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types/auth";
import { 
    GraduationCap, LogOut, Bell, Menu, X, ChevronRight, User, 
    LayoutDashboard, Briefcase, FileText, CheckSquare, Award, 
    Users, Settings, ShieldCheck, Building2, Calendar, BookOpen, Layers
} from "lucide-react";
import { RoleGuard } from "@/components/layouts/role-guard";
import { cn } from "@/lib/utils";

export interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const PORTAL_NAV_MAP: Record<UserRole, { title: string; subtitle: string; items: NavItem[] }> = {
    STUDENT: {
        title: "Cổng Sinh Viên",
        subtitle: "Trường CNTT&TT - ĐH Cần Thơ",
        items: [
            { label: "Tổng quan", href: "/student/dashboard", icon: LayoutDashboard },
            { label: "Hồ sơ & Kỹ năng", href: "/student/profile", icon: User },
            { label: "Đơn ứng tuyển", href: "/student/applications", icon: Briefcase },
            { label: "Thỏa thuận 3 bên", href: "/student/learning-agreement", icon: FileText },
            { label: "Nhật ký tuần (Logbook)", href: "/student/weekly-logs", icon: CheckSquare },
            { label: "Báo cáo & Kết quả", href: "/student/final-report", icon: Award },
        ],
    },
    COMPANY_REP: {
        title: "Cổng Doanh Nghiệp",
        subtitle: "Đơn vị tiếp nhận thực tập",
        items: [
            { label: "Bàn làm việc", href: "/company/dashboard", icon: LayoutDashboard },
            { label: "Quản lý tuyển dụng", href: "/company/jobs", icon: Briefcase },
            { label: "Hồ sơ ứng viên", href: "/company/candidates", icon: Users },
            { label: "Thực tập sinh & Mentor", href: "/company/interns", icon: Award },
        ],
    },
    COMPANY_MENTOR: {
        title: "Cổng Cán Bộ Hướng Dẫn",
        subtitle: "Mentor Doanh nghiệp",
        items: [
            { label: "Bàn làm việc", href: "/mentor/dashboard", icon: LayoutDashboard },
            { label: "Duyệt nhật ký tuần", href: "/mentor/weekly-evaluations", icon: CheckSquare },
            { label: "Đánh giá kết thúc kỳ", href: "/mentor/final-assessment", icon: Award },
        ],
    },
    FACULTY_ADMIN: {
        title: "Ban Quản Lý Thực Tập",
        subtitle: "Khoa / Trường CNTT&TT",
        items: [
            { label: "Tổng quan học kỳ", href: "/faculty/dashboard", icon: LayoutDashboard },
            { label: "Kỳ thực tập (Terms)", href: "/faculty/terms", icon: Calendar },
            { label: "Roster sinh viên", href: "/faculty/roster", icon: Users },
            { label: "Duyệt tin tuyển dụng", href: "/faculty/job-approvals", icon: CheckSquare },
            { label: "Phân công GVHD", href: "/faculty/assignments", icon: Layers },
        ],
    },
    LECTURER: {
        title: "Cổng Giảng Viên",
        subtitle: "Giảng viên hướng dẫn CICT",
        items: [
            { label: "Bàn làm việc GVHD", href: "/lecturer/dashboard", icon: LayoutDashboard },
            { label: "Theo dõi & Nhận xét", href: "/lecturer/supervision", icon: CheckSquare },
            { label: "Chấm điểm & Báo cáo CLO", href: "/lecturer/grading", icon: Award },
        ],
    },
    ADMIN: {
        title: "Quản Trị Hệ Thống",
        subtitle: "Hệ thống Cổng InternLink",
        items: [
            { label: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
            { label: "Quản lý người dùng", href: "/admin/users", icon: Users },
            { label: "Doanh nghiệp & MOU", href: "/admin/companies", icon: Building2 },
            { label: "Khoa & Ngành đào tạo", href: "/admin/departments", icon: BookOpen },
            { label: "Nhật ký kiểm toán", href: "/admin/audit-logs", icon: ShieldCheck },
        ],
    },
};

export interface PortalLayoutProps {
    portalRole: UserRole;
    children: React.ReactNode;
}

export function PortalLayout({ portalRole, children }: PortalLayoutProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const config = PORTAL_NAV_MAP[portalRole] || PORTAL_NAV_MAP.STUDENT;

    return (
        <RoleGuard allowedRoles={[portalRole]}>
            <div className="min-h-screen bg-slate-50 flex">
                {/* Mobile Backdrop */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-2xs lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="p-5 flex-1 flex flex-col">
                        {/* Logo header */}
                        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-sky-700 flex items-center justify-center text-white shadow-2xs">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-extrabold text-slate-900 text-sm tracking-tight">InternLink</div>
                                    <div className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider">
                                        CICT • CTU
                                    </div>
                                </div>
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Portal Role Badge */}
                        <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-bold text-slate-800">{config.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{config.subtitle}</div>
                        </div>

                        {/* Nav Items */}
                        <nav className="space-y-1 flex-1">
                            {config.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                                            isActive
                                                ? "bg-sky-50 text-sky-800 font-bold border border-sky-200"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4", isActive ? "text-sky-700" : "text-slate-400")} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User profile block & logout */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                                    {user?.fullName?.charAt(0) || "U"}
                                </div>
                                <div className="truncate text-xs">
                                    <div className="font-bold text-slate-800 truncate">{user?.fullName}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => logout()}
                                title="Đăng xuất"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Space */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Topbar */}
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
                                <Link href="/" className="hover:text-sky-700 transition">Cổng thông tin</Link>
                                <span>/</span>
                                <span className="font-semibold text-slate-800">{config.title}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/jobs" className="text-xs font-semibold text-slate-600 hover:text-sky-700 transition hidden sm:inline-block">
                                Xem việc làm thực tập
                            </Link>
                            <Link 
                                href="/login" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    logout();
                                }}
                                className="text-xs text-rose-600 hover:underline font-semibold"
                            >
                                Đăng xuất
                            </Link>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </RoleGuard>
    );
}

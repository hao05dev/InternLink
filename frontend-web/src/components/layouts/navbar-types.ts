import { UserRole } from "@/features/auth/types/auth.types";

export interface RoleNavConfig {
    portalName: string;
    badgeClass: string;
    dashboardLabel: string;
    dashboardHref: string;
    profileHref?: string;
}

export const ROLE_NAV_CONFIG: Record<UserRole, RoleNavConfig> = {
    ADMIN: {
        portalName: "Quản trị viên",
        badgeClass: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        dashboardLabel: "Bảng điều khiển quản trị",
        dashboardHref: "/admin/dashboard",
    },
    FACULTY_ADMIN: {
        portalName: "Ban Quản lý Khoa",
        badgeClass: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        dashboardLabel: "Cổng quản lý Khoa",
        dashboardHref: "/faculty/dashboard",
    },
    COMPANY_REP: {
        portalName: "Đại diện Doanh nghiệp",
        badgeClass: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        dashboardLabel: "Bàn làm việc doanh nghiệp",
        dashboardHref: "/company/dashboard",
    },
    COMPANY_MENTOR: {
        portalName: "Mentor Doanh nghiệp",
        badgeClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        dashboardLabel: "Bàn làm việc Mentor",
        dashboardHref: "/mentor/dashboard",
    },
    LECTURER: {
        portalName: "Giảng viên",
        badgeClass: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        dashboardLabel: "Bàn làm việc Giảng viên",
        dashboardHref: "/lecturer/dashboard",
    },
    STUDENT: {
        portalName: "Sinh viên",
        badgeClass: "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
        dashboardLabel: "Bàn làm việc sinh viên",
        dashboardHref: "/student/dashboard",
        profileHref: "/student/profile",
    },
    BLOG_MANAGER: {
        portalName: "Quản lý Blog & Truyền thông",
        badgeClass: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
        dashboardLabel: "Cổng quản lý Blog",
        dashboardHref: "/blog-manager/posts",
    },
};

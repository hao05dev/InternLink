import type { UserRole } from "@/features/auth/types/auth.types";
import type { PortalRoleConfig } from "./navigation/portal-nav.types";
export type * from "./navigation/portal-nav.types";
export { getFlattenedNavLinks } from "./navigation/portal-nav-utils";
import { studentNav } from "./navigation/student-nav";
import { companyNav } from "./navigation/company-nav";
import { mentorNav } from "./navigation/mentor-nav";
import { facultyNav } from "./navigation/faculty-nav";
import { lecturerNav } from "./navigation/lecturer-nav";
import { adminNav } from "./navigation/admin-nav";
import { blogmanagerNav } from "./navigation/blog-manager-nav";

export const PORTAL_NAV_MAP: Record<UserRole, PortalRoleConfig> = {
  COMPANY_REP: companyNav,
  COMPANY_MENTOR: mentorNav,
  FACULTY_ADMIN: facultyNav,
  BLOG_MANAGER: blogmanagerNav,
  STUDENT: studentNav,
  LECTURER: lecturerNav,
  ADMIN: adminNav,
};

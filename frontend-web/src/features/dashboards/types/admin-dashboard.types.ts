import { UserRole } from "@/features/auth/types/auth.types";
import { AcademicProgram } from "@/features/organization/types/organization.types";

export interface ManagedUser {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    departmentId?: string;
    companyId?: string;
}

export interface CompanySummary {
    id: string;
    companyName: string;
    taxCode: string;
    industry?: string;
    verificationStatus: string;
}

export interface AuditLog {
    id: string;
    createdAt: string;
    actorName: string;
    action: string;
    entityType: string;
    entityId?: string;
    result: string;
    ipAddress?: string;
}

export const ROLE_DISPLAY: Record<
    UserRole,
    { label: string; badgeVariant: "brand" | "primary" | "secondary" | "success" | "warning" | "destructive" }
> = {
    ADMIN: { label: "Quản trị viên", badgeVariant: "warning" },
    FACULTY_ADMIN: { label: "Ban Quản lý Khoa", badgeVariant: "primary" },
    LECTURER: { label: "Giảng viên", badgeVariant: "secondary" },
    STUDENT: { label: "Sinh viên", badgeVariant: "brand" },
    COMPANY_REP: { label: "Đại diện Doanh nghiệp", badgeVariant: "warning" },
    COMPANY_MENTOR: { label: "Mentor Doanh nghiệp", badgeVariant: "success" },
};

// Baseline programs for CICT CTU
export const BASELINE_PROGRAMS: AcademicProgram[] = [
    { id: "p-1", code: "SE", name: "Kỹ thuật phần mềm", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
    { id: "p-2", code: "7480202", name: "An toàn thông tin", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
    { id: "p-3", code: "7480201", name: "Công nghệ thông tin", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
    { id: "p-4", code: "7480104", name: "Hệ thống thông tin", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
    { id: "p-5", code: "7480102", name: "Mạng máy tính và Truyền thông dữ liệu", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
];

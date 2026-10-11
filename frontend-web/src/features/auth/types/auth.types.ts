export type UserRole = "STUDENT" | "COMPANY_REP" | "ADMIN" | "COMPANY_MENTOR" | "LECTURER" | "FACULTY_ADMIN" | "BLOG_MANAGER";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UserSummary {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: UserRole;
    departmentId?: string;
    companyId?: string;
    mustChangePassword?: boolean;
    lastLoginAt?: string;
    isActive?: boolean;
}

export interface AuthResponse {
    userId: string;
    email: string;
    fullName: string;
    role: UserRole;
    mustChangePassword?: boolean;
}

export interface RegisterCompanyPayload {
    companyName: string;
    taxCode: string;
    industry?: string;
    website?: string;
    address: {
        street?: string;
        ward?: string;
        district?: string;
        province?: string;
    };
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
}

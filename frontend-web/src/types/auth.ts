export type UserRole = "STUDENT" | "COMPANY_REP" | "ADMIN" | "COMPANY_MENTOR" | "LECTURER" | "FACULTY_ADMIN";

export interface UserSummary {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: UserRole;
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
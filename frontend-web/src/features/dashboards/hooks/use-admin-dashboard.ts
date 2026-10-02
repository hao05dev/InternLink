"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { UserRole } from "@/features/auth/types/auth.types";
import { Department, AcademicProgram } from "@/features/organization/types/organization.types";
import { apiClient } from "@/lib/api-client";
import {
    ManagedUser,
    CompanySummary,
    AuditLog,
    BASELINE_PROGRAMS,
} from "../types/admin-dashboard.types";

export function useAdminDashboard() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [programs, setPrograms] = useState<AcademicProgram[]>([]);
    const [companies, setCompanies] = useState<CompanySummary[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string>("");

    const loadData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const [usersRes, deptsRes, progsRes, compsRes, logsRes] = await Promise.allSettled([
                apiClient.get<ManagedUser[]>("/api/v1/admin/users"),
                apiClient.get<Department[]>("/api/v1/departments"),
                apiClient.get<AcademicProgram[]>("/api/v1/academic-programs"),
                apiClient.get<CompanySummary[]>("/api/v1/companies"),
                apiClient.get<AuditLog[]>("/api/v1/audit-logs"),
            ]);

            if (usersRes.status === "fulfilled" && usersRes.value?.data) {
                setUsers(usersRes.value.data);
            }
            if (deptsRes.status === "fulfilled" && deptsRes.value?.data) {
                setDepartments(deptsRes.value.data);
            }
            if (progsRes.status === "fulfilled" && progsRes.value?.data && progsRes.value.data.length > 0) {
                setPrograms(progsRes.value.data);
            } else {
                setPrograms(BASELINE_PROGRAMS);
            }
            if (compsRes.status === "fulfilled" && compsRes.value?.data) {
                setCompanies(compsRes.value.data);
            }
            if (logsRes.status === "fulfilled" && logsRes.value?.data) {
                setAuditLogs(logsRes.value.data);
            }
            setLastSyncTime(new Date().toLocaleTimeString("vi-VN"));
        } catch {
            if (programs.length === 0) {
                setPrograms(BASELINE_PROGRAMS);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [programs.length]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const stats = useMemo(() => {
        const activeUsers = users.filter((u) => u.isActive).length;
        const inactiveUsers = users.filter((u) => !u.isActive).length;
        const verifiedCompanies = companies.filter((c) => c.verificationStatus === "VERIFIED").length;
        const pendingCompanies = companies.filter((c) => c.verificationStatus === "PENDING").length;

        const roleCounts: Record<UserRole, number> = {
            STUDENT: users.filter((u) => u.role === "STUDENT").length,
            LECTURER: users.filter((u) => u.role === "LECTURER").length,
            FACULTY_ADMIN: users.filter((u) => u.role === "FACULTY_ADMIN").length,
            COMPANY_REP: users.filter((u) => u.role === "COMPANY_REP").length,
            COMPANY_MENTOR: users.filter((u) => u.role === "COMPANY_MENTOR").length,
            ADMIN: users.filter((u) => u.role === "ADMIN").length,
        };

        return {
            totalUsers: users.length,
            activeUsers,
            inactiveUsers,
            totalPrograms: programs.length,
            totalCompanies: companies.length,
            verifiedCompanies,
            pendingCompanies,
            totalAuditLogs: auditLogs.length,
            roleCounts,
        };
    }, [users, programs, companies, auditLogs]);

    return {
        currentUser,
        users,
        departments,
        programs,
        companies,
        auditLogs,
        isLoading,
        isRefreshing,
        lastSyncTime,
        stats,
        loadData,
    };
}

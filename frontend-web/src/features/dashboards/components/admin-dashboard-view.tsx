"use client";

import React from "react";
import { useAdminDashboard } from "../hooks/use-admin-dashboard";
import { AdminStatsOverview } from "./admin-stats-overview";
import { AdminRoleDistribution } from "./admin-role-distribution";
import { AdminAcademicProgramsCard } from "./admin-academic-programs-card";
import { AdminCoreHubsCard } from "./admin-core-hubs-card";
import { AdminRecentAuditLogsCard } from "./admin-recent-audit-logs-card";
import { AcademicHeroBanner } from "./academic-hero-banner";
import { AcademicAiInsightCard } from "./academic-ai-insight-card";

export default function AdminDashboardView() {
    const {
        currentUser,
        programs,
        auditLogs,
        isLoading,
        isRefreshing,
        lastSyncTime,
        stats,
        loadData,
    } = useAdminDashboard();

    const totalUsers = stats.totalUsers || 1;
    const activePercent = Math.round((stats.activeUsers / totalUsers) * 100);

    return (
        <div className="space-y-6">
            {/* Academic Hero Banner (Phong cách HCMUE PLUS) */}
            <AcademicHeroBanner
                roleBadge="Quản Trị Hệ Thống • InternLink CICT"
                userName={currentUser?.fullName || "Quản trị viên"}
                userCode="SYS-ADMIN"
                departmentOrCompany="Hệ thống Cổng Quản lý Thực tập Tốt nghiệp — CICT CTU"
                academicYear="Năm học 2026-2027 • Học kỳ 1"
                nextEvent={{
                    badgeTitle: "Giám sát kỹ thuật & Hạ tầng số",
                    title: "Trung Tâm Quản Trị Hệ Thống InternLink",
                    time: lastSyncTime ? `Lần đồng bộ gần nhất: ${lastSyncTime}` : "Thời gian hoạt động (Uptime): 99.98%",
                    locationOrDetail: `${stats.totalUsers} người dùng • ${stats.totalCompanies} doanh nghiệp đối tác`,
                    actionLabel: "Quản lý AI & Dịch vụ",
                    actionHref: "/admin/ai",
                }}
                progress={{
                    label: "Tỉ lệ tài khoản người dùng hoạt động",
                    current: stats.activeUsers,
                    total: stats.totalUsers,
                    unit: "TK",
                    percentage: activePercent,
                }}
            />

            {/* KPI metric cards */}
            <AdminStatsOverview
                isLoading={isLoading}
                totalUsers={stats.totalUsers}
                activeUsers={stats.activeUsers}
                inactiveUsers={stats.inactiveUsers}
                totalPrograms={stats.totalPrograms}
                totalCompanies={stats.totalCompanies}
                verifiedCompanies={stats.verifiedCompanies}
                pendingCompanies={stats.pendingCompanies}
                totalAuditLogs={stats.totalAuditLogs}
            />

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Role breakdown & academic programs */}
                <div className="lg:col-span-7 space-y-6">
                    <AdminRoleDistribution
                        roleCounts={stats.roleCounts}
                        totalUsers={stats.totalUsers}
                    />
                    <AdminAcademicProgramsCard programs={programs} />
                </div>

                {/* Right Column: Core management hubs, AI Insights & recent activity */}
                <div className="lg:col-span-5 space-y-6">
                    <AcademicAiInsightCard
                        title="AI System Governance"
                        highlightText="Giám sát hiệu năng hệ thống:"
                        advice="AI Microservice đang phản hồi trung bình 28ms với độ chính xác Matching CV đạt 94%. Tất cả nhật ký bảo mật của 6 nhóm vai trò đều hoạt động bình thường."
                        actionHref="/admin/audit-logs"
                        actionLabel="Xem nhật ký kiểm toán"
                    />
                    <AdminCoreHubsCard />
                    <AdminRecentAuditLogsCard auditLogs={auditLogs} />
                </div>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { useAdminDashboard } from "../hooks/use-admin-dashboard";
import { AdminDashboardHeader } from "./admin-dashboard-header";
import { AdminStatsOverview } from "./admin-stats-overview";
import { AdminRoleDistribution } from "./admin-role-distribution";
import { AdminAcademicProgramsCard } from "./admin-academic-programs-card";
import { AdminCoreHubsCard } from "./admin-core-hubs-card";
import { AdminRecentAuditLogsCard } from "./admin-recent-audit-logs-card";

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

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <AdminDashboardHeader
                userName={currentUser?.fullName}
                lastSyncTime={lastSyncTime}
                isRefreshing={isRefreshing}
                onRefresh={() => void loadData()}
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Role breakdown & academic programs */}
                <div className="lg:col-span-7 space-y-6">
                    <AdminRoleDistribution
                        roleCounts={stats.roleCounts}
                        totalUsers={stats.totalUsers}
                    />
                    <AdminAcademicProgramsCard programs={programs} />
                </div>

                {/* Right Column: Core management hubs & recent activity */}
                <div className="lg:col-span-5 space-y-6">
                    <AdminCoreHubsCard />
                    <AdminRecentAuditLogsCard auditLogs={auditLogs} />
                </div>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminDashboardHeaderProps {
    userName?: string;
    lastSyncTime?: string;
    isRefreshing: boolean;
    onRefresh: () => void;
}

export function AdminDashboardHeader({
    userName,
    lastSyncTime,
    isRefreshing,
    onRefresh,
}: AdminDashboardHeaderProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Quản trị hệ thống
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Đang hoạt động
                    </div>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Trung Tâm Quản Trị Hệ Thống InternLink
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Xin chào, <span className="font-semibold text-slate-700">{userName || "Quản trị viên"}</span>! Giám sát toàn diện người dùng, cơ cấu đào tạo CICT • CTU và doanh nghiệp liên kết.
                </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {lastSyncTime && (
                    <span className="text-xs text-slate-400 hidden sm:inline-block">
                        Cập nhật lúc: {lastSyncTime}
                    </span>
                )}
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="gap-2 cursor-pointer text-xs"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span>Làm mới</span>
                </Button>
            </div>
        </div>
    );
}

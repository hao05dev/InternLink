"use client";

import React from "react";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/features/auth/types/auth.types";
import { ROLE_DISPLAY } from "../types/admin-dashboard.types";

interface AdminRoleDistributionProps {
    roleCounts: Record<UserRole, number>;
    totalUsers: number;
}

export function AdminRoleDistribution({ roleCounts, totalUsers }: AdminRoleDistributionProps) {
    const roles: UserRole[] = ["STUDENT", "LECTURER", "FACULTY_ADMIN", "COMPANY_REP", "COMPANY_MENTOR", "ADMIN"];

    return (
        <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-sky-700" />
                        Phân bố tài khoản theo vai trò
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Các nhóm người dùng trong quy trình thực tập và tiếp nhận sinh viên
                    </p>
                </div>
                <Link href="/admin/users">
                    <Button variant="secondary" size="sm" className="text-xs gap-1 cursor-pointer">
                        Quản lý <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {roles.map((role) => {
                        const meta = ROLE_DISPLAY[role];
                        const count = roleCounts[role];
                        const percent = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;

                        return (
                            <div
                                key={role}
                                className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-slate-700">
                                        {meta.label}
                                    </span>
                                    <Badge variant={meta.badgeVariant} className="text-[10px] px-1.5 py-0">
                                        {percent}%
                                    </Badge>
                                </div>
                                <div className="flex items-baseline justify-between mt-1">
                                    <span className="text-xl font-black text-slate-900">{count}</span>
                                    <span className="text-[11px] text-slate-400">tài khoản</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

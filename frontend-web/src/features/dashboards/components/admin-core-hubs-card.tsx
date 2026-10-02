"use client";

import React from "react";
import Link from "next/link";
import {
    Layers,
    BrainCircuit,
    Users,
    BookOpen,
    Building2,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function AdminCoreHubsCard() {
    const hubs = [
        {
            href: "/admin/ai",
            icon: BrainCircuit,
            iconBg: "bg-sky-50 text-sky-700",
            title: "Quản lý AI",
            description: "Theo dõi dịch vụ, kết quả xử lý CV và xử lý lại lượt lỗi",
            hoverColor: "group-hover:text-sky-700",
            hoverArrow: "group-hover:text-sky-600",
        },
        {
            href: "/admin/users",
            icon: Users,
            iconBg: "bg-sky-50 text-sky-700",
            title: "Quản lý người dùng & Phân quyền",
            description: "Tạo tài khoản, gán vai trò, quản lý trạng thái truy cập",
            hoverColor: "group-hover:text-sky-700",
            hoverArrow: "group-hover:text-sky-600",
        },
        {
            href: "/admin/departments",
            icon: BookOpen,
            iconBg: "bg-indigo-50 text-indigo-700",
            title: "Cơ cấu Khoa & Ngành đào tạo",
            description: "Quản lý danh mục ngành: KTPM, ATTT, CNTT, HTTT, MMT",
            hoverColor: "group-hover:text-indigo-700",
            hoverArrow: "group-hover:text-indigo-600",
        },
        {
            href: "/admin/companies",
            icon: Building2,
            iconBg: "bg-emerald-50 text-emerald-700",
            title: "Danh bạ Doanh nghiệp liên kết",
            description: "Hồ sơ pháp nhân, mã số thuế và kết quả thẩm định",
            hoverColor: "group-hover:text-emerald-700",
            hoverArrow: "group-hover:text-emerald-600",
        },
        {
            href: "/admin/audit-logs",
            icon: ShieldCheck,
            iconBg: "bg-amber-50 text-amber-700",
            title: "Nhật ký kiểm toán & Giám sát",
            description: "Theo dõi lịch sử truy cập và nhật ký thao tác",
            hoverColor: "group-hover:text-amber-700",
            hoverArrow: "group-hover:text-amber-600",
        },
    ];

    return (
        <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-700" />
                    5 Phân hệ quản trị cốt lõi
                </CardTitle>
                <p className="text-xs text-slate-500">
                    Lối tắt truy cập các khu vực quản lý hệ thống
                </p>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-100">
                {hubs.map((hub) => {
                    const IconComponent = hub.icon;
                    return (
                        <Link
                            key={hub.href}
                            href={hub.href}
                            className="py-3 flex items-center justify-between group hover:bg-slate-50/80 px-2 -mx-2 rounded-lg transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${hub.iconBg} flex items-center justify-center shrink-0`}>
                                    <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className={`text-xs font-bold text-slate-900 ${hub.hoverColor} transition`}>
                                        {hub.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500">{hub.description}</p>
                                </div>
                            </div>
                            <ArrowRight className={`w-4 h-4 text-slate-300 ${hub.hoverArrow} group-hover:translate-x-1 transition`} />
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}

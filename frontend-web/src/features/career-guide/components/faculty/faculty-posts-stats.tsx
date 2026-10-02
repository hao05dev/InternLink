"use client";

import { PostItem } from "../../types/post.types";
import { FileText, CheckCircle2, FileEdit, Eye } from "lucide-react";

interface FacultyPostsStatsProps {
    posts: PostItem[];
}

export function FacultyPostsStats({ posts }: FacultyPostsStatsProps) {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter((p) => p.status === "PUBLISHED").length;
    const draftPosts = posts.filter((p) => p.status === "DRAFT").length;
    const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);

    const statCards = [
        {
            label: "Tổng số bài viết",
            value: totalPosts,
            sub: "Trong hệ thống",
            icon: FileText,
            color: "text-sky-600 dark:text-sky-400",
            bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-800",
        },
        {
            label: "Đang hiển thị công khai",
            value: publishedPosts,
            sub: "Sinh viên có thể xem",
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800",
        },
        {
            label: "Bản nháp",
            value: draftPosts,
            sub: "Chưa công khai",
            icon: FileEdit,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800",
        },
        {
            label: "Lượt xem tích lũy",
            value: totalViews.toLocaleString("vi-VN"),
            sub: "Từ sinh viên & đối tác",
            icon: Eye,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-800",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between"
                    >
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {stat.label}
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {stat.value}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                {stat.sub}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

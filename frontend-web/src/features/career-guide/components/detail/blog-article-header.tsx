"use client";

import { Eye, Calendar, Pin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostItem, POST_CATEGORY_LABELS } from "../../types/post.types";

interface BlogArticleHeaderProps {
    post: PostItem;
}

export function BlogArticleHeader({ post }: BlogArticleHeaderProps) {
    const categoryInfo = POST_CATEGORY_LABELS[post.category] || {
        label: post.category,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };

    // Estimate reading time based on 200 words/minute
    const wordCount = (post.content || "").replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <header className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            {/* Meta badges row */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${categoryInfo.badgeClass}`}
                >
                    {categoryInfo.label}
                </Badge>

                {post.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                        <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Ghim nổi bật
                    </span>
                )}

                <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
                        : "Gần đây"}
                </span>

                <span className="text-slate-300 dark:text-slate-700">•</span>

                <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {readingTimeMinutes} phút đọc
                </span>

                <span className="text-slate-300 dark:text-slate-700">•</span>

                <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    {post.viewCount || 0} lượt xem
                </span>
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                {post.title}
            </h1>

            {/* Author Profile */}
            <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {post.authorName ? post.authorName.charAt(0) : "C"}
                </div>
                <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                        {post.authorName || "Ban Quản lý Thực tập CICT"}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                        {post.departmentName || "Khoa Công nghệ Thông tin & Truyền thông • ĐH Cần Thơ"}
                    </div>
                </div>
            </div>
        </header>
    );
}

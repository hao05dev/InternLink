"use client";

import { Eye, Calendar, User, Tag, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostItem, POST_CATEGORY_LABELS } from "../../types/post.types";
import { BlogPostAttachments } from "./blog-post-attachments";
import { BlogPostShareBar } from "./blog-post-share-bar";

interface BlogPostDetailContentProps {
    post: PostItem;
}

export function BlogPostDetailContent({ post }: BlogPostDetailContentProps) {
    const categoryInfo = POST_CATEGORY_LABELS[post.category] || {
        label: post.category,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <article className="space-y-8">
            {/* Post Header */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
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

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "Gần đây"}
                    </span>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.viewCount || 0} lượt xem
                    </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    {post.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-sm">
                        {post.authorName ? post.authorName.charAt(0) : "K"}
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                            {post.authorName || "Khoa CNTT & TT"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {post.departmentName || "Đại học Cần Thơ (CTU)"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {post.coverImageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs max-h-[420px] w-full bg-slate-100 dark:bg-slate-800">
                    <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Summary Callout */}
            {post.summary && (
                <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border-l-4 border-sky-500 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {post.summary}
                </div>
            )}

            {/* Content Body */}
            <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal space-y-4">
                {post.content}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-4">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                        <Tag className="w-3.5 h-3.5" />
                        Từ khóa:
                    </span>
                    {post.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Attachments */}
            {post.attachmentUrls && post.attachmentUrls.length > 0 && (
                <BlogPostAttachments attachments={post.attachmentUrls} />
            )}

            {/* Share & Navigation */}
            <BlogPostShareBar title={post.title} />
        </article>
    );
}

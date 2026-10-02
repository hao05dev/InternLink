"use client";

import Link from "next/link";
import { Eye, Clock, Pin, ArrowRight, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostItem, POST_CATEGORY_LABELS } from "../../types/post.types";

interface CareerGuidePostCardProps {
    post: PostItem;
}

export function CareerGuidePostCard({ post }: CareerGuidePostCardProps) {
    const categoryInfo = POST_CATEGORY_LABELS[post.category] || {
        label: post.category,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };

    const hasAttachments = post.attachmentUrls && post.attachmentUrls.length > 0;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-card-hover hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-200 flex flex-col group">
            {/* Post Cover image */}
            {post.coverImageUrl && (
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${categoryInfo.badgeClass}`}
                        >
                            {categoryInfo.label}
                        </Badge>

                        {post.isPinned && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-semibold">
                                <Pin className="w-2.5 h-2.5" />
                                Ghim
                            </span>
                        )}

                        {hasAttachments && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <Paperclip className="w-3 h-3 text-slate-400" />
                                {post.attachmentUrls.length} đính kèm
                            </span>
                        )}
                    </div>

                    <Link href={`/cam-nang/${post.slug}`}>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                        </h3>
                    </Link>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {post.summary}
                    </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                            {post.authorName || "Khoa CNTT"}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] shrink-0">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "Gần đây"}
                        </span>
                    </div>

                    <Link
                        href={`/cam-nang/${post.slug}`}
                        className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium hover:text-sky-700 shrink-0 text-xs"
                    >
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

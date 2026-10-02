"use client";

import Link from "next/link";
import { Clock, Eye, Sparkles, Pin, ArrowUpRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostItem, POST_CATEGORY_LABELS } from "../../types/post.types";

interface CareerGuideFeaturedCardProps {
    post: PostItem;
}

export function CareerGuideFeaturedCard({ post }: CareerGuideFeaturedCardProps) {
    const categoryInfo = POST_CATEGORY_LABELS[post.category] || {
        label: post.category,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-card-hover hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`rounded-full px-3 py-0.5 text-xs font-semibold ${categoryInfo.badgeClass}`}
                            >
                                {categoryInfo.label}
                            </Badge>

                            {post.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium">
                                    <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    Tiêu điểm
                                </span>
                            )}

                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {post.viewCount || 0} lượt xem
                            </span>
                        </div>

                        <Link href={`/cam-nang/${post.slug}`}>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                                {post.title}
                            </h2>
                        </Link>

                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {post.summary}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                            <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                                {post.authorName ? post.authorName.charAt(0) : "K"}
                            </div>
                            <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                    {post.authorName || "Ban Chủ nhiệm Khoa"}
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "Gần đây"}
                                </span>
                            </div>
                        </div>

                        <Link
                            href={`/cam-nang/${post.slug}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 text-xs font-semibold transition-colors"
                        >
                            <span>Xem chi tiết</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-5 relative bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 min-h-[220px] lg:min-h-full overflow-hidden">
                    {post.coverImageUrl ? (
                        <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-2">
                            <Sparkles className="w-12 h-12 text-sky-600/40" />
                            <span className="text-xs font-medium text-slate-400">InternLink Knowledge Hub</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

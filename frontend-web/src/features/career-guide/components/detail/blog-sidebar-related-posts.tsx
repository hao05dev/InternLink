"use client";

import Link from "next/link";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import { PostItem, POST_CATEGORY_LABELS } from "../../types/post.types";

interface BlogSidebarRelatedPostsProps {
    posts: PostItem[];
}

export function BlogSidebarRelatedPosts({ posts }: BlogSidebarRelatedPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    Bài viết liên quan
                </h3>
                <Link
                    href="/career-guide"
                    className="text-[11px] font-semibold text-sky-600 hover:underline flex items-center gap-0.5"
                >
                    Tất cả <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-3.5">
                {posts.map((item) => {
                    const cat = POST_CATEGORY_LABELS[item.category] || { label: item.category };
                    return (
                        <Link
                            key={item.id}
                            href={`/career-guide/${item.slug}`}
                            className="group flex gap-3 items-start p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                            {item.coverImageUrl && (
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/70">
                                    <img
                                        src={item.coverImageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 space-y-1">
                                <span className="text-[10px] font-bold text-sky-600 block truncate uppercase tracking-wider">
                                    {cat.label}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-600 line-clamp-2 leading-snug transition-colors">
                                    {item.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {item.publishedAt
                                        ? new Date(item.publishedAt).toLocaleDateString("vi-VN")
                                        : "Gần đây"}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

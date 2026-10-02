"use client";

import { PostItem } from "../../types/post.types";
import { CareerGuidePostCard } from "./career-guide-post-card";
import { FileQuestion, Loader2 } from "lucide-react";

interface CareerGuideGridProps {
    posts: PostItem[];
    isLoading?: boolean;
}

export function CareerGuideGrid({ posts, isLoading }: CareerGuideGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse"
                    >
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3" />
                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-4/5" />
                        <div className="space-y-2">
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 max-w-lg mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <FileQuestion className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Chưa có bài viết nào phù hợp
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Vui lòng chọn danh mục khác hoặc thay đổi từ khóa tìm kiếm.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
                <CareerGuidePostCard key={post.id} post={post} />
            ))}
        </div>
    );
}

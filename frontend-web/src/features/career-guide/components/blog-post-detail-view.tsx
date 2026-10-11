"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, FileQuestion } from "lucide-react";
import { PublicShell } from "@/components/layouts/public-shell";
import { Button } from "@/components/ui/button";
import { useBlogPostDetail } from "../hooks/use-blog-post-detail";
import { usePostViewGuard } from "../hooks/use-post-view-guard";
import { BlogArticleHeader } from "./detail/blog-article-header";
import { BlogArticleBody } from "./detail/blog-article-body";
import { BlogSidebarRelatedPosts } from "./detail/blog-sidebar-related-posts";
import { BlogSidebarFeaturedJobs } from "./detail/blog-sidebar-featured-jobs";
import { BlogSidebarPartnerNotice } from "./detail/blog-sidebar-partner-notice";

interface BlogPostDetailViewProps {
    slug: string;
}

export default function BlogPostDetailView({ slug }: BlogPostDetailViewProps) {
    const { post, setPost, relatedPosts, suggestedJobs, isLoading, isNotFound } = useBlogPostDetail(slug);

    // Lớp bảo vệ chống tăng view ảo, đảm bảo mỗi người thật chỉ tính 1 view/24h
    usePostViewGuard(slug, (updatedPost) => {
        setPost(prev => prev ? { ...prev, viewCount: updatedPost.viewCount } : updatedPost);
    });

    if (isLoading) {
        return (
            <PublicShell>
                <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                    <p className="mt-3 text-xs text-slate-500 font-medium">
                        Đang tải nội dung bài viết...
                    </p>
                </div>
            </PublicShell>
        );
    }

    if (isNotFound || !post) {
        return (
            <PublicShell>
                <div className="min-h-[70vh] bg-slate-50/70 dark:bg-slate-950 flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <FileQuestion className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        Bài viết không tồn tại hoặc đã ngừng công khai
                    </h2>
                    <p className="text-xs text-slate-500 max-w-md">
                        Đường dẫn này có thể đã bị thay đổi hoặc bài viết đã được lưu trữ bởi ban quản trị khoa.
                    </p>
                    <Link href="/career-guide">
                        <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 mt-2">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Quay lại danh mục tin tức & blog
                        </Button>
                    </Link>
                </div>
            </PublicShell>
        );
    }

    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50/80 py-8 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs Navigation */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 truncate">
                        <Link
                            href="/career-guide"
                            className="hover:text-sky-600 flex items-center gap-1 transition-colors shrink-0 font-medium"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Tin tức & Blog
                        </Link>
                        <span>/</span>
                        <span className="text-slate-800 font-semibold truncate">
                            {post.title}
                        </span>
                    </div>

                    {/* Main Content Layout: 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Main Article (8/12 cols) */}
                        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">
                            <BlogArticleHeader post={post} />
                            <BlogArticleBody post={post} />
                        </div>

                        {/* Right Column: Sticky Sidebar Widgets (4/12 cols) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                            <BlogSidebarRelatedPosts posts={relatedPosts} />
                            <BlogSidebarFeaturedJobs jobs={suggestedJobs} />
                            <BlogSidebarPartnerNotice />
                        </div>
                    </div>
                </div>
            </div>
        </PublicShell>
    );
}

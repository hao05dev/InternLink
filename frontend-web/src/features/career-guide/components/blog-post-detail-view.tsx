"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, FileQuestion } from "lucide-react";
import { PublicShell } from "@/components/layouts/public-shell";
import { postService } from "../services/post.service";
import { PostItem } from "../types/post.types";
import { BlogPostDetailContent } from "./public/blog-post-detail-content";
import { Button } from "@/components/ui/button";

interface BlogPostDetailViewProps {
    slug: string;
}

export default function BlogPostDetailView({ slug }: BlogPostDetailViewProps) {
    const [post, setPost] = useState<PostItem | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isNotFound, setIsNotFound] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        async function fetchPost() {
            try {
                setIsLoading(true);
                setIsNotFound(false);
                const data = await postService.getPublicPostBySlug(slug);
                if (isMounted) {
                    if (data) {
                        setPost(data);
                    } else {
                        setIsNotFound(true);
                    }
                }
            } catch (err) {
                if (isMounted) setIsNotFound(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        fetchPost();
        return () => {
            isMounted = false;
        };
    }, [slug]);

    if (isLoading) {
        return (
            <PublicShell>
                <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                    <p className="mt-3 text-xs text-slate-500 font-medium">
                        Đang tải nội dung bài viết cẩm nang...
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
                    <Link href="/cam-nang">
                        <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 mt-2">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Quay lại danh mục cẩm nang
                        </Button>
                    </Link>
                </div>
            </PublicShell>
        );
    }

    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 py-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 truncate">
                        <Link
                            href="/cam-nang"
                            className="hover:text-sky-600 flex items-center gap-1 transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Cẩm nang
                        </Link>
                        <span>/</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                            {post.title}
                        </span>
                    </div>

                    {/* Article Container */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-2xs">
                        <BlogPostDetailContent post={post} />
                    </div>
                </div>
            </div>
        </PublicShell>
    );
}

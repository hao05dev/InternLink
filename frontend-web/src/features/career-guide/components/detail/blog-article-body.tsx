"use client";

import { Tag } from "lucide-react";
import { MediaRichContent } from "@/components/ui/media-rich-content";
import { PostItem } from "../../types/post.types";
import { BlogPostAttachments } from "../public/blog-post-attachments";
import { BlogPostShareBar } from "../public/blog-post-share-bar";

interface BlogArticleBodyProps {
    post: PostItem;
}

export function BlogArticleBody({ post }: BlogArticleBodyProps) {
    return (
        <div className="space-y-8 pt-6">
            {/* Cover Image */}
            {post.coverImageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xs max-h-[460px] w-full bg-slate-100 dark:bg-slate-800">
                    <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Editorial Summary Box */}
            {post.summary && (
                <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/80 border-l-4 border-sky-600 text-sm sm:text-base text-slate-800 leading-relaxed font-medium shadow-2xs">
                    {post.summary}
                </div>
            )}

            {/* Main Article Body with Enhanced Blog Typography */}
            <div className="blog-editorial-prose text-slate-800">
                <MediaRichContent text={post.content} />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
                        <Tag className="w-3.5 h-3.5 text-sky-600" />
                        Chủ đề:
                    </span>
                    {post.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
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

            {/* Share Bar */}
            <div className="pt-2">
                <BlogPostShareBar title={post.title} />
            </div>
        </div>
    );
}

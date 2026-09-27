"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, BookOpen, ChevronRight } from "lucide-react";
import { BLOG_POSTS } from "@/data/blog-posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlogPostDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const post = BLOG_POSTS.find(p => p.slug === slug) || BLOG_POSTS[0];
    const relatedPosts = BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 2);

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
                {/* Back link */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Link href="/cam-nang" className="hover:text-sky-700 flex items-center gap-1 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Quay lại Cẩm nang Thực tập
                    </Link>
                    <span>/</span>
                    <span className="text-slate-700 font-medium truncate">{post.title}</span>
                </div>

                {/* Article Header */}
                <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="brand" className="bg-sky-50 text-sky-700 border-sky-200">
                                {post.category}
                            </Badge>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {post.publishedAt}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {post.readTime}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {post.title}
                        </h1>

                        {/* Author info */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-800 font-bold text-sm">
                                    {post.author.name.charAt(0)}
                                </div>
                                <div className="text-xs">
                                    <div className="font-bold text-slate-900">{post.author.name}</div>
                                    <div className="text-slate-500">{post.author.role}</div>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Đã sao chép liên kết bài viết!");
                                    }
                                }}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                Chia sẻ
                            </button>
                        </div>
                    </div>

                    {/* Cover image */}
                    <div className="rounded-xl overflow-hidden max-h-96 w-full">
                        <img 
                            src={post.coverImage} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Content body */}
                    <div className="space-y-4 text-sm text-slate-700 leading-relaxed pt-2">
                        {post.content.map((paragraph, idx) => (
                            <p key={idx} className="leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {/* Tags */}
                    {post.tags && (
                        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Từ khóa:</span>
                            {post.tags.map((t, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}
                </article>

                {/* Related posts */}
                <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Bài viết hướng dẫn khác</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedPosts.map(rel => (
                            <Link 
                                key={rel.id} 
                                href={`/cam-nang/${rel.slug}`}
                                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-sm transition-all group block space-y-2"
                            >
                                <span className="text-[11px] font-semibold text-sky-700">{rel.category}</span>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2">
                                    {rel.title}
                                </h4>
                                <div className="text-xs text-slate-400 flex items-center justify-between pt-2">
                                    <span>{rel.readTime}</span>
                                    <span className="text-sky-700 font-medium flex items-center">
                                        Đọc ngay <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

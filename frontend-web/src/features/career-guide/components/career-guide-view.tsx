"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Calendar, ChevronRight, User, Tag, Sparkles } from "lucide-react";
import { BLOG_POSTS, BlogPost } from "@/features/career-guide/data/blog-posts";
import { Badge } from "@/components/ui/badge";
import { PublicShell } from "@/components/layouts/public-shell";

export default function CareerGuideView() {
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

    const categories = ["ALL", "Kỹ năng ứng tuyển", "Quy chế & Hướng dẫn", "Kinh nghiệm thực tập"];

    const filteredPosts = selectedCategory === "ALL" 
        ? BLOG_POSTS 
        : BLOG_POSTS.filter(p => p.category === selectedCategory);

    const featuredPost = BLOG_POSTS[0];

    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Header Title */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
                        <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                        Cẩm nang & Hướng dẫn Thực tập Doanh nghiệp
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Kiến thức & Hướng nghiệp Sinh viên CICT
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Tổng hợp quy chế học phần, cẩm nang viết CV, kỹ năng phỏng vấn và hướng dẫn hoàn thành xuất sắc kỳ thực tập tốt nghiệp tại các doanh nghiệp đối tác.
                    </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                selectedCategory === cat
                                    ? "bg-sky-700 text-white shadow-sm"
                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                            }`}
                        >
                            {cat === "ALL" ? "Tất cả bài viết" : cat}
                        </button>
                    ))}
                </div>

                {/* Featured Post Card (if "ALL" selected) */}
                {selectedCategory === "ALL" && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <Badge variant="brand" className="bg-sky-50 text-sky-700 border-sky-200">
                                            {featuredPost.category}
                                        </Badge>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {featuredPost.readTime}
                                        </span>
                                    </div>
                                    <Link href={`/cam-nang/${featuredPost.slug}`}>
                                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                                            {featuredPost.title}
                                        </h2>
                                    </Link>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {featuredPost.excerpt}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="text-xs text-slate-500">
                                        <span className="font-semibold text-slate-800">{featuredPost.author.name}</span>
                                        <span className="text-slate-400 block">{featuredPost.author.role}</span>
                                    </div>
                                    <Link 
                                        href={`/cam-nang/${featuredPost.slug}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800"
                                    >
                                        Đọc tiếp
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-full bg-slate-100">
                                <img
                                    src={featuredPost.coverImage}
                                    alt={featuredPost.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <article 
                            key={post.id}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col group"
                        >
                            <div className="relative h-48 bg-slate-100 overflow-hidden">
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs text-[11px] font-semibold">
                                        {post.category}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {post.publishedAt}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                    <Link href={`/cam-nang/${post.slug}`}>
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium truncate max-w-[180px]">
                                        {post.author.name}
                                    </span>
                                    <Link 
                                        href={`/cam-nang/${post.slug}`}
                                        className="text-sky-700 font-bold hover:underline shrink-0"
                                    >
                                        Xem bài viết
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
            </div>
        </PublicShell>
    );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { PublicShell } from "@/components/layouts/public-shell";
import { postService } from "../services/post.service";
import { PostItem } from "../types/post.types";
import { CareerGuideHeader } from "./public/career-guide-header";
import { CareerGuideCategoryPills } from "./public/career-guide-category-pills";
import { CareerGuideFeaturedCard } from "./public/career-guide-featured-card";
import { CareerGuideGrid } from "./public/career-guide-grid";

export default function CareerGuideView() {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchPosts() {
            try {
                setIsLoading(true);
                const data = await postService.getPublicPosts();
                if (isMounted) {
                    setPosts(data);
                }
            } catch (err) {
                console.error("Failed to load career guide posts", err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        fetchPosts();
        return () => {
            isMounted = false;
        };
    }, []);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: posts.length };
        posts.forEach((p) => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return counts;
    }, [posts]);

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const matchesCategory =
                selectedCategory === "ALL" || post.category === selectedCategory;
            const matchesSearch =
                !searchQuery.trim() ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
            return matchesCategory && matchesSearch;
        });
    }, [posts, selectedCategory, searchQuery]);

    const featuredPost = useMemo(() => {
        if (selectedCategory !== "ALL" || searchQuery.trim()) return null;
        return posts.find((p) => p.isPinned) || posts[0] || null;
    }, [posts, selectedCategory, searchQuery]);

    const displayGridPosts = useMemo(() => {
        if (featuredPost && selectedCategory === "ALL" && !searchQuery.trim()) {
            return filteredPosts.filter((p) => p.id !== featuredPost.id);
        }
        return filteredPosts;
    }, [filteredPosts, featuredPost, selectedCategory, searchQuery]);

    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    <CareerGuideHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    <CareerGuideCategoryPills
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        categoryCounts={categoryCounts}
                    />

                    {featuredPost && (
                        <CareerGuideFeaturedCard post={featuredPost} />
                    )}

                    <CareerGuideGrid
                        posts={displayGridPosts}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </PublicShell>
    );
}

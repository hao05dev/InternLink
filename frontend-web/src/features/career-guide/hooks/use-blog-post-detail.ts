"use client";

import { useState, useEffect } from "react";
import { postService } from "../services/post.service";
import { jobService } from "@/features/jobs/services/job.service";
import { PostItem } from "../types/post.types";
import { JobPosition } from "@/features/jobs/types/job.types";

export function useBlogPostDetail(slug: string) {
    const [post, setPost] = useState<PostItem | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<PostItem[]>([]);
    const [suggestedJobs, setSuggestedJobs] = useState<JobPosition[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isNotFound, setIsNotFound] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setIsNotFound(false);

        Promise.all([
            postService.getPublicPostBySlug(slug),
            postService.getPublicPosts().catch(() => [] as PostItem[]),
            jobService.getPublicJobs().catch(() => [] as JobPosition[])
        ]).then(([postData, allPosts, allJobs]) => {
            if (!isMounted) return;

            if (postData) {
                setPost(postData);
                // Filter related posts (same category or recent, excluding current)
                const related = allPosts
                    .filter(p => p.slug !== slug)
                    .sort((a, b) => {
                        const aSameCat = a.category === postData.category ? 1 : 0;
                        const bSameCat = b.category === postData.category ? 1 : 0;
                        return bSameCat - aSameCat;
                    })
                    .slice(0, 3);
                setRelatedPosts(related);

                // Filter top 3 active jobs
                const activeJobs = allJobs
                    .filter(j => !j.isExpired && j.status !== "CLOSED")
                    .slice(0, 3);
                setSuggestedJobs(activeJobs);
            } else {
                setIsNotFound(true);
            }
            setIsLoading(false);
        }).catch(() => {
            if (isMounted) {
                setIsNotFound(true);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [slug]);

    return {
        post,
        setPost,
        relatedPosts,
        suggestedJobs,
        isLoading,
        isNotFound
    };
}

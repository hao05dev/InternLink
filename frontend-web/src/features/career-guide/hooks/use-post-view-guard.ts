"use client";

import { useEffect, useRef } from "react";
import { postService } from "../services/post.service";
import { PostItem } from "../types/post.types";

const VISITOR_ID_STORAGE_KEY = "internlink_visitor_id";
const POST_VIEWED_STORAGE_KEY = "internlink_viewed_posts_v1";
const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Quản lý định danh client và chống tăng view ảo (F5, spam request)
 * trong khoảng thời gian 24 giờ cho cùng 1 thiết bị/người dùng.
 */
export function usePostViewGuard(
    slug?: string,
    onViewIncremented?: (updatedPost: PostItem) => void
) {
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        if (!slug || hasTriggeredRef.current || typeof window === "undefined") {
            return;
        }

        // 1. Lấy hoặc khởi tạo Visitor ID duy nhất cho trình duyệt
        let visitorId = localStorage.getItem(VISITOR_ID_STORAGE_KEY);
        if (!visitorId) {
            visitorId = typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId);
        }

        // 2. Kiểm tra xem người dùng đã xem bài viết này trong 24 giờ qua hay chưa
        let viewedMap: Record<string, number> = {};
        try {
            const stored = localStorage.getItem(POST_VIEWED_STORAGE_KEY);
            if (stored) {
                viewedMap = JSON.parse(stored);
            }
        } catch {
            viewedMap = {};
        }

        const now = Date.now();
        const lastViewedAt = viewedMap[slug];

        // Nếu đã xem trong vòng 24h -> bỏ qua, không gửi request tăng view
        if (lastViewedAt && now - lastViewedAt < VIEW_COOLDOWN_MS) {
            hasTriggeredRef.current = true;
            return;
        }

        // 3. Người thật xem lần đầu trong 24h -> Ghi nhận vào local storage & gọi API
        hasTriggeredRef.current = true;
        viewedMap[slug] = now;

        // Dọn dẹp các mục cũ hơn 7 ngày
        Object.keys(viewedMap).forEach((key) => {
            if (now - viewedMap[key] > 7 * 24 * 60 * 60 * 1000) {
                delete viewedMap[key];
            }
        });
        localStorage.setItem(POST_VIEWED_STORAGE_KEY, JSON.stringify(viewedMap));

        // Gọi API backend kèm X-Visitor-Id để bảo vệ 2 lớp
        postService.recordView(slug, visitorId).then((updatedPost) => {
            if (updatedPost && onViewIncremented) {
                onViewIncremented(updatedPost);
            }
        });
    }, [slug, onViewIncremented]);
}

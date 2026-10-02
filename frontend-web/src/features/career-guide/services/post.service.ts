import { apiClient } from '@/lib/api-client';
import { PostItem, CreatePostPayload, PostCategory, PostStatus } from '../types/post.types';

export const postService = {
    async getPublicPosts(params?: { category?: PostCategory | string; search?: string }): Promise<PostItem[]> {
        const query = new URLSearchParams();
        if (params?.category && params.category !== 'ALL') query.append('category', params.category);
        if (params?.search) query.append('search', params.search);

        const url = `/api/v1/posts/public${query.toString() ? `?${query.toString()}` : ''}`;
        try {
            const res = await apiClient.get<PostItem[]>(url);
            return res.data || [];
        } catch {
            return [];
        }
    },

    async getPublicPostBySlug(slug: string): Promise<PostItem | null> {
        try {
            const res = await apiClient.get<PostItem>(`/api/v1/posts/public/by-slug/${slug}`);
            return res.data || null;
        } catch {
            return null;
        }
    },

    async getManagementPosts(params?: {
        category?: PostCategory | string;
        status?: PostStatus | string;
        search?: string;
    }): Promise<PostItem[]> {
        const query = new URLSearchParams();
        if (params?.category && params.category !== 'ALL') query.append('category', params.category);
        if (params?.status && params.status !== 'ALL') query.append('status', params.status);
        if (params?.search) query.append('search', params.search);

        const url = `/api/v1/posts/management${query.toString() ? `?${query.toString()}` : ''}`;
        try {
            const res = await apiClient.get<PostItem[]>(url);
            return res.data || [];
        } catch {
            return [];
        }
    },

    async getPostById(id: string): Promise<PostItem | null> {
        try {
            const res = await apiClient.get<PostItem>(`/api/v1/posts/${id}`);
            return res.data || null;
        } catch {
            return null;
        }
    },

    async createPost(payload: CreatePostPayload): Promise<PostItem> {
        const res = await apiClient.post<PostItem>('/api/v1/posts', payload);
        return res.data;
    },

    async updatePost(id: string, payload: Partial<CreatePostPayload>): Promise<PostItem> {
        const res = await apiClient.put<PostItem>(`/api/v1/posts/${id}`, payload);
        return res.data;
    },

    async deletePost(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/posts/${id}`);
    },

    async togglePinPost(id: string): Promise<PostItem> {
        const res = await apiClient.patch<PostItem>(`/api/v1/posts/${id}/toggle-pin`);
        return res.data;
    },

    async updatePostStatus(id: string, status: PostStatus): Promise<PostItem> {
        const res = await apiClient.patch<PostItem>(`/api/v1/posts/${id}/status?status=${status}`);
        return res.data;
    },
};

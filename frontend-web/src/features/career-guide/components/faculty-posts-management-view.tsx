"use client";

import { useState, useEffect, useCallback } from "react";
import { postService } from "../services/post.service";
import { PostItem, CreatePostPayload, PostStatus } from "../types/post.types";
import { FacultyPostsHeader } from "./faculty/faculty-posts-header";
import { FacultyPostsStats } from "./faculty/faculty-posts-stats";
import { FacultyPostsFilterToolbar } from "./faculty/faculty-posts-filter-toolbar";
import { FacultyPostsTable } from "./faculty/faculty-posts-table";
import { PostEditorModal } from "./faculty/post-editor-modal";

export function FacultyPostsManagementView() {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingPost, setEditingPost] = useState<PostItem | null>(null);

    const loadPosts = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await postService.getManagementPosts();
            setPosts(data);
        } catch (err) {
            console.error("Failed to load management posts", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleOpenCreate = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (post: PostItem) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleSavePost = async (payload: CreatePostPayload, editingId?: string) => {
        if (editingId) {
            await postService.updatePost(editingId, payload);
        } else {
            await postService.createPost(payload);
        }
        await loadPosts();
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
        try {
            await postService.deletePost(id);
            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Failed to delete post", err);
            alert("Có lỗi khi xóa bài viết.");
        }
    };

    const handleTogglePin = async (id: string) => {
        try {
            const updated = await postService.togglePinPost(id);
            setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, isPinned: updated.isPinned } : p)));
        } catch (err) {
            console.error("Failed to toggle pin", err);
        }
    };

    const handleChangeStatus = async (id: string, status: PostStatus) => {
        try {
            await postService.updatePostStatus(id, status);
            setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const filteredPosts = posts.filter((post) => {
        const matchesSearch =
            !searchQuery.trim() ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.summary.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "ALL" || post.category === selectedCategory;
        const matchesStatus =
            selectedStatus === "ALL" || post.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <FacultyPostsHeader
                onOpenCreateModal={handleOpenCreate}
                onRefresh={loadPosts}
                isLoading={isLoading}
            />

            <FacultyPostsStats posts={posts} />

            <FacultyPostsFilterToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                filteredCount={filteredPosts.length}
                totalCount={posts.length}
            />

            <FacultyPostsTable
                posts={filteredPosts}
                onEdit={handleOpenEdit}
                onDelete={handleDeletePost}
                onTogglePin={handleTogglePin}
                onChangeStatus={handleChangeStatus}
                isLoading={isLoading}
            />

            <PostEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePost}
                editingPost={editingPost}
            />
        </div>
    );
}

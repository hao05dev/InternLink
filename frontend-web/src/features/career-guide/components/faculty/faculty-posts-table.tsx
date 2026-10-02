"use client";

import Link from "next/link";
import { Eye, Edit3, Trash2, Pin, PinOff, ExternalLink, Paperclip, MoreVertical, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostItem, POST_CATEGORY_LABELS, PostStatus } from "../../types/post.types";

interface FacultyPostsTableProps {
    posts: PostItem[];
    onEdit: (post: PostItem) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
    onChangeStatus: (id: string, status: PostStatus) => void;
    isLoading?: boolean;
}

export function FacultyPostsTable({
    posts,
    onEdit,
    onDelete,
    onTogglePin,
    onChangeStatus,
    isLoading,
}: FacultyPostsTableProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center text-slate-400">
                Đang tải danh sách bài viết...
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Không tìm thấy bài viết nào
                </p>
                <p className="text-xs text-slate-400">
                    Hãy tạo bài viết mới hoặc xóa bớt bộ lọc tìm kiếm.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4">Bài viết</th>
                            <th className="py-3 px-4">Danh mục</th>
                            <th className="py-3 px-4">Người đăng</th>
                            <th className="py-3 px-4 text-center">Trạng thái</th>
                            <th className="py-3 px-4 text-center">Lượt xem</th>
                            <th className="py-3 px-4 text-center">Ghim</th>
                            <th className="py-3 px-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {posts.map((post) => {
                            const catInfo = POST_CATEGORY_LABELS[post.category] || {
                                label: post.category,
                                badgeClass: "bg-slate-100 text-slate-700",
                            };

                            const isPublished = post.status === "PUBLISHED";

                            return (
                                <tr
                                    key={post.id}
                                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="py-3.5 px-4 max-w-sm">
                                        <div className="flex items-start gap-3">
                                            {post.coverImageUrl ? (
                                                <img
                                                    src={post.coverImageUrl}
                                                    alt=""
                                                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-sky-600">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div className="space-y-1 min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 text-xs">
                                                    {post.title}
                                                </p>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                    {post.attachmentUrls?.length > 0 && (
                                                        <span className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400">
                                                            <Paperclip className="w-3 h-3" />
                                                            {post.attachmentUrls.length} file
                                                        </span>
                                                    )}
                                                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : "Bản nháp"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <Badge
                                            variant="outline"
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catInfo.badgeClass}`}
                                        >
                                            {catInfo.label}
                                        </Badge>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <div className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[140px]">
                                            {post.authorName || "Khoa CNTT"}
                                        </div>
                                        <div className="text-slate-400 text-[11px]">
                                            {post.departmentName || "Khoa CNTT"}
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-4 text-center">
                                        <select
                                            value={post.status}
                                            onChange={(e) => onChangeStatus(post.id, e.target.value as PostStatus)}
                                            className={`px-2 py-1 rounded-md text-[11px] font-semibold border cursor-pointer ${
                                                post.status === "PUBLISHED"
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                                    : post.status === "DRAFT"
                                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                            }`}
                                        >
                                            <option value="PUBLISHED">Công khai</option>
                                            <option value="DRAFT">Bản nháp</option>
                                            <option value="ARCHIVED">Lưu trữ</option>
                                        </select>
                                    </td>

                                    <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-400">
                                        {post.viewCount || 0}
                                    </td>

                                    <td className="py-3.5 px-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onTogglePin(post.id)}
                                            title={post.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                                            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                                post.isPinned
                                                    ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 hover:bg-amber-100"
                                                    : "text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
                                            }`}
                                        >
                                            <Pin className="w-4 h-4" />
                                        </button>
                                    </td>

                                    <td className="py-3.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {isPublished && (
                                                <Link
                                                    href={`/cam-nang/${post.slug}`}
                                                    target="_blank"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                                                    title="Xem bài viết công khai"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => onEdit(post)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                                                title="Chỉnh sửa bài viết"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete(post.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                                title="Xóa bài viết"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

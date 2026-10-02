"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { POST_CATEGORY_LABELS } from "../../types/post.types";

interface FacultyPostsFilterToolbarProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
    selectedCategory: string;
    onCategoryChange: (val: string) => void;
    selectedStatus: string;
    onStatusChange: (val: string) => void;
    filteredCount: number;
    totalCount: number;
}

export function FacultyPostsFilterToolbar({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedStatus,
    onStatusChange,
    filteredCount,
    totalCount,
}: FacultyPostsFilterToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm tiêu đề, tóm tắt bài viết..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                        <option value="ALL">Tất cả danh mục</option>
                        {Object.entries(POST_CATEGORY_LABELS).map(([key, item]) => (
                            <option key={key} value={key}>
                                {item.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PUBLISHED">Đã xuất bản</option>
                        <option value="DRAFT">Bản nháp</option>
                        <option value="ARCHIVED">Đã lưu trữ</option>
                    </select>
                </div>
            </div>

            <div className="text-xs text-slate-400 self-center sm:self-auto shrink-0">
                Hiển thị <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredCount}</span> / {totalCount} bài viết
            </div>
        </div>
    );
}

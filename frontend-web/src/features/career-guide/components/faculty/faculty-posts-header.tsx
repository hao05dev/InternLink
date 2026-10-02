"use client";

import { Plus, BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FacultyPostsHeaderProps {
    onOpenCreateModal: () => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

export function FacultyPostsHeader({
    onOpenCreateModal,
    onRefresh,
    isLoading,
}: FacultyPostsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        Quản lý Cẩm nang & Sự kiện Tuyển dụng
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Soạn thảo, xuất bản biểu mẫu thực tập, tin tức Ngày hội việc làm và chia sẻ kinh nghiệm hướng nghiệp cho sinh viên.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-9 px-3 text-xs gap-1.5 border-slate-200 dark:border-slate-800"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    <span>Làm mới</span>
                </Button>

                <Button
                    onClick={onOpenCreateModal}
                    className="h-9 px-3.5 text-xs font-semibold gap-1.5 bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tạo bài viết mới</span>
                </Button>
            </div>
        </div>
    );
}

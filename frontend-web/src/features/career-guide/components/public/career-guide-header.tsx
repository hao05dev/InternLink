"use client";

import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CareerGuideHeaderProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
}

export function CareerGuideHeader({ searchQuery, onSearchChange }: CareerGuideHeaderProps) {
    return (
        <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-semibold shadow-xs">
                <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Cẩm nang, Sự kiện & Ngày hội Việc làm CICT
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Cẩm nang Hướng nghiệp & Thực tập Doanh nghiệp
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Tổng hợp quy chế học phần, biểu mẫu chuẩn, kỹ năng viết CV, phỏng vấn thực chiến và cập nhật lịch trình Ngày hội việc làm từ Khoa CNTT & TT.
            </p>

            <div className="relative max-w-md mx-auto pt-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Tìm kiếm bài viết, ngày hội việc làm, biểu mẫu..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-full text-sm shadow-xs focus-visible:ring-sky-500"
                />
            </div>
        </div>
    );
}

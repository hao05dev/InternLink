"use client";

import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobSearchEmptyStateProps {
    onResetFilters: () => void;
}

export function JobSearchEmptyState({ onResetFilters }: JobSearchEmptyStateProps) {
    return (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1.5">
                Không tìm thấy vị trí tuyển dụng phù hợp
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                Thử thay đổi từ khóa tìm kiếm, chọn &ldquo;Tất cả các kỳ thực tập&rdquo; hoặc xóa các bộ lọc địa điểm, chuyên ngành để xem các vị trí khác.
            </p>
            <Button 
                variant="outline" 
                onClick={onResetFilters}
                className="cursor-pointer text-xs rounded-full px-5 py-2 font-semibold hover:bg-slate-50"
            >
                Đặt lại toàn bộ bộ lọc
            </Button>
        </div>
    );
}

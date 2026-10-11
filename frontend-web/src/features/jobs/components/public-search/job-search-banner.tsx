"use client";

import { Search, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobSearchBannerProps {
    keyword: string;
    onKeywordChange: (val: string) => void;
    onResetKeyword: () => void;
}

export function JobSearchBanner({
    keyword,
    onKeywordChange,
    onResetKeyword
}: JobSearchBannerProps) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-cict-dark via-cict-navy to-sky-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 border border-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/15 shadow-2xs">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Cổng Thực tập Doanh nghiệp CICT • CTU
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
                    Khám Phá Vị Trí Thực Tập Tốt Nghiệp
                </h1>
                <p className="text-sky-100/90 text-xs sm:text-sm leading-relaxed mb-6">
                    Các vị trí thực tập được thẩm định trực tiếp bởi Ban Quản lý Thực tập Trường CNTT&TT - ĐH Cần Thơ, đảm bảo quyền lợi tích lũy tín chỉ và môi trường đào tạo chuyên nghiệp.
                </p>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => onKeywordChange(e.target.value)}
                            placeholder="Tìm theo vị trí, kỹ năng (Java, React, Tester...), hoặc tên công ty..."
                            className="w-full pl-11 pr-14 py-3.5 bg-white text-slate-900 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-md"
                        />
                        {keyword && (
                            <button 
                                onClick={onResetKeyword}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                    <Button 
                        variant="default" 
                        className="bg-slate-950 hover:bg-slate-900 text-white font-bold px-7 py-3.5 rounded-full shadow-md cursor-pointer text-xs sm:text-sm gap-2"
                    >
                        <span>Tìm kiếm</span>
                        <div className="w-5 h-5 rounded-full bg-white text-slate-950 flex items-center justify-center -mr-1">
                            <Search className="w-3 h-3" />
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}

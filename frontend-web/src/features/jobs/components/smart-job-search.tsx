"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, MapPin, Building2, Briefcase, Sparkles, ArrowRight } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { jobService } from "@/features/jobs/services/job.service";
import { JobPosition } from "@/features/jobs/types/job.types";
import { cn } from "@/lib/utils";

interface SmartJobSearchProps {
    termId?: string;
    onSelectJob?: (job: JobPosition) => void;
    className?: string;
}

const POPULAR_TAGS = ["Java", "Spring Boot", "React", "PostgreSQL", "Cần Thơ", "Remote"];

export function SmartJobSearch({ termId, onSelectJob, className }: SmartJobSearchProps) {
    const [keyword, setKeyword] = useState("");
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const debouncedKeyword = useDebounce(keyword, 350);
    const containerRef = useRef<HTMLDivElement>(null);

    // Xử lý đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Gọi API tìm kiếm Server-Side Search khi debouncedKeyword thay đổi
    useEffect(() => {
        if (!debouncedKeyword.trim()) {
            setJobs([]);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        const fetchJobs = async () => {
            try {
                const results = await jobService.getAllJobs({
                    keyword: debouncedKeyword,
                    termId: termId,
                });
                if (isMounted) {
                    setJobs(results);
                    setIsOpen(true);
                }
            } catch (err) {
                if (isMounted) {
                    setJobs([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchJobs();

        return () => {
            isMounted = false;
        };
    }, [debouncedKeyword, termId]);

    const handleTagClick = (tag: string) => {
        if (activeTag === tag) {
            setActiveTag(null);
            setKeyword("");
        } else {
            setActiveTag(tag);
            setKeyword(tag);
        }
    };

    const handleClear = () => {
        setKeyword("");
        setActiveTag(null);
        setJobs([]);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative w-full max-w-2xl mx-auto", className)}>
            {/* Thanh Input tìm kiếm */}
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Search className="w-5 h-5 text-blue-600" />
                </div>

                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onFocus={() => {
                        if (jobs.length > 0) setIsOpen(true);
                    }}
                    placeholder="Tìm theo vị trí, kỹ năng (Java, React...), công ty, địa điểm..."
                    className="w-full pl-11 pr-20 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    {isLoading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                    {keyword && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Gợi ý từ khóa phổ biến (Quick Tags) */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 px-1">
                <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Gợi ý:
                </span>
                {POPULAR_TAGS.map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className={cn(
                            "text-xs px-2.5 py-1 rounded-full border transition-all",
                            activeTag === tag
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                        )}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Dropdown kết quả tìm kiếm trực tiếp (Live Results Dropdown) */}
            {isOpen && debouncedKeyword.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                    <div className="p-3 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>
                            Kết quả tìm kiếm cho: <strong className="text-blue-600">{'"'}{debouncedKeyword}{'"'}</strong>
                        </span>
                        <span>{jobs.length} vị trí phù hợp</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {jobs.length > 0 ? (
                            jobs.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => {
                                        onSelectJob?.(job);
                                        setIsOpen(false);
                                    }}
                                    className="p-4 hover:bg-blue-50/60 cursor-pointer transition flex items-center justify-between group"
                                >
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-2">
                                            {job.title}
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                                                {job.workFormat}
                                            </span>
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {job.companyName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {job.location}
                                            </span>
                                            {job.stipendAmount && (
                                                <span className="text-emerald-600 font-medium">
                                                    {job.stipendAmount.toLocaleString("vi-VN")} đ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-slate-500">
                                <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm font-medium">Không tìm thấy vị trí thực tập phù hợp</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Thử tìm với các từ khóa công nghệ khác như Java, Spring Boot, React...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
    Search, MapPin, Briefcase, DollarSign, Calendar, Users, 
    Building2, Filter, CheckCircle2, ChevronRight, Sparkles, GraduationCap 
} from "lucide-react";
import { jobService } from "@/services/job.service";
import { JobPosition, WorkFormat } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicShell } from "@/components/layouts/public-shell";

export default function JobsPage() {
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
    const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
    const [onlyWithStipend, setOnlyWithStipend] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        jobService.getAllJobs()
            .then(data => {
                if (mounted) {
                    setJobs(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    // Client-side instant filtering
    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchKw = !keyword.trim() || 
                job.title.toLowerCase().includes(keyword.toLowerCase()) ||
                job.companyName.toLowerCase().includes(keyword.toLowerCase()) ||
                job.location.toLowerCase().includes(keyword.toLowerCase()) ||
                job.skills?.some(s => s.skillName?.toLowerCase().includes(keyword.toLowerCase()));

            const matchFormat = selectedFormat === "ALL" || job.workFormat === selectedFormat;
            const matchMajor = selectedMajor === "ALL" || job.targetProgramCodes?.includes(selectedMajor);
            const matchStipend = !onlyWithStipend || (job.stipendAmount && job.stipendAmount > 0);

            return matchKw && matchFormat && matchMajor && matchStipend;
        });
    }, [jobs, keyword, selectedFormat, selectedMajor, onlyWithStipend]);

    const formatCurrency = (amount?: number) => {
        if (!amount || amount === 0) return "Thương lượng / Phụ cấp dự án";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount) + " / tháng";
    };

    const getWorkFormatBadge = (format: WorkFormat) => {
        switch (format) {
            case "ONSITE":
                return <Badge variant="brand" className="bg-sky-50 text-sky-700 border-sky-200">Trực tiếp (On-site)</Badge>;
            case "HYBRID":
                return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">Kết hợp (Hybrid)</Badge>;
            case "REMOTE":
                return <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">Từ xa (Remote)</Badge>;
            default:
                return null;
        }
    };

    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 rounded-2xl p-6 sm:p-10 text-white shadow-md mb-8">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-700/60 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-sky-600/50">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Cổng Thực tập Doanh nghiệp CICT - CTU
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                            Khám phá Vị trí Thực tập Tốt nghiệp
                        </h1>
                        <p className="text-sky-100 text-sm sm:text-base leading-relaxed mb-6">
                            Các vị trí thực tập được thẩm định trực tiếp bởi Ban Quản lý Thực tập Trường CNTT&TT - ĐH Cần Thơ, đảm bảo quyền lợi tích lũy tín chỉ và môi trường đào tạo chuyên nghiệp.
                        </p>

                        {/* Search Bar */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Tìm theo vị trí, kỹ năng (Java, React, Tester...), hoặc tên công ty..."
                                    className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm"
                                />
                                {keyword && (
                                    <button 
                                        onClick={() => setKeyword("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>
                            <Button 
                                variant="default" 
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl shadow-sm cursor-pointer"
                            >
                                Tìm kiếm
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar Filter */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                                <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                                    <Filter className="w-4 h-4 text-sky-600" />
                                    Bộ lọc tìm kiếm
                                </div>
                                {(selectedFormat !== "ALL" || selectedMajor !== "ALL" || onlyWithStipend || keyword) && (
                                    <button
                                        onClick={() => {
                                            setSelectedFormat("ALL");
                                            setSelectedMajor("ALL");
                                            setOnlyWithStipend(false);
                                            setKeyword("");
                                        }}
                                        className="text-xs text-sky-600 hover:underline font-medium cursor-pointer"
                                    >
                                        Đặt lại
                                    </button>
                                )}
                            </div>

                            {/* Work Format Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                                    Hình thức làm việc
                                </label>
                                <div className="space-y-1.5">
                                    {[
                                        { label: "Tất cả hình thức", value: "ALL" },
                                        { label: "Trực tiếp tại văn phòng (On-site)", value: "ONSITE" },
                                        { label: "Linh hoạt (Hybrid)", value: "HYBRID" },
                                        { label: "Làm việc từ xa (Remote)", value: "REMOTE" },
                                    ].map(item => (
                                        <button
                                            key={item.value}
                                            onClick={() => setSelectedFormat(item.value)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                                selectedFormat === item.value 
                                                    ? "bg-sky-50 text-sky-800 font-semibold border border-sky-200" 
                                                    : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Major / Program Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                                    Chuyên ngành đào tạo
                                </label>
                                <div className="space-y-1.5">
                                    {[
                                        { label: "Tất cả chuyên ngành", value: "ALL" },
                                        { label: "Kỹ thuật phần mềm (SE)", value: "SE" },
                                        { label: "Công nghệ thông tin (IT)", value: "IT" },
                                        { label: "Khoa học máy tính (CS)", value: "CS" },
                                    ].map(item => (
                                        <button
                                            key={item.value}
                                            onClick={() => setSelectedMajor(item.value)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                                selectedMajor === item.value 
                                                    ? "bg-sky-50 text-sky-800 font-semibold border border-sky-200" 
                                                    : "text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stipend Filter */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                                    <input
                                        type="checkbox"
                                        checked={onlyWithStipend}
                                        onChange={(e) => setOnlyWithStipend(e.target.checked)}
                                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span>Chỉ hiện vị trí có hỗ trợ phụ cấp</span>
                                </label>
                            </div>
                        </div>

                        {/* Educational Note Box */}
                        <div className="bg-sky-50 rounded-xl border border-sky-200 p-4 text-xs text-sky-900">
                            <div className="flex items-center gap-2 font-bold mb-1.5 text-sky-950">
                                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                                Bảo trợ học phần chính thức
                            </div>
                            <p className="text-sky-800 leading-relaxed">
                                Tất cả vị trí được doanh nghiệp ký kết tiếp nhận qua cổng thông tin đều được Khoa CNTT&TT công nhận đạt chuẩn học phần Thực tập doanh nghiệp.
                            </p>
                        </div>
                    </div>

                    {/* Right Listing Column */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Result Counter & Active Filters */}
                        <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm text-sm">
                            <span className="text-slate-600 font-medium">
                                Tìm thấy <strong className="text-sky-900 font-bold">{filteredJobs.length}</strong> vị trí thực tập phù hợp
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                                Học kỳ 1 Năm học 2026 - 2027
                            </span>
                        </div>

                        {/* Job Cards */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-4">
                                        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                                        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                        <div className="h-10 bg-slate-50 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-slate-800 mb-1">Không tìm thấy vị trí phù hợp</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                                    Thử thay đổi từ khóa tìm kiếm hoặc chọn lại các bộ lọc hình thức, chuyên ngành để xem các vị trí khác.
                                </p>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setKeyword("");
                                        setSelectedFormat("ALL");
                                        setSelectedMajor("ALL");
                                        setOnlyWithStipend(false);
                                    }}
                                    className="cursor-pointer text-xs"
                                >
                                    Đặt lại bộ lọc
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredJobs.map(job => (
                                    <div 
                                        key={job.id}
                                        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-sky-300 hover:shadow-md transition-all duration-200 group"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                {/* Company Logo */}
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                                                    <Building2 className="w-6 h-6 text-sky-700" />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Link 
                                                        href={`/jobs/${job.id}`}
                                                        className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors block line-clamp-1"
                                                    >
                                                        {job.title}
                                                    </Link>

                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                                                        <span className="font-semibold text-slate-800">{job.companyName}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="flex items-center gap-1 text-slate-500">
                                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                            {job.location}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="flex items-center gap-1 text-slate-500">
                                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                                            {job.vacancies} chỉ tiêu
                                                        </span>
                                                    </div>

                                                    {/* Badges row */}
                                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                                        {getWorkFormatBadge(job.workFormat)}
                                                        <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                                            {formatCurrency(job.stipendAmount)}
                                                        </Badge>
                                                        {job.experienceLevel && (
                                                            <Badge variant="outline" className="text-slate-600 border-slate-200">
                                                                {job.experienceLevel}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-3">
                                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Hạn nộp: <span className="font-semibold text-slate-600">{job.deadline || "30/11/2026"}</span>
                                                </div>
                                                <Link href={`/jobs/${job.id}`}>
                                                    <Button 
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-sky-700 hover:bg-sky-600 text-white font-medium px-4 text-xs cursor-pointer shadow-sm"
                                                    >
                                                        Xem chi tiết & Ứng tuyển
                                                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Job Brief Description */}
                                        <p className="mt-3.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {job.description}
                                        </p>

                                        {/* Skill tags */}
                                        {job.skills && job.skills.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                                <span className="text-[11px] text-slate-400 font-medium mr-1">Kỹ năng:</span>
                                                {job.skills.map((s, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium hover:bg-slate-200 transition-colors"
                                                    >
                                                        {s.skillName || s.skillId}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </PublicShell>
    );
}

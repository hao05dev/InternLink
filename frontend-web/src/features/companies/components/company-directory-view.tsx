"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Globe, ExternalLink, ChevronRight, RotateCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layouts/public-shell";
import { apiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanyItem {
    id: string;
    name: string;
    industry?: string;
    address?: string;
    website?: string;
    taxCode?: string;
    verificationStatus?: string;
    status?: string;
    description?: string;
    employeeRange?: string;
}

export default function CompanyDirectoryView() {
    const [companies, setCompanies] = useState<CompanyItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCompanies = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiClient.get<CompanyItem[]>("/api/v1/companies");
            if (res.data) {
                const verified = res.data.filter(
                    c => c.verificationStatus === "VERIFIED" || c.status === "VERIFIED"
                );
                setCompanies(verified);
            } else {
                setCompanies([]);
            }
        } catch (err: any) {
            setError(err?.message || "Không thể tải danh bạ doanh nghiệp. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-sky-600" />
                            Mạng Lưới Doanh Nghiệp Tiếp Nhận Thực Tập
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Doanh Nghiệp Đã Được Thẩm Định
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            Danh bạ các đơn vị tiếp nhận sinh viên thực tập đã qua xác minh tư cách pháp nhân và điều kiện tiếp nhận từ Ban Quản lý Khoa.
                        </p>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="w-12 h-12 rounded-2xl" />
                                        <Skeleton className="w-20 h-5 rounded-full" />
                                    </div>
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-9 w-full rounded-full pt-2" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3">
                            <p className="text-sm font-semibold text-rose-700">{error}</p>
                            <Button variant="outline" size="sm" onClick={fetchCompanies} className="gap-1.5 text-xs rounded-full">
                                <RotateCcw className="w-3.5 h-3.5" />
                                Thử lại
                            </Button>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800">Chưa có doanh nghiệp được xác minh</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Hiện tại danh bạ doanh nghiệp đối tác đang được cập nhật. Vui lòng quay lại sau hoặc xem các vị trí thực tập đang mở.
                            </p>
                            <Link href="/jobs">
                                <Button variant="outline" size="sm" className="mt-2 text-xs rounded-full">
                                    Xem vị trí thực tập
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {companies.map((company) => (
                                <div 
                                    key={company.id}
                                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-card-hover hover:border-sky-300 transition-colors duration-200 flex flex-col justify-between group"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center p-2 shrink-0">
                                                <Building2 className="w-6 h-6 text-sky-700" />
                                            </div>
                                            <Badge variant="success" className="text-[10px] py-0.5 px-2.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                                Đã xác minh
                                            </Badge>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                                                {company.name}
                                            </h3>
                                            {company.industry && (
                                                <div className="text-xs text-slate-500 mt-1">{company.industry}</div>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                            {company.description || "Đơn vị tiếp nhận sinh viên thực tập thuộc mạng lưới đối tác đã được thẩm định."}
                                        </p>

                                        <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                                            {company.address && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-1">{company.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                                        {company.website ? (
                                            <a 
                                                href={company.website.startsWith("http") ? company.website : `https://${company.website}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                                            >
                                                <Globe className="w-3 h-3" />
                                                Website
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400">Chưa có website</span>
                                        )}
                                        <Link href={`/jobs?companyId=${company.id}`}>
                                            <Button 
                                                variant="outline"
                                                size="sm"
                                                className="text-xs rounded-full hover:border-sky-500 hover:text-sky-700 font-semibold gap-1"
                                            >
                                                <span>Xem vị trí</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PublicShell>
    );
}

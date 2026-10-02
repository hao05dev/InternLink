"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AcademicProgram } from "@/features/organization/types/organization.types";

interface AdminAcademicProgramsCardProps {
    programs: AcademicProgram[];
}

export function AdminAcademicProgramsCard({ programs }: AdminAcademicProgramsCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-700" />
                        Danh mục Ngành đào tạo trực thuộc Khoa (CICT)
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Trường Công nghệ Thông tin & Truyền thông – Đại học Cần Thơ
                    </p>
                </div>
                <Link href="/admin/departments">
                    <Button variant="secondary" size="sm" className="text-xs gap-1 cursor-pointer">
                        Cấu hình <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
                {programs.map((prog) => (
                    <div
                        key={prog.id}
                        className="p-3 rounded-xl bg-slate-50/70 border border-slate-150 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {prog.code}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{prog.name}</p>
                                <p className="text-xs text-slate-400">
                                    Mã ngành: <span className="font-medium text-slate-600">{prog.code}</span> • Hệ{' '}
                                    {prog.track === "HIGH_QUALITY" ? "Chất lượng cao" : "Chính quy"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Đang đào tạo
                            </span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

"use client";

import { Building2, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function BlogSidebarPartnerNotice() {
    return (
        <div className="bg-gradient-to-br from-sky-50 via-indigo-50/50 to-purple-50/30 rounded-3xl border border-sky-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                Bảo trợ Học phần Doanh nghiệp
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
                Mọi thông tin sự kiện và cơ hội việc làm đều được thẩm định bởi Trường CNTT&TT - ĐH Cần Thơ, đảm bảo tiêu chuẩn tích lũy tín chỉ học phần thực tập.
            </p>
            <Link
                href="/companies"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 pt-1 group"
            >
                <Building2 className="w-3.5 h-3.5" />
                <span>Xem mạng lưới 40+ doanh nghiệp</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
        </div>
    );
}

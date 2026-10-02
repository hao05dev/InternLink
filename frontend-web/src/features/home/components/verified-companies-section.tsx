"use client";

import React from "react";
import Link from "next/link";
import { Building2, ShieldCheck, ArrowUpRight } from "lucide-react";

interface VerifiedCompany {
  id: string;
  name: string;
  industry?: string;
  address?: string;
  verificationStatus?: string;
  status?: string;
}

interface VerifiedCompaniesSectionProps {
  companies: VerifiedCompany[];
}

export function VerifiedCompaniesSection({ companies }: VerifiedCompaniesSectionProps) {
  if (!companies || companies.length === 0) return null;

  return (
    <section id="companies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mạng lưới đối tác</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Doanh Nghiệp Đã Được Thẩm Định
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Các đơn vị tiếp nhận sinh viên thực tập đã qua xác minh tư cách pháp nhân từ Ban Quản lý Khoa
          </p>
        </div>

        <Link
          href="/doanh-nghiep"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 transition"
        >
          <span>Xem tất cả đối tác</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {companies.map((comp) => (
          <div
            key={comp.id}
            className="flex items-center gap-2 px-5 py-3 rounded-full border border-slate-200 bg-white font-semibold text-slate-700 text-xs sm:text-sm tracking-tight shadow-2xs hover:border-sky-400 hover:text-sky-700 hover:shadow-card transition-all group cursor-default"
          >
            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors shrink-0" />
            <span className="truncate max-w-xs">{comp.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

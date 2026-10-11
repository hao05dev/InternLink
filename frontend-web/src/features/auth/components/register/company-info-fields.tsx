"use client";

import React from "react";
import { Building2, FileText, Globe, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanyInfoFieldsProps {
  companyName: string;
  setCompanyName: (v: string) => void;
  taxCode: string;
  setTaxCode: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
}

export function CompanyInfoFields({
  companyName,
  setCompanyName,
  taxCode,
  setTaxCode,
  industry,
  setIndustry,
  website,
  setWebsite,
}: CompanyInfoFieldsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Building2 className="h-5 w-5 text-sky-700" />
        <h3 className="text-base font-bold text-slate-900">
          Thông Tin Pháp Nhân Doanh Nghiệp
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">
            Tên Doanh nghiệp / Tổ chức <span className="text-rose-500">*</span>
          </label>
          <Input
            required
            placeholder="Ví dụ: Công ty Cổ phần Phần mềm FPT Cần Thơ"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Mã số thuế (MST) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                required
                placeholder="Ví dụ: 0312999888"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
              />
              <FileText className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Mã số thuế dùng để Khoa thẩm định tính hợp pháp của doanh nghiệp.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Lĩnh vực hoạt động
            </label>
            <div className="relative">
              <Input
                placeholder="Ví dụ: Phát triển phần mềm, AI, Viễn thông"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
              <Layers className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">
            Website chính thức
          </label>
          <div className="relative">
            <Input
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Globe className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

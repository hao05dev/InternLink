'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Building2 } from 'lucide-react';

interface PlacementCompanyFieldsProps {
  companyName: string;
  setCompanyName: (v: string) => void;
  companyTaxCode: string;
  setCompanyTaxCode: (v: string) => void;
  companyAddress: string;
  setCompanyAddress: (v: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (v: string) => void;
}

export function PlacementCompanyFields({
  companyName,
  setCompanyName,
  companyTaxCode,
  setCompanyTaxCode,
  companyAddress,
  setCompanyAddress,
  companyWebsite,
  setCompanyWebsite,
}: PlacementCompanyFieldsProps) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
      <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
        <Building2 className="w-3.5 h-3.5 text-sky-600" />
        <span>Thông tin Doanh nghiệp tiếp nhận</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Tên Doanh nghiệp / Công ty"
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="VD: Công ty TNHH Phần mềm ABC"
          required
        />
        <Input
          label="Mã số thuế doanh nghiệp"
          id="companyTaxCode"
          value={companyTaxCode}
          onChange={(e) => setCompanyTaxCode(e.target.value)}
          placeholder="VD: 1801234567"
        />
        <div className="sm:col-span-2">
          <Input
            label="Địa chỉ trụ sở / Chi nhánh làm việc"
            id="companyAddress"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Website / Fanpage Doanh nghiệp"
            id="companyWebsite"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="https://company.vn"
          />
        </div>
      </div>
    </div>
  );
}

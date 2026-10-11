"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanyAddressFieldsProps {
  street: string;
  setStreet: (v: string) => void;
  ward: string;
  setWard: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  province: string;
  setProvince: (v: string) => void;
}

export function CompanyAddressFields({
  street,
  setStreet,
  ward,
  setWard,
  district,
  setDistrict,
  province,
  setProvince,
}: CompanyAddressFieldsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <MapPin className="h-5 w-5 text-sky-700" />
        <h3 className="text-base font-bold text-slate-900">
          Địa Chỉ Trụ Sở / Văn Phòng Tiếp Nhận
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">
            Số nhà, Tên đường / Tòa nhà <span className="text-rose-500">*</span>
          </label>
          <Input
            required
            placeholder="Ví dụ: Số 02 Nguyễn Trãi, Tòa nhà Innovation"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Phường / Xã
            </label>
            <Input
              placeholder="Ví dụ: Phường Xuân Khánh"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Quận / Huyện <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              placeholder="Ví dụ: Quận Ninh Kiều"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Tỉnh / Thành phố <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              placeholder="Ví dụ: TP. Cần Thơ"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

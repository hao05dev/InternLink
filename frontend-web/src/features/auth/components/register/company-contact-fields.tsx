"use client";

import React from "react";
import { UserCheck, Mail, Phone, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CompanyContactFieldsProps {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
}

export function CompanyContactFields({
  fullName,
  setFullName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
}: CompanyContactFieldsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <UserCheck className="h-5 w-5 text-sky-700" />
        <h3 className="text-base font-bold text-slate-900">
          Thông Tin Người Đại Diện (HR / Quản Lý Tuyển Dụng)
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">
            Họ và tên người đại diện <span className="text-rose-500">*</span>
          </label>
          <Input
            required
            placeholder="Ví dụ: Lê Nguyễn Kim Ngân"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Email công việc (Dùng làm tên đăng nhập) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                required
                type="email"
                placeholder="hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              Số điện thoại liên hệ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                required
                type="tel"
                placeholder="0912 345 678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Phone className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">
            Mật khẩu khởi tạo <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Input
              required
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Lock className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Mật khẩu sẽ dùng để đăng nhập vào Bàn làm việc Doanh nghiệp (Company Portal).
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegisterSuccessModalProps {
  isOpen: boolean;
  companyName: string;
}

export function RegisterSuccessModal({
  isOpen,
  companyName,
}: RegisterSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h3 className="mt-4 text-xl font-bold text-slate-900">
            Đăng Ký Thành Công!
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Hồ sơ pháp nhân <span className="font-semibold text-slate-900">{companyName}</span> đã được ghi nhận trên hệ thống InternLink.
          </p>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-left">
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Trạng thái: Chờ thẩm định (PENDING).</span>
                <p className="mt-1 text-amber-800">
                  Ban Quản lý Thực tập Trường CNTT&TT sẽ thẩm định mã số thuế và pháp nhân. Bạn vẫn có thể đăng nhập ngay để cập nhật hồ sơ và chuẩn bị vị trí tuyển dụng.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link href="/company/dashboard" className="w-full">
              <Button className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold gap-2">
                <span>Vào Bàn làm việc Doanh nghiệp</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

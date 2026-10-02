"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Building2, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RolePortalsSection() {
  const portals = [
    {
      role: "Sinh Viên Thực Tập",
      desc: "Tìm kiếm vị trí thực tập, cập nhật CV, ký thỏa thuận 3 bên, ghi nhật ký hằng ngày và nộp báo cáo.",
      icon: GraduationCap,
      href: "/login",
      colorClass: "bg-sky-50 text-sky-700 border-sky-200/60",
      btnClass: "hover:border-sky-500 hover:text-sky-700",
      badge: "Cổng Sinh Viên",
    },
    {
      role: "Doanh Nghiệp & Mentor",
      desc: "Đăng tin tuyển dụng, xử lý hồ sơ ứng viên, phân công mentor và nhận xét nhật ký thực tập trực tuyến.",
      icon: Building2,
      href: "/login",
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      btnClass: "hover:border-emerald-500 hover:text-emerald-700",
      badge: "Cổng Doanh Nghiệp",
    },
    {
      role: "Giảng Viên Hướng Dẫn",
      desc: "Theo dõi danh sách sinh viên phụ trách, giám sát tiến độ thực tế và chấm điểm báo cáo học phần.",
      icon: UserCheck,
      href: "/login",
      colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
      btnClass: "hover:border-indigo-500 hover:text-indigo-700",
      badge: "Cổng Giảng Viên",
    },
    {
      role: "Ban Quản Lý Khoa CICT",
      desc: "Thẩm định doanh nghiệp, phê duyệt vị trí thực tập, phân công giảng viên và quản lý toàn bộ kỳ thực tập.",
      icon: ShieldCheck,
      href: "/login",
      colorClass: "bg-amber-50 text-amber-700 border-amber-200/60",
      btnClass: "hover:border-amber-500 hover:text-amber-700",
      badge: "Ban QL Khoa",
    },
  ];

  return (
    <section id="portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60 inline-block mb-2">
          Không gian làm việc
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cổng Truy Cập Theo Phân Hệ
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
          Truy cập nhanh vào không gian làm việc chuyên biệt theo vai trò của bạn trên hệ thống InternLink
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {portals.map((portal, idx) => {
          const Icon = portal.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between shadow-2xs group"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${portal.colorClass}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {portal.badge}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{portal.role}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">{portal.desc}</p>
              </div>

              <div className="pt-6">
                <Link href={portal.href} className="block w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full text-xs font-semibold rounded-full gap-1 ${portal.btnClass}`}
                  >
                    <span>Truy cập cổng</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

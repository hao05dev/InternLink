"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ShieldCheck, FileText, CheckCircle2, Award, BarChart3 } from "lucide-react";

export function DarkBentoSection() {
  const features = [
    {
      title: "AI Resume & JD Matching",
      desc: "Tự động phân tích CV sinh viên và gợi ý các vị trí tuyển dụng có độ tương thích cao nhất.",
      icon: Sparkles,
      highlight: false,
      href: "/jobs",
    },
    {
      title: "Thỏa thuận & Pháp lý 3 Bên",
      desc: "Ký kết thỏa thuận tiếp nhận thực tập điện tử, đảm bảo quyền lợi, phụ cấp và bảo hiểm cho sinh viên.",
      icon: ShieldCheck,
      highlight: true, // Vibrant Electric Blue Card
      href: "/cam-nang",
    },
    {
      title: "Nhật ký & Giám sát Tuần",
      desc: "Ghi chép công việc mỗi ngày, tạo điều kiện cho Mentor và Giảng viên hướng dẫn nhận xét 2 chiều.",
      icon: FileText,
      highlight: false,
      href: "/login",
    },
    {
      title: "Doanh nghiệp Đã Thẩm Định",
      desc: "100% doanh nghiệp và tin tuyển dụng được thẩm định tư cách pháp nhân bởi Ban Quản lý Khoa.",
      icon: CheckCircle2,
      highlight: false,
      href: "/doanh-nghiep",
    },
    {
      title: "Hồ sơ Năng lực Động (Portfolio)",
      desc: "Tự động tích lũy kỹ năng, dự án thực tế và nhận xét của Mentor thành Portfolio chuẩn nghề nghiệp.",
      icon: Award,
      highlight: false,
      href: "/login",
    },
    {
      title: "Đánh Giá CLO & Chấm Điểm 3 Bên",
      desc: "Tổng hợp điểm đánh giá từ Mentor doanh nghiệp và Giảng viên hướng dẫn theo chuẩn đầu ra học phần.",
      icon: BarChart3,
      highlight: false,
      href: "/login",
    },
  ];

  return (
    <section className="bg-[#0b0e14] text-white py-20 sm:py-28 px-4 sm:px-8 lg:px-12 rounded-[2rem] sm:rounded-[3rem] my-10 mx-3 sm:mx-6 shadow-2xl border border-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14 sm:mb-20">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-sky-400 text-xs font-semibold border border-white/15 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tính năng cốt lõi</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Quy trình thực tập{" "}
              <span className="inline-flex items-center align-middle mx-1 px-3 py-1 bg-sky-500/20 rounded-full border border-sky-400/30 text-sky-300 text-xs sm:text-sm font-semibold">
                InternLink
              </span>{" "}
              <br />
              minh bạch & chuẩn hóa.
            </h2>
          </div>
          <p className="text-slate-400 max-w-md text-xs sm:text-sm leading-relaxed font-light">
            Giải pháp số hóa toàn bộ học phần thực tập tốt nghiệp cho sinh viên, đồng hành chặt chẽ cùng giảng viên và doanh nghiệp tiếp nhận.
          </p>
        </div>

        {/* Bento Grid (3 columns desktop, 2 tablet, 1 mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`group relative p-7 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between min-h-[250px] ${
                  item.highlight
                    ? "bg-[#0070f3] text-white shadow-xl shadow-blue-600/25 hover:bg-[#0062d6]"
                    : "bg-[#141824] hover:bg-[#1b2131] border border-white/5 text-gray-200"
                }`}
              >
                {/* Top Action Bar */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      item.highlight ? "bg-white/20 text-white" : "bg-white/5 text-sky-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                      item.highlight
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-8">
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-white">{item.title}</h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      item.highlight ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

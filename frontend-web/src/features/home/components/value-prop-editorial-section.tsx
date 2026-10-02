"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, GraduationCap, Building2, ShieldCheck, CheckCircle2, Award } from "lucide-react";

export function ValuePropEditorialSection() {
  const [activeTab, setActiveTab] = useState<"student" | "company" | "faculty">("student");

  const tabContents = {
    student: {
      tag: "Dành cho Sinh viên",
      title: "Chủ động xây dựng lộ trình nghề nghiệp",
      desc: "Tìm kiếm công việc thực tập chuẩn chuyên ngành, theo dõi quy trình ứng tuyển minh bạch và hoàn tất học phần với nhật ký số.",
      badge: "Hồ sơ & CV",
      statLabel: "Đã có hồ sơ",
      highlights: ["AI Gợi ý CV & JD", "Ký thỏa thuận trực tuyến", "Báo cáo nhật ký dễ dàng"],
    },
    company: {
      tag: "Dành cho Doanh nghiệp",
      title: "Tiếp cận nguồn nhân lực trẻ tài năng",
      desc: "Đăng tuyển vị trí miễn phí, nhận hồ sơ sinh viên đã được trường xác thực và quản lý kỳ thực tập hiệu quả với mentor nội bộ.",
      badge: "Tuyển dụng & Đào tạo",
      statLabel: "Đã thẩm định",
      highlights: ["Lọc hồ sơ chuẩn xác", "Phân công Mentor kèm cặp", "Đánh giá trực tuyến tiện lợi"],
    },
    faculty: {
      tag: "Dành cho Nhà trường & Giảng viên",
      title: "Chuẩn hóa & giám sát đào tạo gắn với thực tiễn",
      desc: "Giám sát tiến độ sinh viên tại doanh nghiệp, phân công giảng viên hướng dẫn và thu nhận báo cáo học phần chính xác.",
      badge: "Quản lý học phần",
      statLabel: "Học phần thực tập",
      highlights: ["Phê duyệt tin tuyển dụng", "Theo dõi nhật ký sinh viên", "Chấm điểm trực tiếp"],
    },
  };

  const current = tabContents[activeTab];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Prop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20 sm:mb-28">
          {/* Left Column: Interactive Cards & Tag Pills */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pill Filters */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-full w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("student")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "student"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sinh viên
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("company")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "company"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Doanh nghiệp
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("faculty")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "faculty"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Khoa & Giảng viên
              </button>
            </div>

            {/* Dynamic Card Display */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-cict-navy text-white shadow-xl overflow-hidden min-h-[320px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-medium border border-white/15">
                  {current.tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {current.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {current.desc}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {current.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-1.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Typography & Social Proof */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
                <Award className="w-3.5 h-3.5" />
                <span>Giá trị cốt lõi</span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-normal text-slate-900 leading-snug tracking-tight">
                Xây dựng cầu nối vững chắc giữa <strong className="font-bold text-slate-950">đào tạo đại học</strong> và <strong className="font-bold text-slate-950">thị trường lao động công nghệ</strong>.{" "}
                <span className="text-slate-400 italic">
                  Đồng hành cùng bạn trong từng bước chuyển mình từ giảng đường ra doanh nghiệp.
                </span>
              </h2>
            </div>

            {/* Avatar Stack + CTA */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2 overflow-hidden">
                  {["CT", "VN", "BK", "IT"].map((initial) => (
                    <div
                      key={initial}
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gradient-to-tr from-sky-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-sm"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">500+ Doanh Nghiệp</p>
                  <p className="text-[11px] text-slate-500">Đối tác tiếp nhận thực tập</p>
                </div>
              </div>

              <Link
                href="/doanh-nghiep"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition shadow-xs group"
              >
                <span>Mạng lưới Đối tác Doanh nghiệp</span>
                <ArrowUpRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Authentic Platform Capability Pillars */}
        <div className="pt-12 border-t border-slate-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">Chuẩn hóa toàn trình</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đồng bộ quy trình từ ứng tuyển, thỏa thuận 3 bên đến báo cáo nghiệm thu học phần.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">Thẩm định pháp nhân</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                100% vị trí tuyển dụng được Ban Quản lý Khoa phê duyệt điều kiện tiếp nhận và an toàn đào tạo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">Giám sát hai chiều</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mentor doanh nghiệp duyệt nhật ký hằng ngày song song với Giảng viên hướng dẫn CICT.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                04
              </div>
              <h4 className="text-sm font-bold text-slate-900">Đánh giá chuẩn CLO</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chấm điểm rubric minh bạch, phân tích chuẩn đầu ra và lưu trữ hồ sơ thực tập điện tử.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

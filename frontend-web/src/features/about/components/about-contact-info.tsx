"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Globe, ArrowUpRight, MessageSquare, Building2 } from "lucide-react";

export function AboutContactInfo() {
  return (
    <section aria-labelledby="contact-heading" className="border-t border-slate-200 bg-slate-50/70 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Contact details & Campus address */}
          <div className="lg:col-span-6">
            <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-800">
              Kết Nối & Hợp Tác
            </span>
            <h2 id="contact-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Thông Tin Liên Hệ Trường CNTT&TT
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Mọi nhu cầu tiếp nhận thực tập, ký kết thỏa thuận hợp tác (MoU), hoặc trao đổi học thuật, vui lòng liên hệ với Ban quản lý thực tập và Văn phòng Trường CICT.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ</h3>
                  <p className="text-sm font-medium text-slate-900">
                    Khu II, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Điện thoại</h3>
                    <a href="tel:+842923831301" className="text-sm font-medium text-sky-700 hover:underline">
                      (0292) 3831 301
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</h3>
                    <a href="mailto:cict@ctu.edu.vn" className="text-sm font-medium text-sky-700 hover:underline">
                      cict@ctu.edu.vn
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-sky-700" />
                  <span className="text-sm font-semibold text-sky-900">
                    Cổng thông tin điện tử CICT
                  </span>
                </div>
                <a
                  href="https://cict.ctu.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900"
                >
                  cict.ctu.edu.vn <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: 2 Call to Action cards for Enterprise and Student */}
          <div className="flex flex-col justify-center space-y-4 lg:col-span-6">
            <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dành Cho Doanh Nghiệp Tuyển Dụng</h3>
                  <p className="text-xs text-slate-500">Mở rộng cơ hội tiếp nhận thực tập sinh viên CICT</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Đăng ký tài khoản doanh nghiệp trên InternLink để đăng tuyển vị trí thực tập, nhận hồ sơ ứng tuyển trực tiếp và phối hợp cùng giảng viên hướng dẫn.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/register"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-sky-700 px-4 text-xs font-bold text-white transition hover:bg-sky-800"
                >
                  Đăng ký tuyển dụng
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Khám phá việc làm
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dành Cho Sinh Viên Thực Tập</h3>
                  <p className="text-xs text-slate-500">Kênh giải đáp thắc mắc và hỗ trợ thủ tục thực tập</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Sinh viên cần hỗ trợ về quy trình thỏa thuận 3 bên (Learning Agreement), viết nhật ký thực tập hoặc báo cáo tốt nghiệp, vui lòng liên hệ Trợ lý thực tập hoặc cố vấn học tập.
              </p>
              <div className="mt-4">
                <Link
                  href="/career-guide"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Xem hướng dẫn thực tập & Quy định
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

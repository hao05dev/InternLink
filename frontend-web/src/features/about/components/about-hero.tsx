"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, CheckCircle2, Building, Sparkles } from "lucide-react";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-sky-50/70 via-white to-slate-50/50 py-16 sm:py-20 lg:py-24">
      {/* Background ambient pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-800 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-sky-600" />
              <span>Trường Đại học Cần Thơ • CICT</span>
              <span className="hidden sm:inline text-sky-400">|</span>
              <span className="hidden sm:inline font-normal text-sky-700">Thành lập từ 1994</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-tight">
              Trường Công nghệ Thông tin & Truyền thông
            </h1>

            <p className="mt-2 text-lg font-medium text-sky-700 sm:text-xl">
              Cái nôi đào tạo nhân lực số và chuyển giao công nghệ hàng đầu vùng ĐBSCL
            </p>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Trực thuộc Trường Đại học Cần Thơ, CICT đóng vai trò nòng cốt trong việc đào tạo nguồn nhân lực chất lượng cao, nghiên cứu khoa học và phát triển hệ sinh thái thực tập số hóa gắn liền với nhu cầu thực tiễn của doanh nghiệp.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#departments"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                <span>Khám phá 6 Khoa chuyên môn</span>
                <ArrowDown className="h-4 w-4" />
              </a>

              <a
                href="https://cict.ctu.edu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                <span>Cổng thông tin CICT</span>
                <ArrowUpRight className="h-4 w-4 text-slate-500" />
              </a>

              <Link
                href="/companies"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-sky-700 hover:text-sky-900"
              >
                <span>Mạng lưới doanh nghiệp</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Campus Visual & Key Highlights */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl shadow-sky-950/5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src="/images/hero-building.jpg"
                    alt="Khuôn viên Trường CNTT&TT - Đại học Cần Thơ"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-300">
                      <Building className="h-3.5 w-3.5" />
                      Khu II • Đại học Cần Thơ
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                      Tòa nhà Khoa CNTT&TT – Trung tâm nghiên cứu & thực hành
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-sky-50/80 p-3 text-xs text-sky-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="h-4 w-4 text-sky-600" />
                    Chương trình kiểm định quốc tế AUN-QA
                  </span>
                  <span className="font-semibold text-sky-700">1994 – 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

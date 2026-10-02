"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { JobPosition } from "@/features/jobs/types/job.types";

interface HeroManagedSectionProps {
  onSelectJob?: (job: JobPosition) => void;
  title?: string;
  subtitle?: string;
  bgImage?: string;
  cardImage?: string;
}

export function HeroManagedSection({
  title = "Connected.",
  subtitle = "InternLink là nền tảng quản lý và kết nối thực tập chuẩn hóa trực thuộc Khoa CNTT&TT – Trường Đại học Cần Thơ, đồng hành cùng sinh viên và doanh nghiệp.",
  bgImage = "/images/hero-building.jpg",
  cardImage = "/images/hero-card.jpg",
}: HeroManagedSectionProps) {
  const [bgError, setBgError] = useState(false);
  const [cardImgError, setCardImgError] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-[#388ee6] text-white min-h-[640px] lg:min-h-[780px] flex flex-col justify-between select-none">
      {/* 1. BACKGROUND IMAGE & FALLBACK GRADIENT */}
      <div className="absolute inset-0 z-0">
        {!bgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImage}
            alt="Hero Background"
            onError={() => setBgError(true)}
            className="w-full h-full object-cover object-center scale-[1.01]"
          />
        ) : (
          // Beautiful architectural sky fallback if user hasn't dropped the image yet
          <div className="w-full h-full bg-gradient-to-b from-[#2575fc] via-[#4a90e2] to-[#8ec5fc] relative">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-slate-900/60 to-transparent" />
          </div>
        )}
        {/* Soft overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* 2. MASSIVE DISPLAY TYPOGRAPHY IN UPPER SKY AREA */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-center pt-10 sm:pt-16 pb-8 sm:pb-16">
        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[11.5rem] font-medium tracking-tighter text-white/95 leading-none drop-shadow-md select-none font-sans">
          {title}
        </h1>
      </div>

      {/* 4. BOTTOM OVERLAY CONTENT: SUBTITLE, BUTTONS & FLOATING PREVIEW CARD */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end justify-between">
          {/* Bottom-Left: Subtitle & Dual Action Pills */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-white/95 text-xs sm:text-sm md:text-base max-w-xl font-normal leading-relaxed drop-shadow-md bg-black/20 md:bg-transparent backdrop-blur-xs md:backdrop-blur-none p-3 md:p-0 rounded-2xl md:rounded-none">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Dark Pill Button */}
              <Link
                href="/jobs"
                className="inline-flex items-center gap-3 px-5 sm:px-6 py-3 rounded-full bg-slate-950/90 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold tracking-wide uppercase shadow-2xl border border-white/15 transition-all duration-200 group cursor-pointer"
              >
                <span>Tìm vị trí thực tập</span>
                <div className="w-6 h-6 rounded-full bg-white text-slate-950 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </Link>

              {/* Glass Pill Button */}
              <Link
                href="/doanh-nghiep"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 group cursor-pointer shadow-lg"
              >
                <span>Khám phá doanh nghiệp</span>
                <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Bottom-Right: Floating Preview Card */}
          <div className="lg:col-span-5 flex justify-start lg:justify-end">
            <div className="w-full sm:max-w-xs bg-white text-slate-900 rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-white/60 backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02]">
              {/* Card Image Thumbnail */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 mb-3 border border-slate-100">
                {!cardImgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cardImage}
                    alt="Card Preview"
                    onError={() => setCardImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-blue-500 flex flex-col items-center justify-center text-white p-4 text-center">
                    <Building2 className="w-8 h-8 text-sky-200 mb-1" />
                    <span className="text-xs font-bold">CICT • Đại học Cần Thơ</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                  Verified
                </div>
              </div>

              {/* Card Info */}
              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Thẩm định học phần chính thức
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Đồng bộ thỏa thuận 3 bên, giám sát nhật ký thực tế và hoàn tất đánh giá học phần.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

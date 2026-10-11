"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, MapPin, Clock, ArrowRight, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AcademicHeroBannerProps {
  roleBadge: string;
  userName?: string;
  userCode?: string; // MSSV / Mã cán bộ
  departmentOrCompany?: string;
  academicYear?: string;
  nextEvent?: {
    badgeTitle?: string;
    title: string;
    time: string;
    locationOrDetail: string;
    mentorOrLecturer?: string;
    actionLabel?: string;
    actionHref?: string;
  };
  progress?: {
    label: string;
    current: number;
    total: number;
    unit?: string;
    percentage: number;
  };
  backgroundImage?: string;
  badgeTone?: "sky" | "amber" | "emerald" | "purple" | "indigo";
}

export function AcademicHeroBanner({
  roleBadge,
  userName = "Người dùng",
  userCode,
  departmentOrCompany = "Trường Công nghệ Thông tin & Truyền thông • ĐH Cần Thơ",
  academicYear = "Năm học 2026-2027 • Học kỳ 1",
  nextEvent,
  progress,
  backgroundImage = "/images/hero-building.jpg",
  badgeTone = "sky",
}: AcademicHeroBannerProps) {
  // Lời chào theo thời gian thực (Sáng / Chiều / Tối)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  const todayFormatted = useMemo(() => {
    try {
      const now = new Date();
      return now.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "Hôm nay";
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cict-dark via-cict-navy to-[#0c4a6e] text-white shadow-xl border border-white/10 transition-all">
      {/* Background campus photo blend with smooth gradient overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src={backgroundImage}
          alt="Campus Architectural Landmark"
          fill
          className="object-cover object-right-bottom opacity-20 mix-blend-luminosity scale-105 transform hover:scale-100 transition-transform duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cict-dark via-cict-navy/95 to-transparent w-full lg:w-4/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />
        {/* Decorative architectural grid lines */}
        <div className="absolute -bottom-10 -right-10 w-72 h-72 border border-white/5 rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-9 flex flex-col justify-between min-h-[250px] gap-6">
        {/* Top Header metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-[11px] font-bold uppercase tracking-wider border border-white/15">
              <Sparkles className="w-3 h-3 text-sky-300" />
              {roleBadge}
            </span>
            {userCode && (
              <span className="px-2.5 py-0.5 rounded-full bg-sky-950/60 text-sky-300 text-[11px] font-mono font-medium border border-sky-400/20">
                {userCode}
              </span>
            )}
          </div>

          <div className="text-[11px] text-sky-200/80 font-medium tracking-wide flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <Calendar className="w-3.5 h-3.5 text-sky-300" />
            <span>{academicYear}</span>
          </div>
        </div>

        {/* Greeting & Next Highlight Event */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-3">
            <div>
              <div className="text-xs sm:text-sm font-medium text-sky-200/90 capitalize flex items-center gap-1.5">
                {greeting}, <span className="font-bold text-white">{userName}</span> • {todayFormatted}
              </div>
              <div className="text-[11px] text-sky-300/70 mt-0.5 truncate max-w-xl">
                {departmentOrCompany}
              </div>
            </div>

            {/* Next primary event / class / interview */}
            {nextEvent && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/90 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {nextEvent.badgeTitle || "Sự kiện / Lịch làm việc kế tiếp"}
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight drop-shadow-xs">
                  {nextEvent.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-sky-100/80 mt-2 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-300" />
                    {nextEvent.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-300" />
                    {nextEvent.locationOrDetail}
                  </span>
                  {nextEvent.mentorOrLecturer && (
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                      {nextEvent.mentorOrLecturer}
                    </span>
                  )}
                </div>

                {nextEvent.actionLabel && nextEvent.actionHref && (
                  <div className="mt-3.5 flex items-center gap-2.5">
                    <Link href={nextEvent.actionHref}>
                      <Button
                        size="sm"
                        className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md font-bold text-xs rounded-xl border border-white/20 transition-all shadow-sm"
                      >
                        <Compass className="w-3.5 h-3.5 mr-1.5 text-sky-200" />
                        {nextEvent.actionLabel}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar (Credits, Weeks, Completion Ratio) */}
          {progress && (
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-sky-100">
                <span>{progress.label}</span>
                <span className="font-mono text-white font-bold">
                  {progress.current}/{progress.total} {progress.unit || ""} • {progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-900/50 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-sky-400 to-teal-300 h-full rounded-full transition-all duration-700 shadow-glow-sky"
                  style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                />
              </div>
              <div className="text-[10px] text-sky-200/70 text-right">
                Đã đạt {progress.percentage}% mục tiêu tiến độ
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

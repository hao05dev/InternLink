"use client";

import React from "react";
import { Calendar, Users, Layers, Building2, Award } from "lucide-react";
import { ABOUT_STATS } from "../data/about-cict-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Users,
  Layers,
  Building2,
  Award,
};

export function AboutStats() {
  return (
    <section aria-labelledby="stats-heading" className="border-b border-slate-200/80 bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="stats-heading" className="sr-only">
          Số liệu thống kê nổi bật về Trường CNTT&TT – Đại học Cần Thơ
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {ABOUT_STATS.map((stat) => {
            const Icon = iconMap[stat.iconName] || Award;
            return (
              <div
                key={stat.label}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-xs sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black tracking-tight text-sky-800 sm:text-3xl">
                    {stat.value}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100/70 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900">{stat.label}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

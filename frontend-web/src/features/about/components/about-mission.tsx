"use client";

import React from "react";
import { GraduationCap, Handshake, Cpu, CheckCircle } from "lucide-react";
import { MISSION_PILLARS } from "../data/about-cict-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Handshake,
  Cpu,
};

export function AboutMission() {
  return (
    <section aria-labelledby="mission-heading" className="bg-slate-50/70 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-800">
            Sứ Mạng & Định Hướng
          </span>
          <h2 id="mission-heading" className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Giá Trị Cốt Lõi Tạo Nên Năng Lực Cạnh Tranh
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            CICT chú trọng hài hòa giữa học thuật đỉnh cao, kỹ năng thực chiến tại doanh nghiệp và tư duy giải quyết bài toán thực tế.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {MISSION_PILLARS.map((pillar) => {
            const Icon = iconMap[pillar.iconName] || GraduationCap;
            return (
              <div
                key={pillar.title}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs transition hover:border-sky-300 hover:shadow-md"
              >
                <div>
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                  <p className="mt-1 text-xs font-semibold tracking-wide text-sky-700 uppercase">
                    {pillar.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Điểm nổi bật:
                  </h4>
                  <ul className="mt-2.5 space-y-2 text-sm text-slate-700">
                    {pillar.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, Building2, UserCheck } from "lucide-react";
import { ECOSYSTEM_PILLARS, ECOSYSTEM_STEPS } from "../data/about-cict-data";

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Nhà trường (CICT)": ShieldCheck,
  "Doanh nghiệp tiếp nhận": Building2,
  "Sinh viên thực tập": UserCheck,
};

export function AboutInternshipEcosystem() {
  return (
    <section aria-labelledby="ecosystem-heading" className="bg-slate-50/70 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-800">
            Mô Hình Chuẩn Hóa
          </span>
          <h2 id="ecosystem-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Hệ Sinh Thái Thực Tập 3 Bên Minh Bạch
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Nền tảng InternLink kết nối chặt chẽ trách nhiệm giữa Nhà trường – Doanh nghiệp – Sinh viên nhằm đảm bảo tính thực tiễn và chuẩn hóa học phần thực tập.
          </p>
        </div>

        {/* 3 Pillars Card Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ECOSYSTEM_PILLARS.map((pillar) => {
            const Icon = roleIcons[pillar.role] || ShieldCheck;
            return (
              <div
                key={pillar.role}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-sky-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-sky-100/70 px-2.5 py-1 text-xs font-semibold text-sky-800">
                      {pillar.badge}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    {pillar.role}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-sky-700">
                    {pillar.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Trách nhiệm chính:
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                    {pillar.responsibilities.map((resp) => (
                      <li key={resp} className="flex items-start gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4-Step Linear Flow */}
        <div className="mt-14 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900">
              Quy Trình 4 Bước Chuẩn Hóa Trên Nền Tảng InternLink
            </h3>
            <p className="text-sm text-slate-500">
              Mọi mốc thời gian, nhật ký và phiếu đánh giá đều được số hóa và đồng bộ theo thời gian thực.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ECOSYSTEM_STEPS.map((step, idx) => (
              <div
                key={step.step}
                className="relative flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">
                      0{step.step}
                    </span>
                    {idx < ECOSYSTEM_STEPS.length - 1 && (
                      <ArrowRight className="hidden lg:block h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">
                    {step.title}
                  </h4>
                  <p className="text-xs font-semibold text-sky-700">
                    {step.subtitle}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

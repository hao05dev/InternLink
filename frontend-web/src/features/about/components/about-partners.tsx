"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, Presentation, Gift, ArrowUpRight, Building2 } from "lucide-react";
import { ENTERPRISE_PARTNERS, PARTNER_ACTIVITIES } from "../data/about-cict-data";

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Presentation,
  Gift,
};

export function AboutPartners() {
  return (
    <section aria-labelledby="partners-heading" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-800">
              Liên Kết Doanh Nghiệp
            </span>
            <h2 id="partners-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Mạng Lưới 200+ Doanh Nghiệp Đồng Hành
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              CICT không ngừng mở rộng hợp tác chiến lược với các tập đoàn công nghệ hàng đầu, mang đến môi trường thực tập và làm việc chuẩn quốc tế cho sinh viên.
            </p>
          </div>

          <Link
            href="/companies"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 self-start md:self-auto shrink-0"
          >
            <span>Xem danh bạ doanh nghiệp</span>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>

        {/* Partners Grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {ENTERPRISE_PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-center transition hover:border-sky-300 hover:bg-white hover:shadow-2xs"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100/60 text-sky-700">
                <Building2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{partner.name}</h4>
              <p className="mt-1 text-[11px] text-slate-500">{partner.field}</p>
              <span
                className={`mt-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  partner.tier === "Chiến lược"
                    ? "bg-sky-100 text-sky-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {partner.tier}
              </span>
            </div>
          ))}
        </div>

        {/* Key Annual Collaboration Activities */}
        <div className="mt-14">
          <h3 className="text-xl font-bold text-slate-900">
            Các Hoạt Động Hợp Tác Trọng Điểm
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Tạo sân chơi công nghệ, kết nối tuyển dụng và nâng cao năng lực cho thế hệ kỹ sư trẻ.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {PARTNER_ACTIVITIES.map((act) => {
              const Icon = activityIcons[act.iconName] || Briefcase;
              return (
                <div
                  key={act.title}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/40 p-6 transition hover:border-sky-300 hover:bg-white"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
                        {act.badge}
                      </span>
                      <Icon className="h-5 w-5 text-sky-700" />
                    </div>
                    <h4 className="mt-3 text-base font-bold text-slate-900">{act.title}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{act.description}</p>
                  </div>
                  <div className="mt-4 border-t border-slate-200/60 pt-3 text-xs font-medium text-slate-500">
                    Thời gian: <span className="font-semibold text-slate-700">{act.frequency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

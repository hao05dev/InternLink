"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AcademicStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  targetOrStatus?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  href?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function AcademicStatCard({
  title,
  value,
  subtitle,
  targetOrStatus,
  icon: Icon,
  iconColor = "text-sky-700",
  iconBg = "bg-sky-50",
  href,
  trend,
  className,
}: AcademicStatCardProps) {
  const content = (
    <Card
      className={cn(
        "rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-card hover:shadow-card-hover hover:border-sky-300 transition-all duration-200 h-full group",
        href && "cursor-pointer",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {title}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight group-hover:text-cict-700 transition">
              {value}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {Icon && (
              <div
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                  iconBg,
                  iconColor
                )}
              >
                <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
            )}
            {href && (
              <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center text-slate-400 group-hover:text-sky-600 transition">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Subtitle / Educational Context / Target status */}
        <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] sm:text-xs">
          {targetOrStatus ? (
            <div className="text-slate-600 font-medium truncate" title={targetOrStatus}>
              {targetOrStatus}
            </div>
          ) : subtitle ? (
            <div className="text-slate-500 truncate" title={subtitle}>
              {subtitle}
            </div>
          ) : (
            <div className="text-slate-400">Đã cập nhật theo kỳ</div>
          )}

          {trend && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full font-bold text-[10px]",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BrainCircuit, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface AcademicAiInsightCardProps {
  title?: string;
  advice: string;
  highlightText?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function AcademicAiInsightCard({
  title = "InternLink AI Insights",
  advice,
  highlightText,
  actionHref = "/student/ai",
  actionLabel = "Mở trợ lý AI",
}: AcademicAiInsightCardProps) {
  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/30 shadow-card hover:shadow-card-hover transition-all">
      <CardContent className="p-5 sm:p-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                {title}
                <span className="px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800 text-[10px] font-semibold">
                  Co-pilot
                </span>
              </div>
              <div className="text-[10px] text-slate-500">Phân tích dữ liệu & Gợi ý tự động</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {highlightText && (
            <span className="font-semibold text-sky-900 block mb-1">
              {highlightText}
            </span>
          )}
          {advice}
        </p>

        {actionHref && (
          <div className="pt-1 flex items-center justify-between">
            <Link href={actionHref}>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-sky-700 hover:text-sky-800 hover:bg-sky-100/60 p-0 h-auto inline-flex items-center gap-1"
              >
                {actionLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <span className="text-[10px] text-slate-400 font-mono">Gemini AI Model</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

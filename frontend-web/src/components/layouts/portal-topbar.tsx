"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Menu, RefreshCw, Sun, LogOut } from "lucide-react";
import { NotificationCenter } from "@/features/notifications/components/notification-center";

export interface PortalTopbarProps {
  portalTitle: string;
  onOpenSidebar: () => void;
}

export function PortalTopbar({ portalTitle, onOpenSidebar }: PortalTopbarProps) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-20">
      {/* Trái: Menu mobile toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2 truncate">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Link href="/" className="hover:text-sky-700 transition font-medium">
            Cổng thông tin
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900 truncate">
            {portalTitle}
          </span>
        </div>
      </div>

      {/* Phải: Các nút tiện ích (Đồng bộ, Theme, Thông báo, Việc làm, Đăng xuất) */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Nút Đồng bộ theo phong cách HCMUE PLUS */}
        <button
          onClick={() => {
            router.refresh();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-2xs transition"
          title="Đồng bộ lại dữ liệu mới nhất"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500 hover:rotate-180 transition-transform duration-500" />
          <span className="hidden sm:inline">Đồng bộ</span>
        </button>

        {/* Nút Theme toggle */}
        <button
          type="button"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition hidden sm:inline-flex"
          title="Chế độ hiển thị"
        >
          <Sun className="w-4 h-4" />
        </button>

        <NotificationCenter />

        <Link
          href="/jobs"
          className="text-xs font-semibold text-slate-600 hover:text-sky-700 transition hidden md:inline-block"
        >
          Việc làm thực tập
        </Link>

        <button
          onClick={() => logout()}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer pl-1"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}

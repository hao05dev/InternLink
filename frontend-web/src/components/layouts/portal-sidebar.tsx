"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { UserRole } from "@/features/auth/types/auth.types";
import {
  GraduationCap,
  X,
  ChevronRight,
  ChevronDown,
  QrCode,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PORTAL_NAV_MAP,
  getFlattenedNavLinks,
  type NavCategoryItem,
} from "./portal-nav-config";

export interface PortalSidebarProps {
  portalRole: UserRole;
  sidebarOpen: boolean;
  onClose: () => void;
}

export function PortalSidebar({
  portalRole,
  sidebarOpen,
  onClose,
}: PortalSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const config = PORTAL_NAV_MAP[portalRole] || PORTAL_NAV_MAP.STUDENT;
  const allNavLinks = getFlattenedNavLinks(config);

  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  const activeItem = allNavLinks
    .filter(
      (item) =>
        normalizedPath === item.href ||
        normalizedPath.startsWith(item.href + "/")
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  const isHomeActive = activeItem?.href === config.homeItem.href;

  const toggleCategory = (catLabel: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catLabel]: prev[catLabel] === undefined ? false : !prev[catLabel],
    }));
  };

  const isCategoryExpanded = (cat: NavCategoryItem) => {
    if (openCategories[cat.label] !== undefined) {
      return openCategories[cat.label];
    }
    // Mặc định mở
    return true;
  };

  const HomeIcon = config.homeItem.icon;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}
    >
      <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-0">
        {/* Logo CICT - CTU */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-cict-navy flex items-center justify-center text-white shadow-sm shadow-cict-navy/30 group-hover:bg-cict-700 transition shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-slate-900 text-sm tracking-tight">
                InternLink
              </div>
              <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                CICT • CTU
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Role Badge */}
        <div className="my-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 shrink-0">
          <div className="text-xs font-bold text-slate-900">
            {config.title}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
            {config.subtitle}
          </div>
        </div>

        {/* Navigation theo nhóm & đường nhánh cây (Hình 3 style) */}
        <nav className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3">
          {/* Nút Hero Trang chủ / Bàn làm việc */}
          <Link
            href={config.homeItem.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
              isHomeActive
                ? "bg-sky-50 text-sky-800 border border-sky-200/80 shadow-2xs"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            )}
          >
            <HomeIcon
              className={cn(
                "w-4 h-4 shrink-0",
                isHomeActive ? "text-sky-700" : "text-slate-500"
              )}
            />
            <span className="truncate">{config.homeItem.label}</span>
          </Link>

          {/* Các nhóm danh mục */}
          {config.groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.groupTitle && (
                <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  {group.groupTitle}
                </div>
              )}

              {group.categories.map((cat, cIdx) => {
                const Icon = cat.icon;
                const hasChildren = Boolean(cat.children && cat.children.length > 0);
                const expanded = hasChildren ? isCategoryExpanded(cat) : false;
                const hasActiveChild = hasChildren
                  ? cat.children!.some((child) => child.href === activeItem?.href)
                  : false;

                if (hasChildren) {
                  return (
                    <div key={cIdx} className="space-y-0.5">
                      {/* Tiêu đề chuyên mục cha */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.label)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group select-none",
                          hasActiveChild
                            ? "text-slate-900 font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0 transition-colors",
                              hasActiveChild
                                ? "text-sky-700"
                                : "text-slate-400 group-hover:text-slate-600"
                            )}
                          />
                          <span className="truncate">{cat.label}</span>
                        </div>
                        {expanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                        )}
                      </button>

                      {/* Các mục con dạng nhánh cây */}
                      {expanded && (
                        <div className="ml-4 pl-3.5 border-l border-slate-200/90 space-y-0.5 my-1">
                          {cat.children!.map((child) => {
                            const isChildActive = activeItem?.href === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onClose}
                                className={cn(
                                  "block px-2.5 py-1.5 rounded-lg text-xs transition-all",
                                  isChildActive
                                    ? "bg-sky-50 text-sky-800 font-bold border border-sky-200/80 shadow-2xs"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                )}
                              >
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Mục danh mục đơn lẻ
                const isActive = activeItem?.href === cat.href;
                return (
                  <Link
                    key={cIdx}
                    href={cat.href!}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      isActive
                        ? "bg-sky-50 text-sky-800 font-bold border border-sky-200/80 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-sky-700" : "text-slate-400"
                      )}
                    />
                    <span className="truncate">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Thẻ User Profile chân trang (HCMUE PLUS style) */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cict-navy text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0 ring-2 ring-sky-100">
              {user?.fullName ? (
                (() => {
                  const parts = user.fullName.trim().split(/\s+/);
                  return parts.length >= 2
                    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                    : user.fullName.slice(0, 2).toUpperCase();
                })()
              ) : "CT"}
            </div>
            <div className="truncate text-xs min-w-0">
              <div
                className="font-bold text-slate-900 truncate max-w-[100px]"
                title={user?.fullName}
              >
                {user?.fullName || "Người dùng"}
              </div>
              <div
                className="text-[10px] font-mono text-slate-500 truncate"
                title={user?.email}
              >
                {user?.email ? user.email.split("@")[0].toUpperCase() : "ID: 2026"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => logout()}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <ChevronsUpDown className="w-4 h-4" />
            </button>
            <div className="p-1 text-slate-300 hidden sm:block">
              <QrCode className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

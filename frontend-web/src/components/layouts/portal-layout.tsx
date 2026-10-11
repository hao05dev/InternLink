"use client";

import React, { useState } from "react";
import { UserRole } from "@/features/auth/types/auth.types";
import { RoleGuard } from "@/features/auth/components/role-guard";
import { PORTAL_NAV_MAP } from "./portal-nav-config";
import { PortalSidebar } from "./portal-sidebar";
import { PortalTopbar } from "./portal-topbar";

// Re-export types for backward compatibility
export type {
  SubNavItem,
  NavCategoryItem,
  NavGroup,
  NavItem,
  PortalRoleConfig,
} from "./portal-nav-config";
export { PORTAL_NAV_MAP } from "./portal-nav-config";

export interface PortalLayoutProps {
  portalRole: UserRole;
  children: React.ReactNode;
}

/**
 * PortalLayout - Khung layout chính cho toàn bộ các Portal theo từng Role.
 * Tuân thủ Single Responsibility: Chỉ đóng vai trò điều phối bố cục khung (Layout Shell),
 * phân tách độc lập PortalSidebar (menu trái) và PortalTopbar (thanh header trên).
 */
export function PortalLayout({ portalRole, children }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = PORTAL_NAV_MAP[portalRole] || PORTAL_NAV_MAP.STUDENT;

  return (
    <RoleGuard allowedRoles={[portalRole]}>
      <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 flex">
        {/* Mobile Backdrop che mờ khi mở menu trên điện thoại */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar bên trái theo nhóm danh mục Hình 3 */}
        <PortalSidebar
          portalRole={portalRole}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Khung nội dung chính */}
        <div className="flex-1 flex flex-col min-w-0 lg:h-screen lg:overflow-hidden">
          {/* Topbar phía trên */}
          <PortalTopbar
            portalTitle={config.title}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          {/* Vùng hiển thị nội dung trang (Page Content) */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
            <div className="max-w-7xl mx-auto w-full min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

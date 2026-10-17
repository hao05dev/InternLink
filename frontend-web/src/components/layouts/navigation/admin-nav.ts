import { BrainCircuit, HardDrive, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import type { PortalRoleConfig } from "./portal-nav.types";

export const adminNav: PortalRoleConfig = {
    title: "Quản Trị Hệ Thống",
    subtitle: "Hệ thống Cổng InternLink",
    homeItem: {
      label: "Tổng quan hệ thống",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    groups: [
      {
        groupTitle: "QUẢN TRỊ DỮ LIỆU & NGƯỜI DÙNG",
        categories: [
          {
            label: "Cơ sở dữ liệu",
            icon: Users,
            children: [
              { label: "Quản lý người dùng", href: "/admin/users" },
              { label: "Danh bạ doanh nghiệp", href: "/admin/companies" },
              { label: "Khoa & Ngành đào tạo", href: "/admin/departments" },
            ],
          },
        ],
      },
      {
        groupTitle: "HẠ TẦNG & TRUYỀN THÔNG",
        categories: [
          {
            label: "Hạ tầng & Dịch vụ",
            icon: HardDrive,
            children: [
              { label: "Vận hành lưu trữ", href: "/admin/storage" },
              {
                label: "Vận hành email",
                href: "/admin/notifications/email",
              },
              {
                label: "Gửi thông báo theo đợt",
                href: "/admin/notifications/campaigns",
              },
              { label: "Thông báo", href: "/admin/notifications" },
            ],
          },
        ],
      },
      {
        groupTitle: "AN NINH & CÔNG NGHỆ",
        categories: [
          {
            label: "Quản lý AI",
            icon: BrainCircuit,
            href: "/admin/ai",
          },
          {
            label: "Nhật ký kiểm toán",
            icon: ShieldCheck,
            href: "/admin/audit-logs",
          },
        ],
      },
    ],
  };

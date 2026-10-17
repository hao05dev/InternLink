import { Award, Bell, BrainCircuit, Briefcase, LayoutDashboard, Users } from "lucide-react";
import type { PortalRoleConfig } from "./portal-nav.types";

export const companyNav: PortalRoleConfig = {
    title: "Cổng Doanh Nghiệp",
    subtitle: "Đơn vị tiếp nhận thực tập",
    homeItem: {
      label: "Bàn làm việc",
      href: "/company/dashboard",
      icon: LayoutDashboard,
    },
    groups: [
      {
        groupTitle: "TUYỂN DỤNG THỰC TẬP",
        categories: [
          {
            label: "Tin tuyển dụng",
            icon: Briefcase,
            children: [
              { label: "Đăng tin tuyển dụng", href: "/company/jobs/new" },
              { label: "Quản lý tuyển dụng", href: "/company/jobs" },
              { label: "Hồ sơ doanh nghiệp", href: "/company/profile" },
            ],
          },
          {
            label: "Hồ sơ ứng viên",
            icon: Users,
            href: "/company/candidates",
          },
        ],
      },
      {
        groupTitle: "QUẢN LÝ THỰC TẬP SINH",
        categories: [
          {
            label: "Thực tập sinh & Mentor",
            icon: Award,
            href: "/company/interns",
          },
        ],
      },
      {
        groupTitle: "CÔNG CỤ & DỊCH VỤ",
        categories: [
          {
            label: "Hỗ trợ AI",
            icon: BrainCircuit,
            href: "/company/ai",
          },
          {
            label: "Thông báo",
            icon: Bell,
            href: "/company/notifications",
          },
        ],
      },
    ],
  };

import { Award, Bell, BookOpen, BrainCircuit, LayoutDashboard } from "lucide-react";
import type { PortalRoleConfig } from "./portal-nav.types";

export const mentorNav: PortalRoleConfig = {
    title: "Cổng Cán Bộ Hướng Dẫn",
    subtitle: "Mentor Doanh nghiệp",
    homeItem: {
      label: "Bàn làm việc",
      href: "/mentor/dashboard",
      icon: LayoutDashboard,
    },
    groups: [
      {
        groupTitle: "HƯỚNG DẪN & THEO DÕI",
        categories: [
          {
            label: "Nhiệm vụ & Nhật ký",
            icon: BookOpen,
            children: [
              { label: "Giao việc & Hồ sơ", href: "/mentor/internship-record" },
              {
                label: "Theo dõi nhật ký ngày",
                href: "/mentor/weekly-evaluations",
              },
            ],
          },
        ],
      },
      {
        groupTitle: "ĐÁNH GIÁ KẾT QUẢ",
        categories: [
          {
            label: "Đánh giá kết thúc kỳ",
            icon: Award,
            href: "/mentor/final-assessment",
          },
        ],
      },
      {
        groupTitle: "CÔNG CỤ & DỊCH VỤ",
        categories: [
          {
            label: "Hỗ trợ AI",
            icon: BrainCircuit,
            href: "/mentor/ai",
          },
          {
            label: "Thông báo",
            icon: Bell,
            href: "/mentor/notifications",
          },
        ],
      },
    ],
  };

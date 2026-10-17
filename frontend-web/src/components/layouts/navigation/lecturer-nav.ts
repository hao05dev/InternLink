import { Award, Bell, BrainCircuit, CheckSquare, LayoutDashboard } from "lucide-react";
import type { PortalRoleConfig } from "./portal-nav.types";

export const lecturerNav: PortalRoleConfig = {
    title: "Cổng Giảng Viên",
    subtitle: "Giảng viên hướng dẫn CICT",
    homeItem: {
      label: "Bàn làm việc GVHD",
      href: "/lecturer/dashboard",
      icon: LayoutDashboard,
    },
    groups: [
      {
        groupTitle: "HƯỚNG DẪN & THEO DÕI",
        categories: [
          {
            label: "Giám sát sinh viên",
            icon: CheckSquare,
            children: [
              { label: "Theo dõi & Nhận xét", href: "/lecturer/supervision" },
              {
                label: "Báo cáo & Biểu mẫu",
                href: "/lecturer/internship-record",
              },
            ],
          },
        ],
      },
      {
        groupTitle: "CHẤM ĐIỂM & ĐÁNH GIÁ",
        categories: [
          {
            label: "Chấm điểm & Báo cáo CLO",
            icon: Award,
            href: "/lecturer/grading",
          },
        ],
      },
      {
        groupTitle: "CÔNG CỤ & DỊCH VỤ",
        categories: [
          {
            label: "Hỗ trợ AI",
            icon: BrainCircuit,
            href: "/lecturer/ai",
          },
          {
            label: "Thông báo",
            icon: Bell,
            href: "/lecturer/notifications",
          },
        ],
      },
    ],
  };

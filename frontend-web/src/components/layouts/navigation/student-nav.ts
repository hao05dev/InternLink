import { Bell, BookOpen, BrainCircuit, Briefcase, LayoutDashboard, User } from "lucide-react";
import type { PortalRoleConfig } from "./portal-nav.types";

export const studentNav: PortalRoleConfig = {
    title: "Cổng Sinh Viên",
    subtitle: "Trường CNTT&TT - ĐH Cần Thơ",
    homeItem: {
      label: "Tổng quan",
      href: "/student/dashboard",
      icon: LayoutDashboard,
    },
    groups: [
      {
        groupTitle: "TUYỂN DỤNG & ỨNG TUYỂN",
        categories: [
          {
            label: "Ứng tuyển thực tập",
            icon: Briefcase,
            children: [
              { label: "Đơn ứng tuyển", href: "/student/applications" },
              { label: "Thỏa thuận 3 bên", href: "/student/learning-agreement" },
            ],
          },
          {
            label: "Hồ sơ cá nhân",
            icon: User,
            href: "/student/profile",
          },
        ],
      },
      {
        groupTitle: "TIẾN TRÌNH THỰC TẬP",
        categories: [
          {
            label: "Học tập & Ghi chép",
            icon: BookOpen,
            children: [
              { label: "Hồ sơ thực tập", href: "/student/internship-record" },
              { label: "Nhật ký hằng ngày", href: "/student/daily-logs" },
              { label: "Báo cáo & Kết quả", href: "/student/final-report" },
            ],
          },
        ],
      },
      {
        groupTitle: "CÔNG CỤ & DỊCH VỤ",
        categories: [
          {
            label: "Hỗ trợ AI",
            icon: BrainCircuit,
            href: "/student/ai",
          },
          {
            label: "Thông báo",
            icon: Bell,
            href: "/student/notifications",
          },
        ],
      },
    ],
  };

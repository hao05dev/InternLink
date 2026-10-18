import { Award, BrainCircuit, Building2, GraduationCap, LayoutDashboard, Newspaper } from "lucide-react";
import type { PortalRoleConfig } from "./portal-nav.types";

export const facultyNav: PortalRoleConfig = {
    title: "Ban Quản Lý Thực Tập",
    subtitle: "Khoa / Trường CNTT&TT",
    homeItem: {
      label: "Tổng quan học kỳ",
      href: "/faculty/dashboard",
      icon: LayoutDashboard,
    },
    groups: [
      {
        groupTitle: "ĐÀO TẠO & HỌC KỲ",
        categories: [
          {
            label: "Tổ chức kỳ thực tập",
            icon: GraduationCap,
            children: [
              { label: "Kỳ thực tập (Terms)", href: "/faculty/terms" },
              { label: "Danh sách sinh viên", href: "/faculty/roster" },
              {
                label: "Quản lý tiến trình TT",
                href: "/faculty/internship-management",
              },
              { label: "Phân công GVHD", href: "/faculty/assignments" },
            ],
          },
        ],
      },
      {
        groupTitle: "DOANH NGHIỆP & THẨM ĐỊNH",
        categories: [
          {
            label: "Đối tác & Tuyển dụng",
            icon: Building2,
            children: [
              { label: "Duyệt doanh nghiệp", href: "/faculty/companies" },
              { label: "Duyệt tin tuyển dụng", href: "/faculty/job-approvals" },
              {
                label: "Giấy giới thiệu TT",
                href: "/faculty/introduction-letters",
              },
            ],
          },
        ],
      },
      {
        groupTitle: "HỒ SƠ & ĐÁNH GIÁ",
        categories: [
          {
            label: "Kết quả đào tạo",
            icon: Award,
            children: [
              {
                label: "Hồ sơ & Công bố phiếu",
                href: "/faculty/internship-record",
              },
              { label: "Bảng điểm & Đánh giá", href: "/faculty/evaluations" },
              { label: "Biểu mẫu thực tập (R2)", href: "/faculty/templates" },
            ],
          },
        ],
      },
      {
        groupTitle: "TRUYỀN THÔNG & TIỆN ÍCH",
        categories: [
          {
            label: "Truyền thông Khoa",
            icon: Newspaper,
            children: [
              { label: "Tin tức & Blog", href: "/faculty/posts" },
              {
                label: "Gửi thông báo theo đợt",
                href: "/faculty/notifications/campaigns",
              },
              { label: "Thông báo", href: "/faculty/notifications" },
            ],
          },
          {
            label: "Hỗ trợ AI",
            icon: BrainCircuit,
            href: "/faculty/ai",
          },
        ],
      },
    ],
  };

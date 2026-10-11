import React from "react";
import { UserRole } from "@/features/auth/types/auth.types";
import {
  User,
  LayoutDashboard,
  Briefcase,
  Award,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
  BookOpen,
  Layers,
  CheckSquare,
  BrainCircuit,
  Newspaper,
  HardDrive,
  Bell,
  GraduationCap,
} from "lucide-react";

export interface SubNavItem {
  label: string;
  href: string;
}

export interface NavCategoryItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SubNavItem[];
}

export interface NavGroup {
  groupTitle?: string;
  categories: NavCategoryItem[];
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PortalRoleConfig {
  title: string;
  subtitle: string;
  homeItem: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  groups: NavGroup[];
}

export const PORTAL_NAV_MAP: Record<UserRole, PortalRoleConfig> = {
  STUDENT: {
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
  },
  COMPANY_REP: {
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
  },
  COMPANY_MENTOR: {
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
  },
  FACULTY_ADMIN: {
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
  },
  LECTURER: {
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
  },
  ADMIN: {
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
  },
};

/** Lấy danh sách toàn bộ các đường dẫn có thể điều hướng để tính toán active link */
export function getFlattenedNavLinks(config: PortalRoleConfig): Array<{ label: string; href: string }> {
  return [
    config.homeItem,
    ...config.groups.flatMap((g) =>
      g.categories.flatMap((cat) =>
        cat.children && cat.children.length > 0
          ? cat.children
          : cat.href
          ? [{ label: cat.label, href: cat.href }]
          : []
      )
    ),
  ];
}

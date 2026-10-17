import { Bell, Newspaper } from "lucide-react";
import type { PortalRoleConfig } from "./portal-nav.types";

export const blogmanagerNav: PortalRoleConfig = {
    title: "Cổng Quản Lý Blog & Truyền Thông",
    subtitle: "Trường CNTT&TT - ĐH Cần Thơ",
    homeItem: {
      label: "Quản lý bài viết",
      href: "/blog-manager/posts",
      icon: Newspaper,
    },
    groups: [
      {
        groupTitle: "NỘI DUNG & TRUYỀN THÔNG",
        categories: [
          {
            label: "Bài viết & Tin tức",
            icon: Newspaper,
            children: [
              { label: "Quản lý bài viết", href: "/blog-manager/posts" },
              { label: "Cẩm nang sinh viên", href: "/career-guide" },
            ],
          },
        ],
      },
      {
        groupTitle: "CÔNG CỤ & TIỆN ÍCH",
        categories: [
          {
            label: "Thông báo",
            icon: Bell,
            href: "/blog-manager/notifications",
          },
        ],
      },
    ],
  };

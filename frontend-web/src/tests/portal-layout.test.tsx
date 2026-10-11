import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortalLayout } from "@/components/layouts/portal-layout";
import * as AuthContextModule from "@/features/auth/hooks/use-auth";

// Mock next/navigation
let currentPathname = "/company/jobs/new";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock NotificationCenter
vi.mock("@/features/notifications/components/notification-center", () => ({
  NotificationCenter: () => null,
}));

describe("PortalLayout Navigation Active State", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: "rep-1",
        email: "company@example.com",
        fullName: "Đại diện công ty",
        role: "COMPANY_REP",
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it("highlights only 'Đăng tin tuyển dụng' when pathname is /company/jobs/new", () => {
    currentPathname = "/company/jobs/new";

    render(
      <PortalLayout portalRole="COMPANY_REP">
        <div>Child Content</div>
      </PortalLayout>
    );

    const postJobLink = screen.getByText("Đăng tin tuyển dụng").closest("a");
    const manageJobsLink = screen.getByText("Quản lý tuyển dụng").closest("a");

    expect(postJobLink).toHaveClass("bg-sky-50");
    expect(manageJobsLink).not.toHaveClass("bg-sky-50");
  });

  it("highlights only 'Quản lý tuyển dụng' when pathname is /company/jobs", () => {
    currentPathname = "/company/jobs";

    render(
      <PortalLayout portalRole="COMPANY_REP">
        <div>Child Content</div>
      </PortalLayout>
    );

    const postJobLink = screen.getByText("Đăng tin tuyển dụng").closest("a");
    const manageJobsLink = screen.getByText("Quản lý tuyển dụng").closest("a");

    expect(manageJobsLink).toHaveClass("bg-sky-50");
    expect(postJobLink).not.toHaveClass("bg-sky-50");
  });

  it("highlights only 'Quản lý tuyển dụng' when pathname is a subpath like /company/jobs/123", () => {
    currentPathname = "/company/jobs/123";

    render(
      <PortalLayout portalRole="COMPANY_REP">
        <div>Child Content</div>
      </PortalLayout>
    );

    const postJobLink = screen.getByText("Đăng tin tuyển dụng").closest("a");
    const manageJobsLink = screen.getByText("Quản lý tuyển dụng").closest("a");

    expect(manageJobsLink).toHaveClass("bg-sky-50");
    expect(postJobLink).not.toHaveClass("bg-sky-50");
  });

  it("renders Blog Manager portal with correct title and navigation items", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: {
        id: "blog-1",
        email: "editor.blog@ctu.edu.vn",
        fullName: "Biên tập viên Blog",
        role: "BLOG_MANAGER",
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    currentPathname = "/blog-manager/posts";

    render(
      <PortalLayout portalRole="BLOG_MANAGER">
        <div>Blog Manager Workspace</div>
      </PortalLayout>
    );

    expect(screen.getAllByText("Cổng Quản Lý Blog & Truyền Thông")[0]).toBeInTheDocument();
    expect(screen.getByText("Blog Manager Workspace")).toBeInTheDocument();
    const postsLink = screen.getAllByText("Quản lý bài viết")[0].closest("a");
    expect(postsLink).toBeInTheDocument();
  });
});


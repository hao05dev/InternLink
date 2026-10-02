import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/layouts/navbar";
import * as AuthContextModule from "@/features/auth/hooks/use-auth";

// NotificationCenter uses async polling (setInterval) which causes act() warnings.
// Mock it so navbar tests remain focused on navigation logic.
vi.mock("@/features/notifications/components/notification-center", () => ({
    NotificationCenter: () => null,
}));

describe("Navbar Component", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("renders unauthenticated state with login button and single-line nav links", () => {
        vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        render(<Navbar />);

        expect(screen.getByText("Vị trí tuyển dụng")).toBeInTheDocument();
        expect(screen.getByText("Doanh nghiệp")).toBeInTheDocument();
        expect(screen.getByText("Cẩm nang")).toBeInTheDocument();
        expect(screen.getAllByText("Đăng nhập").length).toBeGreaterThan(0);
    });

    it("renders compact avatar button and opens streamlined dropdown for ADMIN with dashboard link", () => {
        const mockLogout = vi.fn();
        vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            user: {
                id: "admin-1",
                email: "admin@ctu.edu.vn",
                fullName: "Quản trị viên Hệ thống CICT",
                role: "ADMIN",
            },
            isLoading: false,
            isAuthenticated: true,
            login: vi.fn(),
            logout: mockLogout,
            refreshUser: vi.fn(),
        });

        render(<Navbar />);

        // Should render avatar initial 'Q'
        const avatarButton = screen.getByLabelText("Menu tài khoản");
        expect(avatarButton).toBeInTheDocument();
        expect(avatarButton).toHaveTextContent("Q");

        // Click to open dropdown
        fireEvent.click(avatarButton);

        // Dropdown header & role
        expect(screen.getByText("Quản trị viên Hệ thống CICT")).toBeInTheDocument();
        expect(screen.getByText("admin@ctu.edu.vn")).toBeInTheDocument();
        expect(screen.getByText("Quản trị viên")).toBeInTheDocument();

        // Streamlined dashboard link for ADMIN
        const dashboardLink = screen.getByText("Bảng điều khiển quản trị");
        expect(dashboardLink).toBeInTheDocument();
        expect(dashboardLink.closest("a")).toHaveAttribute("href", "/admin/dashboard");

        // Logout action
        const logoutBtn = screen.getByText("Đăng xuất");
        expect(logoutBtn).toBeInTheDocument();
        fireEvent.click(logoutBtn);
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("renders student dashboard and profile links for STUDENT", () => {
        vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            user: {
                id: "student-1",
                email: "student@ctu.edu.vn",
                fullName: "Nguyễn Văn Sinh Viên",
                role: "STUDENT",
            },
            isLoading: false,
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        render(<Navbar />);

        const avatarButton = screen.getByLabelText("Menu tài khoản");
        fireEvent.click(avatarButton);

        expect(screen.getByText("Bàn làm việc sinh viên")).toBeInTheDocument();
        expect(screen.getByText("Hồ sơ cá nhân & CV")).toBeInTheDocument();
    });
});

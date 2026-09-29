import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboardView from "@/features/dashboards/components/admin-dashboard-view";
import * as AuthContextModule from "@/features/auth/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

describe("AdminDashboardView", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            user: {
                id: "admin-1",
                email: "admin@ctu.edu.vn",
                fullName: "Quản trị viên Hệ thống",
                role: "ADMIN",
            },
            isLoading: false,
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });
    });

    it("renders dashboard header, KPI cards, and role distribution", async () => {
        vi.mocked(apiClient.get).mockImplementation((url: string) => {
            if (url.includes("/api/v1/admin/users")) {
                return Promise.resolve({
                    success: true,
                    data: [
                        { id: "u-1", email: "student@ctu.edu.vn", fullName: "Nguyễn Văn SV", role: "STUDENT", isActive: true },
                        { id: "u-2", email: "admin@ctu.edu.vn", fullName: "Quản trị viên", role: "ADMIN", isActive: true },
                    ],
                });
            }
            if (url.includes("/api/v1/departments")) {
                return Promise.resolve({
                    success: true,
                    data: [{ id: "d-1", code: "CICT", name: "Trường CNTT&TT", contactEmail: "cict@ctu.edu.vn", isActive: true }],
                });
            }
            if (url.includes("/api/v1/academic-programs")) {
                return Promise.resolve({
                    success: true,
                    data: [
                        { id: "p-1", code: "SE", name: "Kỹ thuật phần mềm", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
                        { id: "p-2", code: "7480202", name: "An toàn thông tin", degreeLevel: "UNDERGRADUATE", track: "REGULAR", isActive: true },
                    ],
                });
            }
            if (url.includes("/api/v1/companies")) {
                return Promise.resolve({
                    success: true,
                    data: [{ id: "c-1", companyName: "FPT Software", taxCode: "0101234567", verificationStatus: "VERIFIED" }],
                });
            }
            if (url.includes("/api/v1/audit-logs")) {
                return Promise.resolve({
                    success: true,
                    data: [
                        { id: "l-1", createdAt: new Date().toISOString(), actorName: "admin@ctu.edu.vn", action: "LOGIN", entityType: "USER", result: "SUCCESS" },
                    ],
                });
            }
            return Promise.resolve({ success: true, data: [] });
        });

        render(<AdminDashboardView />);

        // Header
        expect(screen.getByText("Trung Tâm Quản Trị Hệ Thống InternLink")).toBeInTheDocument();
        expect(screen.getByText("Quản trị viên")).toBeInTheDocument();

        // Check KPI cards
        await waitFor(() => {
            expect(screen.getByText("Tài khoản người dùng")).toBeInTheDocument();
            expect(screen.getByText("Cơ cấu Khoa & Ngành")).toBeInTheDocument();
            expect(screen.getByText("Doanh nghiệp liên kết")).toBeInTheDocument();
            expect(screen.getByText("Nhật ký kiểm toán")).toBeInTheDocument();
        });

        // 4 Core Management Hub items
        expect(screen.getByText("Quản lý người dùng & Phân quyền")).toBeInTheDocument();
        expect(screen.getByText("Cơ cấu Khoa & Ngành đào tạo")).toBeInTheDocument();
        expect(screen.getByText("Danh bạ Doanh nghiệp liên kết")).toBeInTheDocument();
        expect(screen.getByText("Nhật ký kiểm toán & Giám sát")).toBeInTheDocument();
    });
});

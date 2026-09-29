import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleGuard } from "@/features/auth/components/role-guard";
import * as AuthContextModule from "@/features/auth/hooks/use-auth";

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

describe("RoleGuard Component", () => {
    it("renders loading spinner when auth is loading", () => {
        vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            user: null,
            isLoading: true,
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        render(
            <RoleGuard allowedRoles={["STUDENT"]}>
                <div>Nội dung phân hệ sinh viên</div>
            </RoleGuard>
        );

        expect(screen.getByText("Đang xác thực quyền truy cập...")).toBeInTheDocument();
        expect(screen.queryByText("Nội dung phân hệ sinh viên")).not.toBeInTheDocument();
    });

    it("renders 403 Forbidden message when user has insufficient role", () => {
        vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            user: {
                id: "1",
                email: "lecturer@ctu.edu.vn",
                fullName: "TS. Nguyễn Văn Hướng Dẫn",
                role: "LECTURER",
            },
            isLoading: false,
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        render(
            <RoleGuard allowedRoles={["STUDENT"]}>
                <div>Nội dung phân hệ sinh viên</div>
            </RoleGuard>
        );

        expect(screen.getByText("Truy cập bị từ chối (403 Forbidden)")).toBeInTheDocument();
        expect(screen.queryByText("Nội dung phân hệ sinh viên")).not.toBeInTheDocument();
    });

    it("renders children when user role is allowed", () => {
        vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
            user: {
                id: "2",
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

        render(
            <RoleGuard allowedRoles={["STUDENT"]}>
                <div>Nội dung phân hệ sinh viên</div>
            </RoleGuard>
        );

        expect(screen.getByText("Nội dung phân hệ sinh viên")).toBeInTheDocument();
        expect(screen.queryByText("Truy cập bị từ chối (403 Forbidden)")).not.toBeInTheDocument();
    });
});

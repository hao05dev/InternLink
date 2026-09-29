import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

describe("EmptyState Component", () => {
    it("renders title correctly", () => {
        render(<EmptyState title="Chưa có vị trí tuyển dụng" />);
        expect(screen.getByText("Chưa có vị trí tuyển dụng")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
        render(
            <EmptyState
                title="Không có hồ sơ"
                description="Bạn chưa nộp hồ sơ ứng tuyển nào trong học kỳ này."
            />
        );
        expect(
            screen.getByText("Bạn chưa nộp hồ sơ ứng tuyển nào trong học kỳ này.")
        ).toBeInTheDocument();
    });

    it("renders action button when provided", () => {
        render(
            <EmptyState
                title="Chưa có báo cáo tuần"
                action={<Button>Tạo nhật ký mới</Button>}
            />
        );
        expect(screen.getByRole("button", { name: /Tạo nhật ký mới/i })).toBeInTheDocument();
    });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/status-badge";

describe("StatusBadge Component", () => {
    it("renders correct label and style for ApplicationStatus SUBMITTED", () => {
        render(<StatusBadge status="SUBMITTED" />);
        expect(screen.getByText("Đã nộp đơn")).toBeInTheDocument();
    });

    it("renders correct label and style for ApplicationStatus ACCEPTED", () => {
        render(<StatusBadge status="ACCEPTED" />);
        expect(screen.getByText("Trúng tuyển")).toBeInTheDocument();
    });

    it("renders correct label and style for ApplicationStatus REJECTED", () => {
        render(<StatusBadge status="REJECTED" />);
        expect(screen.getByText("Chưa phù hợp")).toBeInTheDocument();
    });

    it("renders correct label for PlacementStatus ACTIVE", () => {
        render(<StatusBadge status="ACTIVE" />);
        expect(screen.getByText("Đang thực tập")).toBeInTheDocument();
    });

    it("renders correct label for AgreementStatus APPROVED", () => {
        render(<StatusBadge status="APPROVED" />);
        expect(screen.getByText("Đã phê duyệt")).toBeInTheDocument();
    });

    it("renders customLabel when explicitly provided", () => {
        render(<StatusBadge status="SUBMITTED" customLabel="Hồ sơ đã gửi qua Khoa" />);
        expect(screen.getByText("Hồ sơ đã gửi qua Khoa")).toBeInTheDocument();
    });

    it("gracefully falls back to status code when unknown status is passed", () => {
        render(<StatusBadge status="CUSTOM_UNKNOWN_STATUS" />);
        expect(screen.getByText("CUSTOM_UNKNOWN_STATUS")).toBeInTheDocument();
    });
});

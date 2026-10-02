import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/ui/pagination";

describe("Pagination Component", () => {
    it("renders display count correctly", () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                pageSize={10}
                onPageChange={() => {}}
            />
        );

        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText(/Hiển thị/)).toBeInTheDocument();
    });

    it("triggers onPageChange when clicking a page button", () => {
        const onPageChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                pageSize={10}
                onPageChange={onPageChange}
            />
        );

        const page2Btn = screen.getByRole("button", { name: "2" });
        fireEvent.click(page2Btn);
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("triggers onPageSizeChange when selecting another page size", () => {
        const onPageSizeChange = vi.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                pageSize={10}
                onPageChange={() => {}}
                onPageSizeChange={onPageSizeChange}
            />
        );

        const select = screen.getByLabelText("Chọn số bản ghi mỗi trang");
        fireEvent.change(select, { target: { value: "20" } });
        expect(onPageSizeChange).toHaveBeenCalledWith(20);
    });

    it("disables prev button on first page", () => {
        render(
            <Pagination
                currentPage={1}
                totalPages={3}
                totalItems={30}
                pageSize={10}
                onPageChange={() => {}}
            />
        );

        const prevBtn = screen.getByRole("button", { name: "Trang trước" });
        expect(prevBtn).toBeDisabled();
    });
});

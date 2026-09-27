import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button UI Component", () => {
    it("renders children text correctly", () => {
        render(<Button>Ứng tuyển ngay</Button>);
        expect(screen.getByRole("button", { name: /Ứng tuyển ngay/i })).toBeInTheDocument();
    });

    it("handles click events properly", async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        render(<Button onClick={handleClick}>Bấm vào đây</Button>);
        
        await user.click(screen.getByRole("button", { name: /Bấm vào đây/i }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders loading spinner and disables button when isLoading is true", () => {
        render(<Button isLoading>Đang lưu dữ liệu</Button>);
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
    });

    it("respects native disabled attribute", async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        render(<Button disabled onClick={handleClick}>Vô hiệu hóa</Button>);
        
        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
        await user.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it("applies correct variant styles", () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-blue-600");

        rerender(<Button variant="danger">Danger</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-red-600");

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole("button")).toHaveClass("border-slate-300");
    });
});

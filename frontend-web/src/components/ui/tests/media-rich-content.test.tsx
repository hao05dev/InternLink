import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaRichContent } from "../media-rich-content";

describe("MediaRichContent", () => {
  it("renders headings properly", () => {
    render(
      <MediaRichContent
        text={`# Heading 1\n## Heading 2\n### Heading 3`}
      />
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Heading 1");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Heading 2");
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Heading 3");
  });

  it("renders bold and italic formatting seamlessly", () => {
    const { container } = render(
      <MediaRichContent
        text={`Ngày hội việc làm **CICT Job Fair 2026** và *Kỳ thực tập 2027*`}
      />
    );
    const strong = container.querySelector("strong");
    const em = container.querySelector("em");
    expect(strong).toHaveTextContent("CICT Job Fair 2026");
    expect(em).toHaveTextContent("Kỳ thực tập 2027");
  });

  it("renders unordered and ordered list items with inline bold", () => {
    const { container } = render(
      <MediaRichContent
        text={`* **Gian hàng trực tiếp**: Phỏng vấn nhanh\n* Workshop chuyên sâu\n1. Mang theo **CV in sẵn**\n2. Trang phục lịch sự`}
      />
    );
    const ul = container.querySelector("ul");
    const ol = container.querySelector("ol");
    expect(ul).toBeInTheDocument();
    expect(ol).toBeInTheDocument();
    expect(ul?.querySelectorAll("li").length).toBe(2);
    expect(ol?.querySelectorAll("li").length).toBe(2);
    expect(ul?.querySelector("strong")).toHaveTextContent("Gian hàng trực tiếp");
    expect(ol?.querySelector("strong")).toHaveTextContent("CV in sẵn");
  });

  it("renders blockquotes and tables properly", () => {
    const { container } = render(
      <MediaRichContent
        text={`> Lưu ý quan trọng cho ứng viên\n\n| Vị trí | Số lượng |\n| --- | --- |\n| Frontend | 5 |\n| Backend | 3 |`}
      />
    );
    const blockquote = container.querySelector("blockquote");
    const table = container.querySelector("table");
    expect(blockquote).toHaveTextContent("Lưu ý quan trọng cho ứng viên");
    expect(table).toBeInTheDocument();
    expect(table?.querySelectorAll("tbody tr").length).toBe(2);
  });
});

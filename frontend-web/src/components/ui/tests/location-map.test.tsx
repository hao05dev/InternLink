import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationMap } from "../location-map";

it("never renders an arbitrary iframe URL and retains the directions link", () => {
  const { container } = render(<LocationMap address="Cần Thơ" mapEmbedUrl="https://evil.test/embed" />);
  expect(container.querySelector("iframe")).toBeNull();
  expect(screen.getByRole("link", { name: "Chỉ đường" })).toHaveAttribute("href", expect.stringContaining("destination="));
});

it("embeds a validated map lazily with an accessible title", () => {
  render(<LocationMap address="Văn phòng" mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18" />);
  expect(screen.getByTitle("Bản đồ: Văn phòng")).toHaveAttribute("loading", "lazy");
});

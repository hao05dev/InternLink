import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CampaignCreateForm } from "../components/campaign-create-form";
import { campaignService } from "../services/campaign.service";
import { apiClient } from "@/lib/api-client";
vi.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "faculty", role: "FACULTY_ADMIN", departmentId: "department" },
  }),
}));
vi.mock("@/lib/api-client", () => ({ apiClient: { get: vi.fn() } }));
vi.mock("../services/campaign.service", () => ({
  campaignService: { preview: vi.fn(), create: vi.fn() },
}));
it("requires a new preview after changing the message", async () => {
  vi.mocked(apiClient.get).mockResolvedValue({
    success: true,
    data: [{ id: "term", termName: "Kỳ thử", status: "ACTIVE" }],
  });
  vi.mocked(campaignService.preview).mockResolvedValue({
    total: 1,
    withAccount: 1,
    emailEligible: 1,
    sample: [
      {
        email: "student@example.edu",
        displayName: "Sinh viên",
        status: "PREVIEW",
      },
    ],
  });
  const cache = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={cache}>
      <CampaignCreateForm onCreated={vi.fn()} />
    </QueryClientProvider>,
  );
  await screen.findByRole("option", { name: "Kỳ thử" });
  fireEvent.change(screen.getByLabelText("Kỳ thực tập"), {
    target: { value: "term" },
  });
  fireEvent.change(screen.getByLabelText("Tiêu đề"), {
    target: { value: "Thông báo" },
  });
  fireEvent.change(screen.getByLabelText("Nội dung"), {
    target: { value: "Nội dung đã xem trước" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Xem trước người nhận" }));
  expect(
    await screen.findByRole("button", { name: "Tạo đợt gửi" }),
  ).toBeEnabled();
  fireEvent.change(screen.getByLabelText("Nội dung"), {
    target: { value: "Nội dung thay đổi" },
  });
  expect(
    screen.queryByRole("button", { name: "Tạo đợt gửi" }),
  ).not.toBeInTheDocument();
  cache.clear();
});

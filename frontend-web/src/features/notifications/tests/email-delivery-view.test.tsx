import { it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmailDeliveryView } from "../components/email-delivery-view";
import { deliveryService } from "../services/delivery.service";
vi.mock("../services/delivery.service", () => ({
  deliveryService: {
    summary: vi.fn(),
    page: vi.fn(),
    retry: vi.fn(),
    cancel: vi.fn(),
    controls: vi.fn(),
  },
}));
it("requires reason and reconciliation confirmation to retry UNKNOWN", async () => {
  vi.mocked(deliveryService.summary).mockResolvedValue({
    enabled: true,
    provider: "GMAIL_SMTP",
    counts: { UNKNOWN: 1 },
    metrics: { oldestPendingSeconds: 600, averageAcceptanceSeconds24Hours: 90 },
    controls: { paused: false, dailyLimit: 200, usedLast24Hours: 1 },
  });
  vi.mocked(deliveryService.page).mockResolvedValue({
    items: [
      {
        id: "delivery",
        recipient: "user@example.edu",
        subject: "Thư",
        status: "UNKNOWN",
        attempts: 1,
        createdAt: new Date().toISOString(),
      },
    ],
    totalElements: 1,
    totalPages: 1,
  });
  vi.mocked(deliveryService.retry).mockResolvedValue({
    success: true,
    data: null,
  });
  const cache = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={cache}>
      <EmailDeliveryView />
    </QueryClientProvider>,
  );
  const retry = await screen.findByRole("button", { name: "Gửi lại" });
  expect(screen.getByText(/Thư chờ lâu nhất: 10 phút/)).toBeInTheDocument();
  expect(retry).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Lý do gửi lại / hủy"), {
    target: { value: "Đã đối soát hộp thư" },
  });
  expect(screen.getByText(/Thư chờ lâu nhất: 10 phút/)).toBeInTheDocument();
  expect(retry).toBeDisabled();
  fireEvent.click(
    screen.getByRole("checkbox", { name: /Tôi đã kiểm tra hộp thư/ }),
  );
  fireEvent.click(retry);
  await waitFor(() =>
    expect(deliveryService.retry).toHaveBeenCalledWith(
      "delivery",
      "Đã đối soát hộp thư",
      true,
    ),
  );
  cache.clear();
});

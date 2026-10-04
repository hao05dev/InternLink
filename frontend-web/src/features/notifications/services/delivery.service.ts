import { apiClient } from "@/lib/api-client";
import type {
  DeliveryPage,
  DeliverySummary,
  DeliveryControls,
} from "../types/delivery.types";
const base = "/api/v1/notifications";
export const deliveryService = {
  summary: async () =>
    (await apiClient.get<DeliverySummary>(base + "/delivery-summary")).data,
  page: async (status: string, page: number) =>
    (
      await apiClient.get<DeliveryPage>(
        base + `/deliveries?status=${encodeURIComponent(status)}&page=${page}`,
      )
    ).data,
  controls: (paused: boolean, dailyLimit: number, reason: string) =>
    apiClient.put<DeliveryControls>(base + "/deliveries/controls", {
      paused,
      dailyLimit,
      reason,
    }),
  retry: (id: string, reason: string, confirmedNotAccepted: boolean) =>
    apiClient.post(base + `/deliveries/${id}/retry`, {
      reason,
      confirmedNotAccepted,
    }),
  cancel: (id: string, reason: string) =>
    apiClient.post(base + `/deliveries/${id}/cancel`, {
      reason,
      confirmedNotAccepted: false,
    }),
};

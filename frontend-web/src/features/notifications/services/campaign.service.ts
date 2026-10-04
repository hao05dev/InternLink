import { apiClient } from "@/lib/api-client";
import type {
  CampaignRequest,
  CampaignPreview,
  CampaignDetail,
  CampaignPage,
} from "../types/campaign.types";
const base = "/api/v1/notifications/campaigns";
export const campaignService = {
  preview: async (request: CampaignRequest) =>
    (await apiClient.post<CampaignPreview>(base + "/preview", request)).data,
  create: async (request: CampaignRequest) =>
    (await apiClient.post<CampaignDetail>(base, request)).data,
  page: async (page: number) =>
    (await apiClient.get<CampaignPage>(base + `?page=${page}`)).data,
  detail: async (id: string, page: number) =>
    (await apiClient.get<CampaignDetail>(base + `/${id}?page=${page}`)).data,
  cancel: (id: string) => apiClient.post(base + `/${id}/cancel`),
  retry: (id: string) => apiClient.post(base + `/${id}/retry`),
};

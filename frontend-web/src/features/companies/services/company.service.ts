import { apiClient } from "@/lib/api-client";
import type { PublicCompany } from "../types/public-company.types";
import type { CompanyProfileValues } from "../types/company-profile.types";

export const companyService = {
  getOwnProfile: async () => (await apiClient.get<PublicCompany>("/api/v1/companies/me/profile")).data,
  saveProfile: async (values: CompanyProfileValues) => (await apiClient.put<PublicCompany>("/api/v1/companies/me/profile", values)).data,
  getPublic: async (id: string, signal?: AbortSignal) => (await apiClient.get<PublicCompany>(`/api/v1/companies/public/${id}`, { signal })).data,
  listPublic: async (signal?: AbortSignal) => (await apiClient.get<PublicCompany[]>("/api/v1/companies/public", { signal })).data ?? [],
};

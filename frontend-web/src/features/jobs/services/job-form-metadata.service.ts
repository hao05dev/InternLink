import { apiClient } from "@/lib/api-client";
import type { JobDepartment, JobTerm } from "../types/job-form.types";

export const jobFormMetadataService = {
  departments: async () => (await apiClient.get<JobDepartment[]>("/api/v1/departments")).data ?? [],
  terms: async (department: string) => (await apiClient.get<JobTerm[]>(`/api/v1/terms/by-department/${department}`)).data ?? [],
};

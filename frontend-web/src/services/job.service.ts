import { apiClient } from "@/lib/api-client";
import { JobPosition } from "@/types/job";

export interface JobSearchParams {
    keyword?: string;
    termId?: string;
    companyId?: string;
}

export const jobService = {
    getAllJobs: async (params?: JobSearchParams): Promise<JobPosition[]> => {
        const queryParams = new URLSearchParams();
        if (params?.keyword) queryParams.append("keyword", params.keyword.trim());
        if (params?.termId) queryParams.append("termId", params.termId);
        if (params?.companyId) queryParams.append("companyId", params.companyId);

        const qs = queryParams.toString();
        const endpoint = qs ? `/api/v1/jobs?${qs}` : "/api/v1/jobs";
        const response = await apiClient.get<JobPosition[]>(endpoint);
        return response.data;
    },

    getApprovedJobsByTerm: async (termId: string, keyword?: string): Promise<JobPosition[]> => {
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.append("keyword", keyword.trim());

        const qs = queryParams.toString();
        const endpoint = qs 
            ? `/api/v1/jobs/public/term/${termId}?${qs}` 
            : `/api/v1/jobs/public/term/${termId}`;
        const response = await apiClient.get<JobPosition[]>(endpoint);
        return response.data;
    },

    getJobById: async (id: string): Promise<JobPosition> => {
        const response = await apiClient.get<JobPosition>(`/api/v1/jobs/${id}`);
        return response.data;
    },
};

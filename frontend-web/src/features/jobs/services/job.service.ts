import { apiClient } from "@/lib/api-client";
import { JobPosition } from "@/features/jobs/types/job.types";
import { JobApplication } from "@/features/jobs/types/application.types";

export interface JobSearchParams {
    keyword?: string;
    termId?: string;
    companyId?: string;
}

export interface ApplyJobPayload {
    jobId: string;
    submittedCvDocumentId: string;
    coverLetter?: string;
}

export const jobService = {
    getAllJobs: async (params?: JobSearchParams): Promise<JobPosition[]> => {
        const queryParams = new URLSearchParams();
        if (params?.keyword) queryParams.append("keyword", params.keyword.trim());
        if (params?.termId) queryParams.append("termId", params.termId);
        if (params?.companyId) queryParams.append("companyId", params.companyId);

        const qs = queryParams.toString();
        const endpoint = qs ? `/api/v1/jobs/public/all?${qs}` : "/api/v1/jobs/public/all";
        const response = await apiClient.get<JobPosition[]>(endpoint);
        return response.data || [];
    },

    getApprovedJobsByTerm: async (termId: string, keyword?: string): Promise<JobPosition[]> => {
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.append("keyword", keyword.trim());

        const qs = queryParams.toString();
        const endpoint = qs 
            ? `/api/v1/jobs/public/term/${termId}?${qs}` 
            : `/api/v1/jobs/public/term/${termId}`;
        const response = await apiClient.get<JobPosition[]>(endpoint);
        return response.data || [];
    },

    getJobById: async (id: string): Promise<JobPosition> => {
        const response = await apiClient.get<JobPosition>(`/api/v1/jobs/public/${id}`);
        if (response.data) {
            return response.data;
        }
        throw new Error("Không tìm thấy vị trí tuyển dụng");
    },

    applyJob: async (payload: ApplyJobPayload): Promise<JobApplication> => {
        const response = await apiClient.post<JobApplication>("/api/v1/applications", {
            jobId: payload.jobId,
            submittedCvDocumentId: payload.submittedCvDocumentId,
            coverLetter: payload.coverLetter,
        });
        return response.data;
    },
};

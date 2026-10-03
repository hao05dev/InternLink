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

export interface JobFormPayload {
    companyId: string;
    termId: string;
    departmentId: string;
    title: string;
    workFormat: string;
    location: string;
    vacancies: number;
    description: string;
    stipendAmount?: number;
    bannerUrl?: string;
    attachmentUrls?: Array<{
        id: string;
        fileName: string;
        fileUrl: string;
        fileSize?: string;
        fileType?: string;
    }>;
    mandatorySkillIds?: string[];
    optionalSkillIds?: string[];
    targetProgramCodes?: string[];
    targetLearningOutcomes?: string[];
    benefits?: string[];
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
        const response = await apiClient.get<JobPosition>(`/api/v1/jobs/${id}`);
        if (response.data) {
            return response.data;
        }
        throw new Error("Không tìm thấy vị trí tuyển dụng");
    },

    createJob: async (payload: JobFormPayload): Promise<JobPosition> => {
        const response = await apiClient.post<JobPosition>("/api/v1/jobs", payload);
        return response.data;
    },

    updateJob: async (id: string, payload: JobFormPayload): Promise<JobPosition> => {
        const response = await apiClient.put<JobPosition>(`/api/v1/jobs/${id}`, payload);
        return response.data;
    },

    submitJob: async (id: string): Promise<JobPosition> => {
        const response = await apiClient.patch<JobPosition>(`/api/v1/jobs/${id}/submit`);
        return response.data;
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

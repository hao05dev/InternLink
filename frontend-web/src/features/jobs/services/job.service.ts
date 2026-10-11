import { apiClient } from "@/lib/api-client";
import { JobPosition } from "@/features/jobs/types/job.types";
import { JobApplication } from "@/features/jobs/types/application.types";

export interface JobSearchParams {
    keyword?: string;
    termId?: string;
    companyId?: string;
    status?: string;
    location?: string;
    workFormat?: string;
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
    applicationDeadline?: string;
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
        if (params?.status) queryParams.append("status", params.status);
        if (params?.location) queryParams.append("location", params.location.trim());
        if (params?.workFormat) queryParams.append("workFormat", params.workFormat);

        const qs = queryParams.toString();
        const endpoint = qs ? `/api/v1/jobs?${qs}` : "/api/v1/jobs";
        const response = await apiClient.get<JobPosition[]>(endpoint);
        return response.data || [];
    },

    getPublicJobs: async (params?: JobSearchParams): Promise<JobPosition[]> => {
        const queryParams = new URLSearchParams();
        if (params?.keyword) queryParams.append("keyword", params.keyword.trim());
        if (params?.termId) queryParams.append("termId", params.termId);
        if (params?.companyId) queryParams.append("companyId", params.companyId);
        if (params?.location) queryParams.append("location", params.location.trim());
        if (params?.workFormat) queryParams.append("workFormat", params.workFormat);

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

    getPublicJobById: async (id: string): Promise<JobPosition> => {
        const response = await apiClient.get<JobPosition>(`/api/v1/jobs/public/${id}`);
        if (response.data) {
            return response.data;
        }
        throw new Error("Không tìm thấy vị trí tuyển dụng");
    },

    getJobById: async (id: string): Promise<JobPosition> => {
        try {
            const response = await apiClient.get<JobPosition>(`/api/v1/jobs/public/${id}`);
            if (response.data) {
                return response.data;
            }
        } catch {
            const response = await apiClient.get<JobPosition>(`/api/v1/jobs/${id}`);
            if (response.data) {
                return response.data;
            }
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

    closeJobEarly: async (id: string): Promise<JobPosition> => {
        const response = await apiClient.patch<JobPosition>(`/api/v1/jobs/${id}/close`);
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

    parseSearchQuery: async (query: string): Promise<{
        parsed: boolean;
        raw_query: string;
        extracted_skills?: string[];
        suggested_role_level?: string;
        suggested_location?: string;
        suggested_industry?: string;
        suggested_work_format?: string;
        requires_stipend?: boolean;
        cleaned_keywords?: string;
        summary_message?: string;
    }> => {
        const response = await apiClient.get<any>(`/api/v1/jobs/public/parse-query?query=${encodeURIComponent(query)}`);
        return response.data;
    },
};

import { apiClient } from "@/lib/api-client";
import { JobPosition } from "@/features/jobs/types/job.types";
import { MOCK_JOBS } from "@/features/jobs/data/mock-jobs";

export interface JobSearchParams {
    keyword?: string;
    termId?: string;
    companyId?: string;
}

export const jobService = {
    getAllJobs: async (params?: JobSearchParams): Promise<JobPosition[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (params?.keyword) queryParams.append("keyword", params.keyword.trim());
            if (params?.termId) queryParams.append("termId", params.termId);
            if (params?.companyId) queryParams.append("companyId", params.companyId);

            const qs = queryParams.toString();
            const endpoint = qs ? `/api/v1/jobs/public/all?${qs}` : "/api/v1/jobs/public/all";
            const response = await apiClient.get<JobPosition[]>(endpoint);
            if (response.data && response.data.length > 0) {
                // Enrich backend items with fallback visual metadata if missing
                return response.data.map(job => {
                    const fallback = MOCK_JOBS.find(m => m.id === job.id || m.title.toLowerCase().includes(job.title.toLowerCase()));
                    return {
                        ...fallback,
                        ...job,
                        companyLogo: job.companyLogo || fallback?.companyLogo || "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
                        companyScale: job.companyScale || fallback?.companyScale || "500 - 1.000 nhân viên",
                        companyIndustry: job.companyIndustry || fallback?.companyIndustry || "Công nghệ thông tin",
                        companyAddress: job.companyAddress || job.location,
                        deadline: job.deadline || fallback?.deadline || "30/11/2026",
                        applicantCount: job.applicantCount ?? fallback?.applicantCount ?? 0,
                        experienceLevel: job.experienceLevel || fallback?.experienceLevel || "Sinh viên năm 3 - 4",
                        requirements: (job.requirements && job.requirements.length > 0) ? job.requirements : fallback?.requirements,
                        targetLearningOutcomes: (job.targetLearningOutcomes && job.targetLearningOutcomes.length > 0) ? job.targetLearningOutcomes : fallback?.targetLearningOutcomes,
                        benefits: (job.benefits && job.benefits.length > 0) ? job.benefits : fallback?.benefits,
                    };
                });
            }
        } catch {
            // Graceful fallback to curated data
        }

        // Filter mock jobs based on params if backend didn't return
        let filtered = [...MOCK_JOBS];
        if (params?.keyword) {
            const kw = params.keyword.toLowerCase().trim();
            filtered = filtered.filter(j => 
                j.title.toLowerCase().includes(kw) ||
                j.companyName.toLowerCase().includes(kw) ||
                j.location.toLowerCase().includes(kw) ||
                j.skills?.some(s => s.skillName?.toLowerCase().includes(kw) || s.skillId.toLowerCase().includes(kw))
            );
        }
        if (params?.termId) {
            filtered = filtered.filter(j => j.termId === params.termId);
        }
        if (params?.companyId) {
            filtered = filtered.filter(j => j.companyId === params.companyId);
        }
        return filtered;
    },

    getApprovedJobsByTerm: async (termId: string, keyword?: string): Promise<JobPosition[]> => {
        try {
            const queryParams = new URLSearchParams();
            if (keyword) queryParams.append("keyword", keyword.trim());

            const qs = queryParams.toString();
            const endpoint = qs 
                ? `/api/v1/jobs/public/term/${termId}?${qs}` 
                : `/api/v1/jobs/public/term/${termId}`;
            const response = await apiClient.get<JobPosition[]>(endpoint);
            if (response.data && response.data.length > 0) {
                return response.data;
            }
        } catch {
            // fallback
        }
        return jobService.getAllJobs({ termId, keyword });
    },

    getJobById: async (id: string): Promise<JobPosition> => {
        try {
            const response = await apiClient.get<JobPosition>(`/api/v1/jobs/public/${id}`);
            if (response.data) {
                const fallback = MOCK_JOBS.find(m => m.id === id || m.title.toLowerCase().includes(response.data.title.toLowerCase()));
                return {
                    ...fallback,
                    ...response.data,
                    companyLogo: response.data.companyLogo || fallback?.companyLogo || "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
                    companyScale: response.data.companyScale || fallback?.companyScale || "500 - 1.000 nhân viên",
                    companyIndustry: response.data.companyIndustry || fallback?.companyIndustry || "Công nghệ thông tin",
                    companyAddress: response.data.companyAddress || response.data.location,
                    deadline: response.data.deadline || fallback?.deadline || "30/11/2026",
                    applicantCount: response.data.applicantCount ?? fallback?.applicantCount ?? 0,
                    experienceLevel: response.data.experienceLevel || fallback?.experienceLevel || "Sinh viên năm 3 - 4",
                    requirements: (response.data.requirements && response.data.requirements.length > 0) ? response.data.requirements : fallback?.requirements,
                    targetLearningOutcomes: (response.data.targetLearningOutcomes && response.data.targetLearningOutcomes.length > 0) ? response.data.targetLearningOutcomes : fallback?.targetLearningOutcomes,
                    benefits: (response.data.benefits && response.data.benefits.length > 0) ? response.data.benefits : fallback?.benefits,
                };
            }
        } catch {
            // fallback
        }

        const found = MOCK_JOBS.find(j => j.id === id);
        if (found) return found;
        throw new Error("Không tìm thấy vị trí tuyển dụng");
    },
};

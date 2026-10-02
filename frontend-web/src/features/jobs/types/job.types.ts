export type WorkFormat = "ONSITE" | "REMOTE" | "HYBRID";
export type JobStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED";

export interface JobSkill {
    id?: string;
    skillId: string;
    skillName?: string;
    isRequired: boolean;
    minimumLevel?: number;
}

export interface JobPosition {
    id: string;
    companyId: string;
    companyName: string;
    companyLogo?: string;
    companyScale?: string;
    companyIndustry?: string;
    companyWebsite?: string;
    companyAddress?: string;
    termId: string;
    termName?: string;
    departmentId?: string;
    departmentName?: string;
    title: string;
    workFormat: WorkFormat;
    location: string;
    vacancies: number;
    description: string;
    requirements?: string[];
    targetProgramCodes?: string[];
    targetLearningOutcomes?: string[];
    benefits?: string[];
    stipendAmount?: number;
    status: JobStatus;
    facultyFeedback?: string;
    skills?: JobSkill[];
    mandatorySkillIds?: string[];
    optionalSkillIds?: string[];
    deadline?: string;
    applicantCount?: number;
    experienceLevel?: string;
    bannerUrl?: string;
    attachmentUrls?: Array<{
        id: string;
        fileName: string;
        fileUrl: string;
        fileSize?: string;
        fileType?: string;
    }>;
    createdAt?: string;
}

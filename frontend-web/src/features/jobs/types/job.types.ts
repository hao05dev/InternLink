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
    company?: import("@/features/companies/types/public-company.types").CompanySummary;
    useCompanyLocation?: boolean;
    mapEmbedUrl?: string | null;
    mapsUrl?: string | null;
    companyLogo?: string;
    companyScale?: string;
    companyIndustry?: string;
    companyWebsite?: string;
    companyAddress?: string;
    termId: string;
    termName?: string;
    termStatus?: string;
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
    applicationDeadline?: string;
    closedEarlyAt?: string;
    isExpired?: boolean;
    isAcceptingApplications?: boolean;
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
    // Explainable AI Matching
    matchScore?: number;
    scoreLabel?: string;
    scoreFormatted?: string;
    mandatoryScore?: number;
    optionalScore?: number;
    eligibilityStatus?: string;
    eligibilityReason?: string;
    matchedSkills?: string[];
    missingSkills?: string[];
}

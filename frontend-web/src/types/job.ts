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
    termId: string;
    termName?: string;
    departmentId?: string;
    departmentName?: string;
    title: string;
    workFormat: WorkFormat;
    location: string;
    vacancies: number;
    description: string;
    targetProgramCodes?: string[];
    targetLearningOutcomes?: string[];
    benefits?: string[];
    stipendAmount?: number;
    status: JobStatus;
    facultyFeedback?: string;
    skills?: JobSkill[];
    mandatorySkillIds?: string[];
    optionalSkillIds?: string[];
    createdAt?: string;
}

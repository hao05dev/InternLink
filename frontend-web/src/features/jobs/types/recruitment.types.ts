export type JobStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PENDING_REVIEW' | 'APPROVED' | 'APPLICATION_OPEN' | 'REJECTED' | 'CLOSED';

export type WorkFormat = 'ONSITE' | 'ON_SITE' | 'HYBRID' | 'REMOTE';

export interface JobPosition {
    id: string;
    companyId: string;
    companyName?: string;
    termId: string;
    termName?: string;
    departmentId?: string;
    title: string;
    workFormat: WorkFormat;
    location: string;
    vacancies: number;
    description: string;
    stipendAmount?: number;
    status: JobStatus;
    skills?: Array<{ skillId?: string; skillName: string; isRequired?: boolean }>;
    targetProgramCodes?: string[];
    createdAt?: string;
}

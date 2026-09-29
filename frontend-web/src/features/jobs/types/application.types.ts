export type ApplicationStatus =
    | 'PENDING'
    | 'SHORTLISTED'
    | 'INTERVIEW_SCHEDULED'
    | 'OFFERED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN';

export interface JobApplication {
    id: string;
    jobId: string;
    jobTitle?: string;
    companyName?: string;
    companyLogoUrl?: string;
    studentId: string;
    studentName?: string;
    studentCode?: string;
    coverLetter?: string;
    cvDocumentId?: string;
    status: ApplicationStatus;
    appliedAt: string;
    interviewScheduledAt?: string;
    interviewLocation?: string;
    interviewNote?: string;
    offerNote?: string;
}

export interface CandidateApplication extends JobApplication {
    gpa?: number;
    skills?: string[];
    programName?: string;
}

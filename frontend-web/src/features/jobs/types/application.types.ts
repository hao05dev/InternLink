export type ApplicationStatus =
    | 'PENDING'
    | 'SHORTLISTED'
    | 'INTERVIEW_SCHEDULED'
    | 'OFFERED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN';

export type InterviewFormat = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type InterviewRoundResult = 'PENDING' | 'PASSED' | 'FAILED';

export interface InterviewRound {
    roundNumber: number;
    format: InterviewFormat;
    scheduledAt: string;
    meetingUrl?: string;
    location?: string;
    interviewer?: string;
    notes?: string;
    result?: InterviewRoundResult;
    feedback?: string;
    recordedAt?: string;
}

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
    interviewRounds?: InterviewRound[];
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

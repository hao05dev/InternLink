export interface AcademicProgram {
    id: string;
    name: string;
    code: string;
    departmentId?: string;
    departmentName?: string;
}

export interface StudentProfile {
    userId: string;
    studentCode: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    programId?: string;
    programName?: string;
    departmentName?: string;
    gpa?: number;
    githubUrl?: string;
    bio?: string;
    certificates?: Array<{ name: string; issuer?: string; year?: number }>;
    passedCourses?: Array<{ code: string; name: string; grade?: number }>;
    preferences?: {
        skills?: string[];
        desiredRole?: string;
        preferredLocation?: string;
    };
    cvDocumentId?: string;
    cvFileName?: string;
    updatedAt?: string;
}

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

export type AgreementStatus =
    | 'DRAFT'
    | 'PENDING_STUDENT'
    | 'PENDING_COMPANY'
    | 'PENDING_FACULTY'
    | 'APPROVED'
    | 'REJECTED';

export interface LearningAgreement {
    id: string;
    offerId?: string;
    studentId: string;
    studentName?: string;
    studentCode?: string;
    companyName?: string;
    companyAddress?: string;
    mentorName?: string;
    mentorEmail?: string;
    mentorPhone?: string;
    facultyName?: string;
    lecturerName?: string;
    startDate: string;
    endDate: string;
    workingDays?: string;
    learningObjectives?: string[];
    status: AgreementStatus;
    studentSignedAt?: string;
    companySignedAt?: string;
    facultySignedAt?: string;
    createdAt: string;
}

export type PlacementStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface InternshipPlacement {
    id: string;
    studentId: string;
    studentName?: string;
    studentCode?: string;
    companyName?: string;
    jobTitle?: string;
    termId?: string;
    termName?: string;
    mentorId?: string;
    mentorName?: string;
    lecturerId?: string;
    lecturerName?: string;
    status: PlacementStatus;
    startDate?: string;
    endDate?: string;
}

export type LogbookStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

export interface WeeklyLogbook {
    id: string;
    placementId: string;
    weekNumber: number;
    periodStart: string;
    periodEnd: string;
    tasksCompleted: string;
    learningReflection: string;
    totalHours: number;
    wasLate?: boolean;
    status: LogbookStatus;
    mentorFeedback?: string;
    mentorReviewedAt?: string;
    lecturerComment?: string;
    lecturerCommentedAt?: string;
    submittedAt?: string;
}

export interface CloAssessment {
    cloCode: string;
    description: string;
    score: number;
    maxScore: number;
}

export type ResultStatus = 'PASSED' | 'FAILED' | 'INCOMPLETE';

export interface FinalResult {
    id: string;
    placementId: string;
    studentName?: string;
    mentorScore?: number;
    lecturerScore?: number;
    finalScoreScale10?: number;
    finalScoreScale4?: number;
    gradeLetter?: string;
    resultStatus: ResultStatus;
    cloAssessments?: CloAssessment[];
    comments?: string;
    published: boolean;
    publishedAt?: string;
}

export interface DocumentInfo {
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    downloadUrl?: string;
    uploadedAt: string;
}

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'UNVERIFIED';

export type JobStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPLICATION_OPEN' | 'CLOSED';
export type WorkFormat = 'ON_SITE' | 'HYBRID' | 'REMOTE';

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

export interface CandidateApplication extends JobApplication {
    gpa?: number;
    skills?: string[];
    programName?: string;
}

export interface RubricCriteriaScore {
    criterionId: string;
    criterionName: string;
    weight: number;
    score: number;
    maxScore: number;
    comment?: string;
}

export interface RubricEvaluation {
    id: string;
    placementId: string;
    studentName?: string;
    studentCode?: string;
    evaluatorId: string;
    evaluatorName?: string;
    evaluationStage: 'MIDTERM' | 'FINAL';
    rubricVersion: string;
    criteriaScores: RubricCriteriaScore[];
    finalScore: number;
    qualitativeFeedback?: string;
    status: string;
    submittedAt?: string;
}

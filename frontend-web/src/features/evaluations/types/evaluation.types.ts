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

export interface FacultyEvaluationSummary {
    placementId: string;
    studentId: string;
    studentCode?: string;
    studentName: string;
    studentEmail?: string;
    classCode?: string;
    programId?: string;
    programName?: string;
    academicYear?: string;

    companyId?: string;
    companyName?: string;
    mentorId?: string;
    mentorName?: string;
    mentorEmail?: string;
    mentorScore?: number;
    mentorFeedback?: string;

    lecturerId?: string;
    lecturerName?: string;
    lecturerEmail?: string;
    lecturerScore?: number;
    lecturerFeedback?: string;

    complianceScore?: number;
    finalScore?: number;
    scoreScale4?: number;
    letterGrade?: string;
    classification?: string;
    resultStatus?: 'PASSED' | 'FAILED' | 'PENDING_REVIEW' | 'IN_PROGRESS';
    placementStatus?: string;

    isFinalized: boolean;
    isPublished: boolean;
    publishedAt?: string;
    finalizedAt?: string;

    formM04Status?: string;
    formM05Status?: string;
}

export interface BatchPublishResultRequest {
    placementIds?: string[];
}

export interface BatchPublishResultResponse {
    publishedCount: number;
    skippedCount: number;
    messages: string[];
}


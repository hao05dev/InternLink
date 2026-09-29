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

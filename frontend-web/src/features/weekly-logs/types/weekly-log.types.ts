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

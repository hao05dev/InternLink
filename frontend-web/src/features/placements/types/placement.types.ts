export type PlacementStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface InternshipPlacement {
    id: string;
    agreementId?: string;
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

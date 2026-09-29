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

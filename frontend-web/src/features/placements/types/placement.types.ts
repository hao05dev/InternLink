export type PlacementType = 'INTERNAL_PARTNER' | 'SELF_SUBMITTED';

export type PlacementStatus =
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'ACTIVE'
    | 'IN_PROGRESS'
    | 'TRANSFER_REQUESTED'
    | 'TRANSFERRED'
    | 'COMPLETED'
    | 'CANCELLED';

export interface InternshipPlacement {
    id: string;
    agreementId?: string;
    studentId: string;
    studentName?: string;
    studentCode?: string;
    placementType?: PlacementType;
    companyName?: string;
    companyTaxCode?: string;
    companyAddress?: string;
    companyWebsite?: string;
    jobTitle?: string;
    jobDescription?: string;
    termId?: string;
    termName?: string;
    termStatus?: string;
    mentorId?: string;
    mentorName?: string;
    mentorEmail?: string;
    mentorPhone?: string;
    lecturerId?: string;
    lecturerName?: string;
    status: PlacementStatus;
    startDate?: string;
    endDate?: string;
    acceptanceLetterUrl?: string;
    rejectionReason?: string;
    transferReason?: string;
    previousPlacementId?: string;
    previousCompanyName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SelfPlacementSubmitPayload {
    termId: string;
    companyName: string;
    companyTaxCode?: string;
    companyAddress: string;
    companyWebsite?: string;
    jobTitle: string;
    jobDescription: string;
    mentorName: string;
    mentorEmail: string;
    mentorPhone: string;
    startDate: string;
    endDate: string;
    acceptanceLetterUrl?: string;
}

export interface TransferPlacementPayload {
    placementId: string;
    reason: string;
    newCompanyName: string;
    newCompanyTaxCode?: string;
    newCompanyAddress: string;
    newJobTitle: string;
    newJobDescription: string;
    newMentorName: string;
    newMentorEmail: string;
    newMentorPhone: string;
    newStartDate: string;
    newEndDate: string;
    newAcceptanceLetterUrl?: string;
}

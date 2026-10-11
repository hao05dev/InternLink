export type IntroductionLetterStatus = 'PENDING' | 'APPROVED' | 'ISSUED' | 'REJECTED' | 'CANCELLED';

export interface IntroductionLetter {
    id: string;
    studentId: string;
    studentName: string;
    studentCode?: string;
    termId: string;
    termName: string;
    targetCompanyName: string;
    targetPosition?: string;
    reason?: string;
    status: IntroductionLetterStatus;
    issuedCode?: string;
    issueNote?: string;
    processedByName?: string;
    processedAt?: string;
    receivedAt?: string;
    createdAt: string;
}

export interface CreateIntroductionLetterPayload {
    termId: string;
    targetCompanyName: string;
    targetPosition?: string;
    reason?: string;
}

export interface ReviewIntroductionLetterPayload {
    status: IntroductionLetterStatus;
    issuedCode?: string;
    issueNote?: string;
}

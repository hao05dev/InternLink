export interface RosterStudent {
    id: string;
    studentCode: string;
    fullName: string;
    officialEmail: string;
    programName: string;
    academicYear: string;
    classCode?: string;
    internshipCourseCode?: string;
    eligibilityStatus: string;
    claimedUserId?: string;
}

export interface StudentFoundApp {
    id: string;
    termId: string;
    studentId: string;
    hostName: string;
    hostAddress: string;
    contactName: string;
    contactEmail: string;
    workDescription: string;
    startDate: string;
    endDate: string;
    acceptanceDocumentId?: string;
    status: string; // DRAFT | SUBMITTED | APPROVED | REJECTED
    reviewNote?: string;
    placementId?: string;
}

export interface InternStudentRow {
    roster: RosterStudent;
    foundApp?: StudentFoundApp;
    letterReceived: boolean;
    companyAccepted: boolean;
}

export type InternshipFilterStatus = 'all' | 'pending' | 'letter' | 'accepted' | 'active';

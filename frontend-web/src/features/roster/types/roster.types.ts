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
    eligibilityNote?: string;
    claimedUserId?: string;
    claimedAt?: string;
    createdAt?: string;
}

export interface AcademicProgramOption {
    id: string;
    code: string;
    name: string;
    departmentId?: string;
}

export interface InternshipTermOption {
    id: string;
    code: string;
    termName: string;
    academicYear: string;
    status: string;
    departmentId?: string;
}

export interface ProvisionResult {
    password: string;
    email: string;
}

export interface RosterStats {
    total: number;
    eligible: number;
    ineligible: number;
    eligibleWithoutAccount: number;
    activated: number;
    notActivated: number;
}

export interface ProvisionedStudentAccount {
    studentCode: string;
    fullName: string;
    officialEmail: string;
    defaultPassword?: string;
    isNewlyCreated: boolean;
}

export interface BatchProvisionResult {
    totalEligibleWithoutAccount: number;
    newlyCreatedCount: number;
    linkedExistingCount: number;
    accounts: ProvisionedStudentAccount[];
}

export interface IneligibleNoticePayload {
    emailSubjectTemplate: string;
    emailBodyTemplate: string;
    supplementDeadline: string;
    contactInfo: string;
}

export interface IneligibleNoticeResult {
    totalIneligible: number;
    emailsSent: number;
    notificationsCreated: number;
    failedStudentCodes: string[];
}

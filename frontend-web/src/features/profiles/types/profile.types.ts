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

export interface AcademicProgram {
    id: string;
    departmentId?: string;
    departmentName?: string;
    code: string;
    name: string;
    degreeLevel?: string;
    track?: string;
    isActive?: boolean;
    createdAt?: string;
}

export interface Department {
    id: string;
    code: string;
    name: string;
    contactEmail: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

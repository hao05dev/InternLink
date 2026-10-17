export type VerificationStatus = 'PENDING' | 'NEEDS_REVISION' | 'VERIFIED' | 'REJECTED';

export interface CompanyAddress {
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
    city?: string;
    fullAddress?: string;
    [key: string]: any;
}

export interface Company {
    id: string;
    companyName: string;
    name?: string;
    taxCode?: string;
    industry?: string;
    website?: string;
    address?: string | CompanyAddress | null;
    verificationStatus: VerificationStatus;
    status?: string;
    description?: string;
    employeeRange?: string;
    verificationDetail?: Record<string, any>;
    verifiedByUserId?: string;
    verifiedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export { formatCompanyAddress } from "../utils/company-address";

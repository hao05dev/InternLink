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

export function formatCompanyAddress(address?: string | CompanyAddress | null): string {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
        const parts = [address.street, address.ward, address.district, address.province || address.city]
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
        if (parts.length > 0) return parts.join(', ');
        return Object.values(address)
            .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
            .join(', ');
    }
    return String(address);
}

import type { CompanyAddress } from "../types/company.types";
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

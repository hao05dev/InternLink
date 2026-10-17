import type { VerificationStatus } from "./company.types";

export interface PublicCompany {
  id: string;
  companyName: string;
  description?: string | null;
  industry?: string | null;
  employeeRange?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  officeAddress?: string | null;
  mapEmbedUrl?: string | null;
  mapsUrl?: string | null;
  verificationStatus: VerificationStatus;
}

export interface CompanySummary extends Pick<PublicCompany, "id" | "companyName" | "logoUrl" | "industry" | "employeeRange" | "website" | "officeAddress"> {
  publicProfile: boolean;
}

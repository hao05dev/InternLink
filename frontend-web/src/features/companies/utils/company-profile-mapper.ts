import type { PublicCompany } from "../types/public-company.types";
import type { CompanyProfileValues } from "../types/company-profile.types";

export function profileValues(company: PublicCompany): CompanyProfileValues {
  return {
    description: company.description ?? "", industry: company.industry ?? "",
    employeeRange: company.employeeRange ?? "", website: company.website ?? "",
    logoUrl: company.logoUrl ?? "", coverImageUrl: company.coverImageUrl ?? "",
    officeAddress: company.officeAddress ?? "", mapEmbedUrl: company.mapEmbedUrl ?? "", mapsUrl: company.mapsUrl ?? "",
  };
}

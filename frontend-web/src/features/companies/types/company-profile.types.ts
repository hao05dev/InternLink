export interface CompanyProfileValues {
  description: string;
  industry: string;
  employeeRange: string;
  website: string;
  logoUrl: string;
  coverImageUrl: string;
  officeAddress: string;
  mapEmbedUrl: string;
  mapsUrl: string;
}

export interface CompanyProfileFieldsProps {
  values: CompanyProfileValues;
  onChange: <K extends keyof CompanyProfileValues>(key: K, value: CompanyProfileValues[K]) => void;
  disabled?: boolean;
}

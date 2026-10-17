import type { UploadedFileItem } from "@/components/ui/file-uploader";
import type { FilterTermItem } from "@/components/ui/academic-term-filter";
import type { WorkFormat } from "./job.types";

export interface JobFormValues {
  title: string; workFormat: WorkFormat; location: string;
  useCompanyLocation: boolean; mapEmbedUrl: string; mapsUrl: string;
  vacancies: string; stipendAmount: string; isNegotiable: boolean;
  description: string; skillsText: string; benefitsText: string;
  bannerUrl: string; attachmentUrls: UploadedFileItem[];
  selectedDeptId: string; selectedTermId: string;
}
export interface JobDepartment { id: string; departmentName?: string; name?: string }
export type JobTerm = FilterTermItem;

import { CompanyPublicDetailView } from "@/features/companies/components/company-public-detail-view";

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  return <CompanyPublicDetailView id={params.id} />;
}

import { CompanyJobDetailView } from "@/features/jobs/views/company-job-detail-view";

interface PageProps {
    params: {
        id: string;
    };
}

export default function CompanyJobDetailPage({ params }: PageProps) {
    return <CompanyJobDetailView jobId={params.id} />;
}

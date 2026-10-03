import { CompanyJobFormView } from "@/features/jobs/views/company-job-form-view";

interface PageProps {
    params: {
        id: string;
    };
}

export default function CompanyEditJobPage({ params }: PageProps) {
    return <CompanyJobFormView mode="edit" jobId={params.id} />;
}

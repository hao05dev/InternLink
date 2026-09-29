import JobDetailView from "@/features/jobs/components/job-detail-view";

export default function JobDetailPage({ params }: { params: { id: string } }) {
    return <JobDetailView id={params.id} />;
}

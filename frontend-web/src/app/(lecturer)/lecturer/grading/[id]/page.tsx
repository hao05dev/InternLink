import LecturerGradingDetailView from '@/features/evaluations/views/lecturer-grading-detail-view';

export default function LecturerGradingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <LecturerGradingDetailView placementId={params.id} />;
}

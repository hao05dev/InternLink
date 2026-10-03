import LecturerStudentDetailView from '@/features/portfolio/views/lecturer-student-detail-view';

export default function LecturerSupervisionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <LecturerStudentDetailView placementId={params.id} />;
}

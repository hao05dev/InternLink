import MentorStudentDetailView from '@/features/portfolio/views/mentor-student-detail-view';

export default function MentorFinalAssessmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <MentorStudentDetailView
      placementId={params.id}
      backHref="/mentor/final-assessment"
      backLabel="Quay lại danh sách đánh giá"
      initialTab="forms"
      initialKind="M03"
    />
  );
}

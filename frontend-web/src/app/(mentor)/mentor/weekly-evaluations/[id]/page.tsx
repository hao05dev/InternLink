import MentorStudentDetailView from '@/features/portfolio/views/mentor-student-detail-view';

export default function MentorWeeklyEvaluationsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <MentorStudentDetailView
      placementId={params.id}
      backHref="/mentor/weekly-evaluations"
      backLabel="Quay lại danh sách theo dõi nhật ký"
      initialTab="days"
    />
  );
}

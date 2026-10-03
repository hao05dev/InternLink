import MentorStudentDetailView from '@/features/portfolio/views/mentor-student-detail-view';

export default function MentorInternshipRecordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <MentorStudentDetailView
      placementId={params.id}
      backHref="/mentor/internship-record"
      backLabel="Quay lại danh sách hồ sơ thực tập"
      initialTab="forms"
      initialKind="M01"
    />
  );
}

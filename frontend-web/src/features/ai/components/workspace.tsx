"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { aiApi, Option } from "../api";
import { action, ErrorNotice, Panel, SelectOption } from "./shared";
import { StudentSkills } from "./student-skills";
import { Recommendations } from "./recommendations";

function JobReviewPanel({ jobs }: { jobs: Option[] }) {
    const [job, setJob] = useState("");
    const review = useMutation({ mutationFn: aiApi.review });
    return <Panel title="Rà soát mô tả thực tập">
        <SelectOption label="Vị trí thực tập" value={job} onChange={id => { setJob(id); review.reset(); }} options={jobs} />
        <p className="text-sm text-slate-600">Đối chiếu bằng checklist và bộ kỹ năng nội bộ. Gợi ý chưa thay đổi tin tuyển dụng; hãy rà soát rồi chỉnh sửa trong màn hình quản lý tin.</p>
        <button className={action} disabled={!job || review.isPending} onClick={() => review.mutate(job)}>{review.isPending ? "Đang rà soát…" : "Rà soát nội dung"}</button>
        <ErrorNotice error={review.error} />
        {review.data && <div className="space-y-3">
            {(review.data.checklist.status === "FAILED" || review.data.extraction.status === "FAILED") && <p role="alert">Một phần phân tích chưa khả dụng. Vui lòng thử lại.</p>}
            {review.data.checklist.issues?.length === 0 && <p>Không phát hiện thiếu sót trong checklist hiện tại. Người phụ trách vẫn cần duyệt nội dung.</p>}
            {review.data.checklist.issues?.map(issue => <p key={issue.code} className="text-sm text-amber-800">{issue.message}{issue.quote && " — “" + issue.quote + "”"}</p>)}
            <h3 className="font-semibold">Kỹ năng được đề cập</h3>
            {review.data.extraction.normalized_skills?.map(skill => <div key={skill.id} className="border-l-2 pl-3 text-sm"><strong>{skill.name}</strong> · {skill.requirement_type === "mandatory" ? "Có dấu hiệu bắt buộc" : skill.requirement_type === "optional" ? "Có dấu hiệu ưu tiên" : "Chưa rõ mức yêu cầu"}<blockquote>{skill.evidence.quote}</blockquote></div>)}
        </div>}
    </Panel>;
}
function JournalPanel({ placements }: { placements: Option[] }) {
    const [placement, setPlacement] = useState("");
    const summary = useMutation({ mutationFn: aiApi.summary });
    return <Panel title="Đối chiếu kỹ năng từ nhật ký tuần">
        <SelectOption label="Hồ sơ thực tập" value={placement} onChange={id => { setPlacement(id); summary.reset(); }} options={placements} />
        <p className="text-sm text-slate-600">Chỉ dùng nhật ký tuần đã nộp trong hồ sơ bạn được phép xem. Nhật ký ngày chưa nằm trong bản tổng hợp này.</p>
        <button className={action} disabled={!placement || summary.isPending} onClick={() => summary.mutate(placement)}>{summary.isPending ? "Đang tổng hợp…" : "Tổng hợp dẫn chứng"}</button>
        <ErrorNotice error={summary.error} />
        {summary.data?.status === "FAILED" && <p role="alert">Dịch vụ tổng hợp chưa khả dụng.</p>}
        {summary.data?.claims && <div className="space-y-3"><p className="text-sm">{summary.data.notice}</p><p className="text-sm">Đã đọc {summary.data.entry_count} nhật ký tuần.</p>
            {summary.data.claims.length === 0 && <p>Chưa tìm thấy kỹ năng thuộc bộ kỹ năng nội bộ.</p>}
            {summary.data.claims.map(claim => <article key={claim.entry_id + claim.skill_id} className="rounded-lg border p-3"><strong>{claim.skill_name}</strong><blockquote className="my-2 text-sm">{claim.quote}</blockquote><p className="text-xs text-slate-500">Nguồn nhật ký: {claim.entry_id} · {claim.verification === "mentor_reviewed" ? "Nhật ký đã được duyệt" : "Sinh viên tự báo cáo"}</p></article>)}
        </div>}
    </Panel>;
}
function GapPanel({ terms }: { terms: Option[] }) {
    const [term, setTerm] = useState("");
    const report = useQuery({ queryKey: ["ai-gaps", term], queryFn: () => aiApi.gaps(term), enabled: !!term });
    return <Panel title="Nhu cầu kỹ năng theo kỳ">
        <SelectOption label="Kỳ thực tập" value={term} onChange={setTerm} options={terms} />
        <ErrorNotice error={report.error} />
        {report.isFetching && <p>Đang tổng hợp dữ liệu…</p>}
        {report.data && <div className="space-y-3"><p className="text-sm">{report.data.notice}</p><p>{report.data.claimedProfiles}/{report.data.cohortSize} sinh viên đã liên kết hồ sơ.</p>
            {report.data.suppressed ? <p>Nhóm có dưới 5 hồ sơ liên kết. Chưa hiển thị thống kê kỹ năng.</p> : <>
                <p className="text-sm">{report.data.approvedJobs} vị trí đã duyệt. Dấu “Ẩn” bảo vệ nhóm nhỏ; không tương đương 0.</p>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Kỹ năng</th><th className="p-2">Vị trí yêu cầu</th><th className="p-2">Sinh viên tự xác nhận</th></tr></thead><tbody>{report.data.skills.map(skill => <tr key={skill.id} className="border-t"><td className="p-2">{skill.name}</td><td className="p-2">{skill.jobsRequiring}</td><td className="p-2">{skill.confirmedStudents ?? "Ẩn"}</td></tr>)}</tbody></table></div>
            </>}
        </div>}
    </Panel>;
}
export function AiWorkspace() {
    const { user } = useAuth();
    const options = useQuery({ queryKey: ["ai-options", user?.id], queryFn: aiApi.options, enabled: !!user });
    const role = user?.role;
    return <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        <header><h1 className="text-2xl font-bold text-slate-900">Hỗ trợ thực tập với AI</h1><p className="mt-2 text-slate-600">Rà soát thông tin, tìm kỹ năng phù hợp và chuẩn bị nội dung để trao đổi với người hướng dẫn.</p></header>
        <ErrorNotice error={options.error} />
        {options.isPending && <p>Đang tải phạm vi hồ sơ…</p>}
        {role === "STUDENT" && <><StudentSkills /><Recommendations terms={options.data?.terms ?? []} userId={user?.id} /></>}
        {(role === "COMPANY_REP" || role === "FACULTY_ADMIN") && <JobReviewPanel jobs={options.data?.jobs ?? []} />}
        {role === "FACULTY_ADMIN" && <GapPanel terms={options.data?.terms ?? []} />}
        {(role === "STUDENT" || role === "LECTURER" || role === "COMPANY_MENTOR") && <JournalPanel placements={options.data?.placements ?? []} />}
    </main>;
}

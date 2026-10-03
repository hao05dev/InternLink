"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi, Option } from "../api";
import { action, ErrorNotice, Panel, SelectOption } from "./shared";

export function Recommendations({ terms, userId }: { terms: Option[]; userId?: string }) {
    const [term, setTerm] = useState("");
    const matches = useQuery({ queryKey: ["ai-matches", userId, term], queryFn: () => aiApi.recommend(term), enabled: !!term });
    const taxonomy = useQuery({ queryKey: ["ai-taxonomy"], queryFn: aiApi.taxonomy });
    const plan = useMutation({ mutationFn: aiApi.plan });
    const name = (id: string) => taxonomy.data?.find(skill => skill.id === id)?.skillName ?? id;
    return <Panel title="3. Gợi ý vị trí và kỹ năng cần bổ sung">
        <SelectOption label="Kỳ thực tập" options={terms} value={term} onChange={id => { setTerm(id); plan.reset(); }} />
        <p className="text-sm text-slate-600">Điểm thể hiện mức khớp kỹ năng đã xác nhận với yêu cầu tin tuyển dụng. Hãy kiểm tra thêm ngành học, địa điểm, thời hạn và điều kiện đăng ký.</p>
        <ErrorNotice error={matches.error ?? plan.error} />
        {matches.isFetching && <p>Đang đối chiếu kỹ năng…</p>}
        {matches.data?.length === 0 && <p>Chưa có vị trí được duyệt trong kỳ này.</p>}
        <ul className="space-y-3">{matches.data?.map(job => <li key={job.jobId} className="rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold">{job.jobTitle} · {job.companyName}</h3>
            <p className="text-sky-800 font-semibold">{job.scoreAvailable ? job.matchScore + "% khớp kỹ năng" : "Chưa đủ dữ liệu để tính điểm"}</p>
            <p className="text-sm text-slate-500">{job.semanticAvailable ? "Có đối chiếu ngữ nghĩa." : "Đang đối chiếu theo danh sách kỹ năng."}</p>
            {job.warnings?.includes("ai_unavailable") && <p className="text-sm text-amber-800">Dịch vụ AI tạm gián đoạn; hệ thống đang dùng cách tính dự phòng theo kỹ năng.</p>}
            <p className="text-sm">Đã khớp: {job.matchedSkills.map(name).join(", ") || "Chưa có"}</p>
            <p className="text-sm">Yêu cầu chưa có minh chứng: {job.missingSkills.map(name).join(", ") || "Không có trong danh sách bắt buộc"}</p>
            {job.missingSkills.length > 0 && <button className={action} disabled={plan.isPending} onClick={() => plan.mutate(job.missingSkills.slice(0, 3))}>Gợi ý bài tập cho tối đa 3 kỹ năng thiếu</button>}
        </li>)}</ul>
        {plan.data?.status === "FAILED" && <p role="alert">Chưa tạo được kế hoạch. Vui lòng thử lại.</p>}
        {plan.data?.tasks && <div className="space-y-3"><h3 className="font-semibold">Bản nháp kế hoạch học tập</h3><p className="text-sm">{plan.data.notice}</p>{plan.data.tasks.map(task => <article key={task.skill_id} className="rounded-lg bg-sky-50 p-4 space-y-2"><h4 className="font-semibold">{task.skill_name}</h4><p>{task.task}</p><p className="text-sm">Minh chứng: {task.evidence}</p><p className="text-sm">Rà soát: {task.review_criterion}</p><p className="text-sm">Dự kiến {task.estimated_hours} giờ cho bài tập; trao đổi với mentor để điều chỉnh.</p></article>)}</div>}
    </Panel>;
}

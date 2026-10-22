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
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-base">{job.jobTitle} · {job.companyName}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.scoreLabel === "Cao" ? "bg-emerald-100 text-emerald-800" :
                    job.scoreLabel === "Vừa" ? "bg-sky-100 text-sky-800" :
                    job.scoreLabel === "Thấp" ? "bg-amber-100 text-amber-800" :
                    "bg-slate-100 text-slate-800"
                }`}>
                    {job.scoreAvailable
                        ? `Điểm phù hợp: ${job.scoreFormatted ?? (job.matchScore + "/100")} · ${job.scoreLabel ?? "Đã đối chiếu"}`
                        : "Chưa đủ dữ liệu để tính điểm"}
                </span>
            </div>

            {job.eligibilityStatus && (
                <div className="text-xs text-slate-500">
                    <span className="font-medium">Điều kiện đăng ký: </span>
                    <span className={job.eligibilityStatus === "ELIGIBLE" ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                        {job.eligibilityStatus === "ELIGIBLE" ? "Đủ điều kiện dự tuyển" : "Cần lưu ý điều kiện"}
                    </span>
                    {job.eligibilityReason && <span className="ml-1">({job.eligibilityReason})</span>}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                <div>
                    <span className="font-medium text-slate-700">Kỹ năng bắt buộc khớp: </span>
                    <span className="text-slate-600">
                        {job.mandatoryScore !== undefined ? `${Math.round(job.mandatoryScore * 100)}%` : "Theo danh sách"}
                    </span>
                </div>
                <div>
                    <span className="font-medium text-slate-700">Kỹ năng ưu tiên khớp: </span>
                    <span className="text-slate-600">
                        {job.optionalScore !== undefined ? `${Math.round(job.optionalScore * 100)}%` : "Theo danh sách"}
                    </span>
                </div>
            </div>

            <p className="text-xs text-slate-500">{job.semanticAvailable ? "Có đối chiếu ngữ nghĩa bổ trợ." : "Đang đối chiếu chuẩn theo danh sách kỹ năng."}</p>
            {job.explanation?.effective_weights && <p className="text-xs text-slate-500">
                Trọng số thực dùng: {Object.entries(job.explanation.effective_weights)
                    .map(([key, value]) => `${key === "skill" ? "kỹ năng" : "ngữ nghĩa"} ${Math.round(value * 100)}%`)
                    .join(" · ")}
            </p>}
            {job.warnings?.includes("ai_unavailable") && <p className="text-xs text-amber-800">Dịch vụ AI tạm gián đoạn; hệ thống đang dùng cách tính dự phòng theo kỹ năng.</p>}
            {job.explanation?.recommendation && <p className="text-sm text-slate-700">{job.explanation.recommendation}</p>}
            <p className="text-sm">Đã khớp: {job.matchedSkills.map(name).join(", ") || "Chưa có"}</p>
            <p className="text-sm">Yêu cầu chưa có minh chứng: {job.missingSkills.map(name).join(", ") || "Không có trong danh sách bắt buộc"}</p>
            <p className="text-xs italic text-slate-400">Điểm mang tính định hướng, không thay thế quyết định tuyển dụng của doanh nghiệp.</p>
            {job.missingSkills.length > 0 && <button className={action} disabled={plan.isPending} onClick={() => plan.mutate(job.missingSkills.slice(0, 3))}>Gợi ý bài tập cho tối đa 3 kỹ năng thiếu</button>}
        </li>)}</ul>
        {plan.data?.status === "FAILED" && <p role="alert">Chưa tạo được kế hoạch. Vui lòng thử lại.</p>}
        {plan.data?.tasks && <div className="space-y-3"><h3 className="font-semibold">Bản nháp kế hoạch học tập</h3><p className="text-sm">{plan.data.notice}</p>{plan.data.tasks.map(task => <article key={task.skill_id} className="rounded-lg bg-sky-50 p-4 space-y-2"><h4 className="font-semibold">{task.skill_name}</h4><p>{task.task}</p><p className="text-sm">Minh chứng: {task.evidence}</p><p className="text-sm">Rà soát: {task.review_criterion}</p><p className="text-sm">Dự kiến {task.estimated_hours} giờ cho bài tập; trao đổi với mentor để điều chỉnh.</p></article>)}</div>}
    </Panel>;
}

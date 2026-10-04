"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { uploadDocument } from "@/lib/document-upload";
import { aiApi } from "../api";
import { action, control, ErrorNotice, Panel } from "./shared";

const failures: Record<string, string> = {
  ocr_required:
    "PDF chưa có lớp văn bản. Hãy dùng PDF có thể chọn chữ hoặc dán nội dung CV.",
  encrypted_pdf: "Hãy cung cấp bản CV không khóa mật khẩu.",
  ai_unavailable:
    "Dịch vụ phân tích đang không khả dụng. Kỹ năng hiện tại vẫn được giữ.",
  unsupported_document_type: "Chỉ hỗ trợ PDF, DOCX và TXT.",
};
export function StudentSkills() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [cloud, setCloud] = useState(false);
  const [skillId, setSkillId] = useState("");
  const [evidence, setEvidence] = useState("");
  const skills = useQuery({
    queryKey: ["ai-skills", user?.id],
    queryFn: aiApi.skills,
    enabled: !!user,
  });
  const taxonomy = useQuery({
    queryKey: ["ai-taxonomy"],
    queryFn: aiApi.taxonomy,
  });
  const refresh = () => {
    void cache.invalidateQueries({ queryKey: ["ai-skills"] });
    void cache.invalidateQueries({ queryKey: ["ai-matches"] });
  };
  const extraction = useMutation({
    mutationFn: async () => {
      if (!consent) throw new Error("Cần đồng ý phân tích CV.");
      let documentId: string | undefined;
      if (file) {
        if (file.size > 10 * 1024 * 1024) throw new Error("CV tối đa 10 MB.");

        const uploaded = await uploadDocument(file, "PROFILE", user!.id, "CV");
        documentId = uploaded.data.id;
      }
      const result = await aiApi.extract({
        ...(documentId ? { documentId } : { text }),
        consent,
        allowCloud: cloud,
      });
      if (result.status === "FAILED")
        throw new Error(
          failures[result.error_code ?? ""] ??
            "Không đọc được CV. Hãy kiểm tra tệp hoặc dán nội dung.",
        );
      return result;
    },
    onSuccess: refresh,
  });
  const confirm = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      aiApi.confirm(id, value),
    onSuccess: refresh,
  });
  const declaration = useMutation({
    mutationFn: () => aiApi.declare(skillId, evidence),
    onSuccess: () => {
      setEvidence("");
      refresh();
    },
  });
  return (
    <div className="space-y-5">
      <Panel title="1. Đọc kỹ năng từ CV">
        <p className="text-sm text-slate-600">
          Tải một CV hoặc dán văn bản. Kết quả là gợi ý để bạn kiểm tra, chưa
          được dùng để tính điểm cho tới khi xác nhận.
        </p>
        <label className="block text-sm">
          CV (PDF, DOCX, TXT · tối đa 10 MB)
          <input
            className={control + " mt-2"}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              extraction.reset();
            }}
          />
        </label>
        <label className="block text-sm">
          Hoặc dán nội dung
          <textarea
            className={control + " mt-2 min-h-32"}
            value={text}
            maxLength={100000}
            disabled={!!file}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          Tôi đồng ý phân tích CV để gợi ý kỹ năng và lưu câu trích dẫn trong hồ
          sơ của mình.
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={cloud}
            onChange={(event) => setCloud(event.target.checked)}
          />
          Cho phép gửi nội dung đến nhà cung cấp AI bên ngoài nếu hệ thống đã
          cấu hình. Bỏ chọn để xử lý theo bộ kỹ năng nội bộ.
        </label>
        <button
          className={action}
          disabled={!consent || (!file && !text.trim()) || extraction.isPending}
          onClick={() => extraction.mutate()}
        >
          {extraction.isPending ? "Đang đọc CV…" : "Phân tích CV"}
        </button>
        <ErrorNotice error={extraction.error} />
        {extraction.isSuccess && (
          <p role="status" className="text-sm text-emerald-800">
            Đã xử lý CV (
            {extraction.data.mode === "gemini"
              ? "mô hình AI"
              : "bộ kỹ năng nội bộ"}
            ). Hãy rà soát danh sách bên dưới.
          </p>
        )}
      </Panel>
      <Panel title="2. Rà soát và xác nhận kỹ năng">
        <ErrorNotice error={skills.error ?? confirm.error} />
        {skills.isPending && <p>Đang tải kỹ năng…</p>}
        {skills.data?.length === 0 && (
          <p className="text-sm text-slate-500">
            Chưa có kỹ năng. Phân tích CV hoặc tự khai ở bên dưới.
          </p>
        )}
        <ul className="space-y-3">
          {skills.data?.map((skill) => {
            const assertion = skill.aiEvidence?.assertionStatus;
            const blocked = assertion === "negated" || assertion === "learning";
            return (
              <li
                key={skill.skillId}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong>{skill.skillName}</strong>
                  <button
                    className={action}
                    disabled={
                      confirm.isPending || (blocked && !skill.isConfirmed)
                    }
                    onClick={() =>
                      confirm.mutate({
                        id: skill.skillId,
                        value: !skill.isConfirmed,
                      })
                    }
                  >
                    {skill.isConfirmed ? "Bỏ xác nhận" : "Xác nhận kỹ năng"}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {skill.isConfirmed ? "Bạn đã xác nhận" : "Chờ rà soát"} ·{" "}
                  {skill.source === "STUDENT_DECLARED"
                    ? "Tự khai"
                    : "Đề xuất từ CV"}
                </p>
                {skill.aiEvidence?.evidence?.quote && (
                  <blockquote className="border-l-2 border-sky-300 pl-3 text-sm text-slate-600">
                    {skill.aiEvidence.evidence.quote}
                  </blockquote>
                )}
                {skill.aiEvidence?.studentEvidence && (
                  <p className="text-sm">{skill.aiEvidence.studentEvidence}</p>
                )}
                {blocked && (
                  <p className="text-sm text-amber-800">
                    Câu nguồn thể hiện{" "}
                    {assertion === "negated"
                      ? "chưa có kỹ năng"
                      : "đang hoặc dự định học"}
                    . Nếu đã có minh chứng mới, hãy tự khai bên dưới.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel title="Tự khai kỹ năng với minh chứng">
        <ErrorNotice error={taxonomy.error ?? declaration.error} />
        <label className="block text-sm">
          Kỹ năng
          <select
            className={control + " mt-2"}
            value={skillId}
            onChange={(event) => setSkillId(event.target.value)}
          >
            <option value="">Chọn kỹ năng</option>
            {taxonomy.data?.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.skillName}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Minh chứng thực hiện
          <textarea
            className={control + " mt-2"}
            maxLength={2000}
            value={evidence}
            onChange={(event) => setEvidence(event.target.value)}
            placeholder="Mô tả bài tập, dự án hoặc công việc bạn đã thực hiện."
          />
        </label>
        <button
          className={action}
          disabled={!skillId || !evidence.trim() || declaration.isPending}
          onClick={() => declaration.mutate()}
        >
          Lưu kỹ năng tự khai
        </button>
        {declaration.isSuccess && (
          <p role="status" className="text-sm text-emerald-800">
            Đã lưu kỹ năng tự khai.
          </p>
        )}
      </Panel>
    </div>
  );
}

"use client";
import { useRef, useState } from "react";
import { jobService } from "../services/job.service";
import type { JobFormValues } from "../types/job-form.types";
import { jobFormPayload } from "../utils/job-form-mapper";
import { validateJobForm } from "../utils/job-form-schema";

interface Options { companyId: string; jobId?: string; values: JobFormValues; blocked: boolean; onSuccess: () => void }

export function useJobFormSubmit({ companyId, jobId, values, blocked, onSuccess }: Options) {
  const savedId = useRef(jobId);
  const pending = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  async function save(submitAfterSave: boolean) {
    if (pending.current) return;
    const invalid = validateJobForm(values);
    if (blocked || !companyId || invalid) {
      setError(blocked ? "Chờ tải dữ liệu/ảnh hoàn tất và chọn học kỳ đang mở." : !companyId ? "Tài khoản chưa được gắn doanh nghiệp." : invalid ?? ""); return;
    }
    pending.current = true; setSubmitting(true); setError("");
    try {
      const payload = jobFormPayload(values, companyId);
      if (savedId.current) await jobService.updateJob(savedId.current, payload);
      else {
        const saved = await jobService.createJob(payload);
        if (!saved?.id) throw new Error("Máy chủ chưa trả mã tin đã lưu.");
        savedId.current = saved.id;
      }
      if (submitAfterSave) await jobService.submitJob(savedId.current);
      onSuccess();
    } catch (e) { setError(e instanceof Error ? e.message : "Không lưu được tin tuyển dụng."); }
    finally { pending.current = false; setSubmitting(false); }
  }
  return { save, submitting, error };
}

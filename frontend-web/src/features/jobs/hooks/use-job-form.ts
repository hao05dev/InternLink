"use client";
import { useCallback, useEffect, useState } from "react";
import { jobService } from "../services/job.service";
import { jobFormMetadataService } from "../services/job-form-metadata.service";
import { emptyJobForm, jobToForm } from "../utils/job-form-mapper";
import type { JobDepartment, JobFormValues } from "../types/job-form.types";
import { useJobFormMetadata } from "./use-job-form-metadata";

export function useJobForm(mode: "create" | "edit", jobId?: string, ownerCompanyId?: string) {
  const [values, setValues] = useState(emptyJobForm);
  const [departments, setDepartments] = useState<JobDepartment[]>([]);
  const [companyId, setCompanyId] = useState(ownerCompanyId ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    Promise.all([jobFormMetadataService.departments(), mode === "edit" && jobId ? jobService.getManagedJobById(jobId) : Promise.resolve(null)])
      .then(([depts, job]) => { if (active) {
        setDepartments(depts); setCompanyId(job?.companyId || ownerCompanyId || "");
        setValues(job ? jobToForm(job) : { ...emptyJobForm(), selectedDeptId: depts[0]?.id ?? "" });
      } }).catch(e => { if (active) setError(e instanceof Error ? e.message : "Không tải được biểu mẫu."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [mode, jobId, ownerCompanyId]);
  const metadata = useJobFormMetadata(values.selectedDeptId);
  useEffect(() => {
    if (metadata.loadedDepartment === values.selectedDeptId && metadata.terms.length) setValues(v => metadata.terms.some(t => t.id === v.selectedTermId)
      ? v : { ...v, selectedTermId: metadata.terms[0].id });
  }, [metadata.terms, metadata.loadedDepartment, values.selectedDeptId]);
  const change = <K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) => setValues(v => ({ ...v, [key]: value,
    ...(key === "selectedDeptId" ? { selectedTermId: "" } : {}) }));
  const restore = useCallback((draft: Partial<JobFormValues>) => setValues(v => ({ ...v, ...draft })), []);
  const reset = useCallback(() => setValues(v => ({ ...emptyJobForm(), selectedDeptId: v.selectedDeptId, selectedTermId: v.selectedTermId })), []);
  const uploadState = useCallback((busy: boolean) => setUploads(n => Math.max(0, n + (busy ? 1 : -1))), []);
  return { values, change, departments, companyId, loading, error: error || metadata.error,
    terms: metadata.terms, termsLoading: metadata.loading, uploads, uploadState, restore, reset,
    isTermClosed: metadata.terms.find(t => t.id === values.selectedTermId)?.status === "CLOSED" };
}

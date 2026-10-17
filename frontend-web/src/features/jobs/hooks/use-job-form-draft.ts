"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { JobFormValues } from "../types/job-form.types";
import { emptyJobForm } from "../utils/job-form-mapper";

export type JobFormDraftValues = JobFormValues;
interface Options {
  mode: "create" | "edit"; companyId?: string; isLoading: boolean; isSubmitting: boolean;
  values: JobFormValues; onRestore: (draft: Partial<JobFormValues>) => void; onResetToDefault: () => void;
}

export function useJobFormDraft({ mode, companyId, isLoading, isSubmitting, values, onRestore, onResetToDefault }: Options) {
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [restoredTime, setRestoredTime] = useState<string | null>(null);
  const restoredKey = useRef("");
  const submitted = useRef(false);
  const storageKey = companyId ? `internlink_job_draft_${companyId}` : "";
  useEffect(() => {
    if (mode !== "create" || !storageKey || isLoading || restoredKey.current === storageKey) return;
    restoredKey.current = storageKey; submitted.current = false;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, unknown>;
      const clean: Record<string, unknown> = {};
      Object.entries(emptyJobForm()).forEach(([key, initial]) => {
        if (typeof saved[key] === typeof initial && !Array.isArray(initial)) clean[key] = saved[key];
      });
      if (Array.isArray(saved.attachmentUrls)) clean.attachmentUrls = saved.attachmentUrls.filter(item =>
        item && typeof item.id === "string" && typeof item.fileName === "string" && typeof item.fileUrl === "string");
      onRestore(clean as Partial<JobFormValues>); setHasRestoredDraft(true);
      if (typeof saved.updatedAt === "number") setRestoredTime(new Date(saved.updatedAt).toLocaleTimeString("vi-VN"));
    } catch { /* A malformed local draft must not block editing. */ }
  }, [mode, storageKey, isLoading, onRestore]);
  const dirty = !!(values.title.trim() || values.description.trim() || values.location.trim() || values.useCompanyLocation);
  useEffect(() => {
    if (mode !== "create" || !storageKey || isLoading || isSubmitting || submitted.current || !dirty) return;
    const timer = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify({ ...values, updatedAt: Date.now() })); } catch { /* Storage may be full. */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [mode, storageKey, isLoading, isSubmitting, values, dirty]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty && !submitted.current && !isSubmitting) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, isSubmitting]);
  const removeDraftOnSuccess = useCallback(() => {
    submitted.current = true;
    try { if (storageKey) localStorage.removeItem(storageKey); } catch { /* Storage unavailable. */ }
    setHasRestoredDraft(false);
  }, [storageKey]);
  const clearDraft = useCallback(() => {
    removeDraftOnSuccess(); submitted.current = false;
    onResetToDefault(); setRestoredTime(null);
  }, [removeDraftOnSuccess, onResetToDefault]);
  return { hasRestoredDraft, restoredTime, removeDraftOnSuccess, clearDraft, dismissBanner: () => setHasRestoredDraft(false) };
}

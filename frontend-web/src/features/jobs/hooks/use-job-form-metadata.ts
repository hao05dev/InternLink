"use client";
import { useEffect, useState } from "react";
import { jobFormMetadataService } from "../services/job-form-metadata.service";
import type { JobTerm } from "../types/job-form.types";

export function useJobFormMetadata(departmentId: string) {
  const [terms, setTerms] = useState<JobTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedDepartment, setLoadedDepartment] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setTerms([]); setLoadedDepartment(""); setError(""); setLoading(!!departmentId);
    if (departmentId) jobFormMetadataService.terms(departmentId)
      .then(data => { if (active) { setTerms(data); setLoadedDepartment(departmentId); } })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Không tải được học kỳ."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [departmentId]);
  return { terms, loadedDepartment, loading: loading || (!!departmentId && loadedDepartment !== departmentId && !error), error };
}

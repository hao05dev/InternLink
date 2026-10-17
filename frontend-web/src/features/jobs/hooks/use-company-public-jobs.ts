"use client";
import { useEffect, useState } from "react";
import { jobService } from "../services/job.service";
import type { JobPosition } from "../types/job.types";

export function useCompanyPublicJobs(companyId?: string) {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(!!companyId);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setJobs([]); setError(""); setLoading(!!companyId);
    if (companyId) jobService.getPublicJobs({ companyId }).then(data => {
      if (active) setJobs(data.filter(j => j.isAcceptingApplications !== false));
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : "Không tải được vị trí tuyển dụng."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [companyId, revision]);
  return { jobs, loading, error, retry: () => setRevision(r => r + 1) };
}

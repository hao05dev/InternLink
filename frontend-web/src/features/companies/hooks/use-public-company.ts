"use client";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { companyService } from "../services/company.service";
import type { PublicCompany } from "../types/public-company.types";

export function usePublicCompany(id?: string) {
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setCompany(null); setError(""); setNotFound(false); setLoading(!!id);
    if (id) companyService.getPublic(id, controller.signal)
      .then(data => { if (!controller.signal.aborted) setCompany(data); })
      .catch(e => { if (!controller.signal.aborted) {
        setNotFound(e instanceof ApiError && e.status === 404);
        setError(e instanceof Error ? e.message : "Không tải được hồ sơ doanh nghiệp.");
      } }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, revision]);
  return { company, loading, error, notFound, retry: () => setRevision(r => r + 1) };
}

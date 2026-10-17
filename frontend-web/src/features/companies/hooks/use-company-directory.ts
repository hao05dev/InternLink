"use client";
import { useEffect, useState } from "react";
import { companyService } from "../services/company.service";
import type { PublicCompany } from "../types/public-company.types";

export function useCompanyDirectory() {
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    companyService.listPublic(controller.signal).then(data => { if (!controller.signal.aborted) setCompanies(data); })
      .catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Không tải được danh bạ."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  return { companies, loading, error, retry: () => setRevision(r => r + 1) };
}

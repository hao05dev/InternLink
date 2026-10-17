"use client";
import { useCallback, useEffect, useState } from "react";
import { companyService } from "../services/company.service";
import type { PublicCompany } from "../types/public-company.types";
import type { CompanyProfileValues } from "../types/company-profile.types";

export function useCompanyProfile() {
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    companyService.getOwnProfile().then(data => { if (active) setCompany(data); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Không tải được hồ sơ."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  const save = useCallback(async (values: CompanyProfileValues) => {
    const saved = await companyService.saveProfile(values);
    setCompany(saved);
    return saved;
  }, []);
  return { company, loading, error, save, retry: () => setRevision(r => r + 1) };
}

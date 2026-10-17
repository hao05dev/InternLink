"use client";
import { useCallback, useEffect, useState } from "react";
import type { PublicCompany } from "../types/public-company.types";
import type { CompanyProfileValues } from "../types/company-profile.types";
import { profileValues } from "../utils/company-profile-mapper";
import { companyProfileSchema } from "../utils/company-profile-schema";

export function useCompanyProfileForm(company: PublicCompany, onSave: (v: CompanyProfileValues) => Promise<PublicCompany>) {
  const [values, setValues] = useState(() => profileValues(company));
  const [baseline, setBaseline] = useState(() => profileValues(company));
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const change = <K extends keyof CompanyProfileValues>(key: K, value: CompanyProfileValues[K]) => {
    setValues(v => ({ ...v, [key]: value })); setSaved(false);
  };
  const uploadState = useCallback((busy: boolean) => setUploads(n => Math.max(0, n + (busy ? 1 : -1))), []);
  async function submit() {
    if (saving || uploads) return;
    setError(""); setSaved(false);
    const result = companyProfileSchema.safeParse(values);
    if (!result.success) { setError(result.error.issues[0].message); return; }
    setSaving(true);
    try {
      const next = profileValues(await onSave(result.data));
      setValues(next); setBaseline(next); setSaved(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Không lưu được hồ sơ."); }
    finally { setSaving(false); }
  }
  return { values, change, saving, uploads, error, saved, dirty, submit, uploadState,
    reset: () => { setValues(baseline); setError(""); setSaved(false); } };
}

"use client";
import { useState } from "react";
import { Building2 } from "lucide-react";

export function CompanyLogo({ src, name, large = false }: { src?: string | null; name: string; large?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  return <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm ${large ? "h-24 w-24 sm:h-28 sm:w-28" : "h-14 w-14"}`}>
    {src && failed !== src ? <img src={src} alt={`Logo ${name}`} className="h-full w-full object-contain" onError={() => setFailed(src)} />
      : <Building2 aria-label={name} className={`${large ? "h-12 w-12" : "h-7 w-7"} text-sky-700`} />}
  </div>;
}

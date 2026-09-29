'use client';
import { useEffect, useState } from 'react';
import PortfolioWorkspace from './portfolio-workspace';
import { apiClient, ApiError } from '@/lib/api-client';
import { portfolioApi, errorText } from './api';
import type { FinalResult } from '@/features/evaluations/types/evaluation.types';

export default function StudentReportPage() {
  const [results, setResults] = useState<{ name: string; result: FinalResult }[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const placements = (await portfolioApi.placements()).data || [];
        const loaded = await Promise.all(placements.map(async p => {
          try { const result = (await apiClient.get<FinalResult>(`/api/v1/final-results/placement/${p.id}`)).data; return result?.published ? { name: p.termName, result } : null; }
          catch (e) { if (e instanceof ApiError && [400, 403, 404].includes(e.status)) return null; throw e; }
        }));
        if (active) setResults(loaded.filter((item): item is { name: string; result: FinalResult } => item !== null));
      } catch (e) { if (active) setError(errorText(e)); }
    }
    void load(); return () => { active = false; };
  }, []);
  return <div className="space-y-6"><PortfolioWorkspace initialTab="forms" initialKind="M05" />
    <section className="space-y-3 rounded-xl border bg-white p-5"><h2 className="text-lg font-bold">Kết quả đã công bố</h2>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {results.length === 0 && !error && <p className="text-sm text-slate-500">Chưa có điểm tổng kết được công bố.</p>}
      {results.map(({ name, result }) => <div key={result.id} className="rounded-lg bg-slate-50 p-4"><p className="font-semibold">{name}</p><div className="mt-3 grid grid-cols-3 gap-3 text-center">{[['Điểm thang 10', result.finalScoreScale10], ['Điểm thang 4', result.finalScoreScale4], ['Điểm chữ', result.gradeLetter]].map(([label, value]) => <div key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value ?? '—'}</p></div>)}</div>{result.comments && <p className="mt-3 text-sm">{result.comments}</p>}</div>)}
    </section>
  </div>;
}

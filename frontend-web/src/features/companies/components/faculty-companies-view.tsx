'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Company = { id: string; companyName: string; taxCode: string; industry?: string; website?: string; verificationStatus: 'PENDING' | 'NEEDS_REVISION' | 'VERIFIED' | 'REJECTED' };
type Decision = 'VERIFIED' | 'NEEDS_REVISION' | 'REJECTED';

export default function FacultyCompaniesView() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selected, setSelected] = useState<Company | null>(null);
    const [decision, setDecision] = useState<Decision>('VERIFIED');
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const reload = useCallback(async () => { try { const result = await apiClient.get<Company[]>('/api/v1/companies'); setCompanies(result.data ?? []); } catch (error) { setMessage(error instanceof Error ? error.message : 'Không tải được doanh nghiệp.'); } }, []);
    useEffect(() => { void reload(); }, [reload]);
    const review = async () => {
        if (!selected) return;
        if (decision !== 'VERIFIED' && !note.trim()) { setMessage('Cần ghi lý do từ chối hoặc yêu cầu bổ sung.'); return; }
        setBusy(true);
        try {
            await apiClient.patch(`/api/v1/companies/${selected.id}/verify?status=${decision}`, { note: note.trim() });
            setMessage('Đã lưu kết quả thẩm định.');
            setSelected(null);
            await reload();
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Không lưu được kết quả thẩm định.'); }
        finally { setBusy(false); }
    };
    return <div className="max-w-5xl space-y-5"><div><h1 className="text-2xl font-bold">Thẩm định doanh nghiệp</h1><p className="text-sm text-slate-500">Khoa xác minh hồ sơ doanh nghiệp trước khi duyệt vị trí thực tập.</p></div>
        {message && <p role="alert" className="rounded bg-blue-50 p-3 text-sm">{message}</p>}
        {companies.map(company => <Card key={company.id}><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><div><strong>{company.companyName}</strong><p className="text-sm text-slate-500">MST: {company.taxCode} · {company.industry || 'Chưa phân loại'} · {company.verificationStatus}</p>{company.website && <a className="text-sm text-blue-700" href={company.website} target="_blank" rel="noreferrer">Website doanh nghiệp</a>}</div><Button variant="outline" onClick={() => { setSelected(company); setDecision('VERIFIED'); setNote(''); }}>Thẩm định</Button></CardContent></Card>)}
        {!companies.length && <p className="text-sm text-slate-500">Chưa có doanh nghiệp đăng ký.</p>}
        {selected && <Card><CardContent className="space-y-3 p-4"><h2 className="font-semibold">Kết quả cho {selected.companyName}</h2><select aria-label="Kết quả thẩm định" className="rounded border p-2 text-sm" value={decision} onChange={event => setDecision(event.target.value as Decision)}><option value="VERIFIED">Xác minh đạt</option><option value="NEEDS_REVISION">Yêu cầu bổ sung</option><option value="REJECTED">Từ chối</option></select><Textarea label="Ghi chú thẩm định" value={note} onChange={event => setNote(event.target.value)} required={decision !== 'VERIFIED'} /><div className="flex gap-2"><Button onClick={review} isLoading={busy}>Lưu kết quả</Button><Button variant="outline" onClick={() => setSelected(null)}>Hủy</Button></div></CardContent></Card>}
    </div>;
}

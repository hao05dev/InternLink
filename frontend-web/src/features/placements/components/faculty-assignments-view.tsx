'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

type Term = { id: string; code: string; termName: string };
type Lecturer = { id: string; fullName: string; departmentName: string };
type Agreement = { id: string; termId: string; studentName: string; companyName: string; status: string };

export default function FacultyAssignmentsView() {
    const { user } = useAuth();
    const [terms, setTerms] = useState<Term[]>([]);
    const [termId, setTermId] = useState('');
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [placements, setPlacements] = useState<InternshipPlacement[]>([]);
    const [selected, setSelected] = useState<{ kind: 'agreement' | 'placement'; id: string; studentName: string } | null>(null);
    const [lecturerId, setLecturerId] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    const reloadTerm = useCallback(async (selectedTermId: string, departmentId: string) => {
        const [placementResult, agreementResult] = await Promise.all([
            apiClient.get<InternshipPlacement[]>(`/api/v1/placements/term/${selectedTermId}`),
            apiClient.get<Agreement[]>(`/api/v1/agreements/department/${departmentId}?status=APPROVED`),
        ]);
        const currentPlacements = placementResult.data ?? [];
        setPlacements(currentPlacements);
        setAgreements((agreementResult.data ?? []).filter(agreement => agreement.termId === selectedTermId && !currentPlacements.some(placement => placement.agreementId === agreement.id)));
    }, []);

    useEffect(() => {
        if (!user?.departmentId) return;
        const departmentId = user.departmentId;
        Promise.all([
            apiClient.get<Term[]>(`/api/v1/terms/by-department/${departmentId}`),
            apiClient.get<Lecturer[]>('/api/v1/faculty/lecturers'),
        ]).then(async ([termResult, lecturerResult]) => {
            const foundTerms = termResult.data ?? [];
            setTerms(foundTerms);
            setLecturers(lecturerResult.data ?? []);
            if (foundTerms.length) { setTermId(foundTerms[0].id); await reloadTerm(foundTerms[0].id, departmentId); }
        }).catch(error => setMessage(error instanceof Error ? error.message : 'Không tải được dữ liệu phân công.'));
    }, [user?.departmentId, reloadTerm]);

    const changeTerm = async (id: string) => {
        setTermId(id);
        if (!user?.departmentId) return;
        try { await reloadTerm(id, user.departmentId); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Không tải được kỳ thực tập.'); }
    };

    const assign = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selected || !lecturerId || !user?.departmentId) return;
        setBusy(true);
        try {
            if (selected.kind === 'agreement') {
                await apiClient.post(`/api/v1/placements/activate?agreementId=${selected.id}&lecturerId=${lecturerId}`);
            } else {
                await apiClient.patch(`/api/v1/placements/${selected.id}/lecturer?lecturerId=${lecturerId}`);
            }
            setSelected(null);
            setMessage(`Đã lưu phân công GVHD cho ${selected.studentName}.`);
            await reloadTerm(termId, user.departmentId);
        } catch (error) { setMessage(error instanceof Error ? error.message : 'Không phân công được GVHD.'); }
        finally { setBusy(false); }
    };

    return <div className="max-w-5xl space-y-5"><div><h1 className="text-2xl font-bold">Phân công giảng viên hướng dẫn</h1><p className="text-sm text-slate-500">Kích hoạt thực tập từ thỏa thuận đã duyệt và điều chỉnh GVHD trong kỳ.</p></div>
        {message && <p role="alert" className="rounded bg-blue-50 p-3 text-sm">{message}</p>}
        <Select label="Kỳ thực tập" value={termId} onChange={event => void changeTerm(event.target.value)} options={terms.map(term => ({ value: term.id, label: `${term.code} · ${term.termName}` }))} />
        <h2 className="font-semibold">Thỏa thuận đã duyệt, chờ phân công</h2>
        {agreements.map(agreement => <Card key={agreement.id}><CardContent className="flex items-center justify-between gap-2 p-4"><span>{agreement.studentName} · {agreement.companyName}</span><Button size="sm" onClick={() => { setSelected({ kind: 'agreement', id: agreement.id, studentName: agreement.studentName }); setLecturerId(lecturers[0]?.id ?? ''); }}>Chọn GVHD và kích hoạt</Button></CardContent></Card>)}
        {!agreements.length && <p className="text-sm text-slate-500">Không có thỏa thuận đang chờ.</p>}
        <h2 className="font-semibold">Sinh viên đang thực tập</h2>
        {placements.map(placement => <Card key={placement.id}><CardContent className="flex items-center justify-between gap-2 p-4"><div><strong>{placement.studentName}</strong><p className="text-sm text-slate-500">{placement.companyName} · GVHD: {placement.lecturerName || 'Chưa có'}</p></div><Button variant="outline" size="sm" onClick={() => { setSelected({ kind: 'placement', id: placement.id, studentName: placement.studentName ?? 'sinh viên' }); setLecturerId(placement.lecturerId ?? lecturers[0]?.id ?? ''); }}>Đổi GVHD</Button></CardContent></Card>)}
        {!placements.length && <p className="text-sm text-slate-500">Chưa có sinh viên được kích hoạt.</p>}
        {selected && <Card><CardContent className="p-4"><form onSubmit={assign} className="space-y-3"><h2 className="font-semibold">Phân công cho {selected.studentName}</h2><Select label="Giảng viên thuộc khoa" value={lecturerId} onChange={event => setLecturerId(event.target.value)} options={lecturers.map(lecturer => ({ value: lecturer.id, label: lecturer.fullName }))} required /><div className="flex gap-2"><Button type="submit" isLoading={busy} disabled={!lecturers.length}>Lưu phân công</Button><Button type="button" variant="outline" onClick={() => setSelected(null)}>Hủy</Button></div></form></CardContent></Card>}
    </div>;
}

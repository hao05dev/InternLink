'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AiRunDetail } from '../types/admin-ai.types';
import { RUN_TYPES, RunStatus, formatDate } from './admin-ai-shared';

function JsonResult({ title, value }: { title: string; value: Record<string, unknown> | null }) {
    return (
        <details className="rounded-xl border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">{title}</summary>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                {value ? JSON.stringify(value, null, 2) : 'Chưa có dữ liệu.'}
            </pre>
        </details>
    );
}

function extractedSkills(output: Record<string, unknown> | null): string[] {
    const skills = output?.normalized_skills ?? output?.skills;
    if (!Array.isArray(skills)) return [];
    return Array.from(new Set(skills.flatMap((skill: unknown) => {
        if (!skill || typeof skill !== 'object') return [];
        const item = skill as Record<string, unknown>;
        const name = item.name ?? item.skill_name ?? item.skill_id ?? item.id;
        return typeof name === 'string' ? [name] : [];
    })));
}

export default function AdminAiRunDetail({ id, onClose, onRetried }: {
    id: string;
    onClose: () => void;
    onRetried: (detail: AiRunDetail) => void;
}) {
    const queryClient = useQueryClient();
    const [retryOpen, setRetryOpen] = useState(false);
    const [cvText, setCvText] = useState('');
    const detail = useQuery({
        queryKey: ['admin-ai', 'detail', id],
        queryFn: async ({ signal }) => (await apiClient.get<AiRunDetail>(`/api/v1/admin/ai/runs/${id}`, { signal })).data,
    });
    const retry = useMutation({
        mutationFn: async () => (await apiClient.post<AiRunDetail>(`/api/v1/admin/ai/runs/${id}/retry`, { cvText })).data,
        onSuccess: (result) => {
            queryClient.setQueryData(['admin-ai', 'detail', result.run.id], result);
            void queryClient.invalidateQueries({ queryKey: ['admin-ai'] });
            onRetried(result);
        },
    });
    const data = detail.data;
    const names = extractedSkills(data?.outputResult ?? null);

    return (
        <Modal isOpen onClose={() => { if (!retry.isPending) onClose(); }} maxWidth="2xl"
            title="Chi tiết lượt xử lý AI" description={id}>
            {detail.isPending && <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải chi tiết...</p>}
            {detail.error && <div role="alert" className="text-sm text-rose-700">{detail.error.message}</div>}
            {data && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="brand">{RUN_TYPES[data.run.runType]}</Badge>
                        <RunStatus status={data.run.status} />
                        {data.outputResult?.mode === 'rule_based' && <Badge variant="warning">Xử lý theo quy tắc</Badge>}
                    </div>
                    <dl className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                        <div><dt className="text-xs text-slate-500">Sinh viên</dt><dd className="mt-1 font-medium">{data.run.studentName || '—'}</dd><dd className="break-all text-xs text-slate-500">{data.run.studentEmail}</dd></div>
                        <div><dt className="text-xs text-slate-500">Mô hình</dt><dd className="mt-1 break-all">{data.run.modelName}</dd></div>
                        <div><dt className="text-xs text-slate-500">Bắt đầu</dt><dd className="mt-1">{formatDate(data.run.startedAt)}</dd></div>
                        <div><dt className="text-xs text-slate-500">Kết thúc</dt><dd className="mt-1">{formatDate(data.run.completedAt)}</dd></div>
                        {data.run.jobTitle && <div><dt className="text-xs text-slate-500">Vị trí tuyển dụng</dt><dd className="mt-1">{data.run.jobTitle}</dd></div>}
                        {data.run.sourceDocumentId && <div><dt className="text-xs text-slate-500">Tài liệu nguồn</dt><dd className="mt-1 break-all text-xs">{data.run.sourceDocumentId}</dd></div>}
                        {data.run.modelVersion && <div><dt className="text-xs text-slate-500">Phiên bản mô hình</dt><dd>{data.run.modelVersion}</dd></div>}
                        {data.run.taxonomyVersion && <div><dt className="text-xs text-slate-500">Phiên bản danh mục</dt><dd>{data.run.taxonomyVersion}</dd></div>}
                    </dl>
                    {data.run.status === 'FAILED' && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            {typeof data.errorDetail?.message === 'string' ? data.errorDetail.message : 'Lượt xử lý thất bại. Xem dữ liệu lỗi bên dưới để kiểm tra.'}
                        </div>
                    )}
                    {names.length > 0 && <div><p className="mb-2 text-sm font-semibold">Kỹ năng trích xuất ({names.length})</p><div className="flex flex-wrap gap-2">{names.map(name => <Badge key={name} variant="secondary">{name}</Badge>)}</div></div>}
                    {typeof data.inputSnapshot.retry_of === 'string' && <p className="break-all text-xs text-slate-500">Xử lý lại từ lượt: {data.inputSnapshot.retry_of}</p>}
                    {typeof data.inputSnapshot.retry_run_id === 'string' && <p className="break-all text-xs text-slate-500">Đã tạo lượt xử lý mới: {data.inputSnapshot.retry_run_id}</p>}
                    <JsonResult title="Thông tin đầu vào" value={data.inputSnapshot} />
                    <JsonResult title="Kết quả AI" value={data.outputResult} />
                    {data.errorDetail && <JsonResult title="Dữ liệu lỗi" value={data.errorDetail} />}
                    {data.run.canRetry && !retryOpen && <Button onClick={() => setRetryOpen(true)}>Xử lý lại CV</Button>}
                    {retryOpen && (
                        <form className="space-y-3 rounded-xl border border-sky-200 bg-sky-50 p-4" onSubmit={(event) => { event.preventDefault(); retry.mutate(); }}>
                            <p className="text-sm font-semibold text-sky-900">Xử lý lại CV của {data.run.studentName}</p>
                            <p className="text-xs leading-5 text-sky-800">Nhập lại nội dung CV nguồn vì lịch sử không lưu văn bản CV. Hệ thống tạo lượt xử lý mới; các kỹ năng mới cần sinh viên xác nhận. Kỹ năng đã xác nhận được giữ nguyên.</p>
                            <Textarea label="Nội dung CV nguồn" value={cvText} onChange={(event) => setCvText(event.target.value)}
                                rows={7} required maxLength={100000} disabled={retry.isPending} />
                            {retry.error && <p role="alert" className="text-sm text-rose-700">{retry.error.message}</p>}
                            <div className="flex gap-2">
                                <Button type="submit" isLoading={retry.isPending} disabled={!cvText.trim()}>Bắt đầu xử lý lại</Button>
                                <Button type="button" variant="outline" disabled={retry.isPending} onClick={() => { setRetryOpen(false); retry.reset(); }}>Hủy</Button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </Modal>
    );
}

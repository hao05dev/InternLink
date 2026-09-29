'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, BrainCircuit, CheckCircle2, Clock3, ListTree, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AiHealth, AiRunDetail, AiRunPage, AiRunStatus, AiRunType, AiStats, AiTaxonomy } from '../types/admin-ai.types';
import AdminAiRunDetail from './admin-ai-run-detail';
import { RUN_STATUSES, RUN_TYPES, RunStatus, formatDate } from './admin-ai-shared';

const selectClass = 'h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500';

function ServiceHealth() {
    const health = useQuery({
        queryKey: ['admin-ai', 'health'],
        queryFn: async ({ signal }) => (await apiClient.get<AiHealth>('/api/v1/admin/ai/health', { signal })).data,
    });
    const data = health.data;
    return (
        <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold"><Activity className="h-4 w-4 text-sky-700" />Trạng thái dịch vụ AI</h2>
                {health.isPending ? <span className="text-xs text-slate-500">Đang kiểm tra...</span>
                    : data && <Badge variant={data.available ? 'success' : 'destructive'}>{data.available ? 'Đang kết nối' : 'Không kết nối được'}</Badge>}
            </div>
            {health.error && <p role="alert" className="mt-3 text-sm text-rose-700">{health.error.message}</p>}
            {data && <div className="mt-3 space-y-2 text-xs text-slate-500">
                <p>{!data.available ? 'Kiểm tra dịch vụ AI và kết nối từ backend, sau đó làm mới trang.'
                    : data.geminiConfigured ? 'Gemini đã được cấu hình. Mỗi lượt xử lý có thể dùng phương án dự phòng khi mô hình gặp lỗi.'
                        : 'Chưa cấu hình Gemini. Trích xuất kỹ năng đang dùng phương pháp theo quy tắc.'}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                    {data.extractionModel && <span>Mô hình trích xuất: <strong className="text-slate-700">{data.extractionModel}</strong></span>}
                    {data.embeddingModel && <span>Mô hình embedding: <strong className="text-slate-700">{data.embeddingModel}</strong></span>}
                    <span>Kiểm tra lúc {formatDate(data.checkedAt)}</span>
                </div>
            </div>}
        </Card>
    );
}

function TaxonomyList() {
    const [search, setSearch] = useState('');
    const taxonomy = useQuery({
        queryKey: ['admin-ai', 'taxonomy'],
        queryFn: async ({ signal }) => (await apiClient.get<AiTaxonomy[]>('/api/v1/admin/ai/taxonomy', { signal })).data,
    });
    const term = search.trim().toLowerCase();
    const skills = (taxonomy.data ?? []).filter(skill => `${skill.id} ${skill.skillName} ${skill.category} ${skill.aliases.join(' ')}`.toLowerCase().includes(term));
    return (
        <Card className="overflow-hidden">
            <div className="space-y-3 border-b border-slate-200 p-5">
                <div><h2 className="text-base font-bold">Danh mục kỹ năng chuẩn</h2><p className="mt-1 text-xs text-slate-500">Tra cứu danh mục đang lưu trong hệ thống để đối chiếu kết quả AI và yêu cầu tuyển dụng.</p></div>
                <Input label="Tìm kỹ năng" placeholder="Tên kỹ năng, mã hoặc tên gọi khác" value={search} onChange={event => setSearch(event.target.value)} leftIcon={<Search className="h-4 w-4" />} />
            </div>
            {taxonomy.error && <p role="alert" className="p-5 text-sm text-rose-700">{taxonomy.error.message}</p>}
            {taxonomy.isPending ? <p role="status" className="p-10 text-center text-sm text-slate-500">Đang tải danh mục...</p>
                : !taxonomy.error && <div className="max-h-[640px] overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500"><tr>
                            <th className="p-4">Kỹ năng</th><th className="p-4">Tên gọi khác</th><th className="p-4">Nhóm / Phiên bản</th><th className="p-4">Trạng thái</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">{skills.map(skill => <tr key={skill.id} className="hover:bg-slate-50">
                            <td className="p-4"><p className="font-semibold text-slate-800">{skill.skillName}</p><p className="mt-1 text-xs text-slate-500">{skill.id}</p>{skill.description && <p className="mt-1 max-w-sm text-xs text-slate-500">{skill.description}</p>}</td>
                            <td className="p-4 text-xs text-slate-500">{skill.aliases.join(', ') || '—'}</td>
                            <td className="p-4 text-xs text-slate-500"><p>{skill.category}</p><p className="mt-1">{skill.framework} · {skill.taxonomyVersion}</p></td>
                            <td className="p-4"><Badge variant={skill.isActive ? 'success' : 'secondary'}>{skill.isActive ? 'Đang dùng' : 'Ngừng dùng'}</Badge></td>
                        </tr>)}</tbody>
                    </table>
                    {!skills.length && <p className="p-10 text-center text-sm text-slate-500">Không có kỹ năng phù hợp.</p>}
                </div>}
            {taxonomy.data && <p className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">{skills.length} / {taxonomy.data.length} kỹ năng</p>}
        </Card>
    );
}

export default function AdminAiView() {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<'runs' | 'taxonomy'>('runs');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState({ status: '' as AiRunStatus | '', type: '' as AiRunType | '', search: '', page: 0 });
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [notice, setNotice] = useState<{ failed: boolean; text: string } | null>(null);
    const stats = useQuery({
        queryKey: ['admin-ai', 'stats'],
        queryFn: async ({ signal }) => (await apiClient.get<AiStats>('/api/v1/admin/ai/stats', { signal })).data,
    });
    const runs = useQuery({
        queryKey: ['admin-ai', 'runs', filter],
        queryFn: async ({ signal }) => {
            const params = new URLSearchParams({ page: String(filter.page), size: '20' });
            if (filter.status) params.set('status', filter.status);
            if (filter.type) params.set('type', filter.type);
            if (filter.search) params.set('search', filter.search);
            return (await apiClient.get<AiRunPage>(`/api/v1/admin/ai/runs?${params}`, { signal })).data;
        },
        enabled: tab === 'runs',
    });
    const cards = [
        { title: 'Tổng lượt xử lý', value: stats.data?.total, icon: BrainCircuit, color: 'text-sky-700 bg-sky-50' },
        { title: 'Hoàn tất', value: stats.data?.completed, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
        { title: 'Cần xử lý lỗi', value: stats.data?.failed, icon: TriangleAlert, color: 'text-rose-700 bg-rose-50' },
        { title: 'Đang chạy / Chờ xử lý', value: stats.data ? stats.data.running + stats.data.pending : undefined, icon: Clock3, color: 'text-amber-700 bg-amber-50' },
    ];

    function handleRetried(detail: AiRunDetail) {
        setSelectedId(detail.run.id);
        setNotice({ failed: detail.run.status === 'FAILED', text: detail.run.status === 'FAILED'
            ? 'Dịch vụ AI vẫn gặp lỗi. Lượt thất bại mới đã được lưu để tiếp tục theo dõi.'
            : 'Đã xử lý lại CV. Kỹ năng mới đang chờ sinh viên xác nhận.' });
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-3"><div className="rounded-xl bg-sky-50 p-3 text-sky-700"><BrainCircuit className="h-6 w-6" /></div><div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Quản lý AI</h1>
                    <p className="mt-1 text-sm text-slate-500">Theo dõi xử lý CV, kết quả đối sánh và danh mục kỹ năng.</p>
                </div></div>
                <Button variant="outline" disabled={stats.isFetching || runs.isFetching} onClick={() => { void queryClient.invalidateQueries({ queryKey: ['admin-ai'] }); }}>
                    <RefreshCw className="mr-2 h-4 w-4" />Làm mới
                </Button>
            </div>
            {notice && <div role={notice.failed ? 'alert' : 'status'} className={`rounded-xl border p-4 text-sm ${notice.failed ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{notice.text}</div>}
            {stats.error && <p role="alert" className="text-sm text-rose-700">Không tải được thống kê: {stats.error.message}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <Card key={card.title} className="flex items-center gap-4 p-5">
                <div className={`rounded-xl p-3 ${card.color}`}><card.icon className="h-5 w-5" /></div>
                <div><p className="text-xs text-slate-500">{card.title}</p><p className="mt-1 text-2xl font-bold">{card.value ?? '—'}</p></div>
            </Card>)}</div>
            <ServiceHealth />
            <div className="flex gap-2" role="tablist" aria-label="Quản lý AI">
                <Button role="tab" aria-selected={tab === 'runs'} variant={tab === 'runs' ? 'default' : 'outline'} onClick={() => setTab('runs')}><Clock3 className="mr-2 h-4 w-4" />Lịch sử xử lý</Button>
                <Button role="tab" aria-selected={tab === 'taxonomy'} variant={tab === 'taxonomy' ? 'default' : 'outline'} onClick={() => setTab('taxonomy')}><ListTree className="mr-2 h-4 w-4" />Danh mục kỹ năng</Button>
            </div>
            {tab === 'taxonomy' ? <TaxonomyList /> : <Card className="overflow-hidden">
                <div className="space-y-4 border-b border-slate-200 p-5">
                    <div><h2 className="font-bold">Lịch sử xử lý AI</h2><p className="mt-1 text-xs text-slate-500">Thống kê tính trên các lượt đã được ghi nhận. Hiện hệ thống ghi lịch sử trích xuất CV; đối sánh chưa ghi lượt chạy.</p></div>
                    <form className="flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); setFilter(previous => ({ ...previous, search: search.trim(), page: 0 })); }}>
                        <div className="min-w-52 flex-1"><Input label="Tìm lượt xử lý" placeholder="Sinh viên, email, vị trí hoặc mô hình" value={search} maxLength={150} onChange={event => setSearch(event.target.value)} /></div>
                        <div className="space-y-1.5"><label htmlFor="ai-status" className="block text-xs font-semibold text-slate-700">Trạng thái</label><select id="ai-status" className={selectClass} value={filter.status} onChange={event => setFilter(previous => ({ ...previous, status: event.target.value as AiRunStatus | '', page: 0 }))}>
                            <option value="">Tất cả trạng thái</option>{Object.entries(RUN_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select></div>
                        <div className="space-y-1.5"><label htmlFor="ai-type" className="block text-xs font-semibold text-slate-700">Nghiệp vụ</label><select id="ai-type" className={selectClass} value={filter.type} onChange={event => setFilter(previous => ({ ...previous, type: event.target.value as AiRunType | '', page: 0 }))}>
                            <option value="">Tất cả nghiệp vụ</option>{Object.entries(RUN_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select></div>
                        <Button type="submit" variant="outline"><Search className="mr-2 h-4 w-4" />Tìm kiếm</Button>
                    </form>
                </div>
                {runs.error && <p role="alert" className="p-5 text-sm text-rose-700">Không tải được lịch sử: {runs.error.message}</p>}
                {runs.isPending ? <p role="status" className="p-10 text-center text-sm text-slate-500">Đang tải lịch sử...</p> : !runs.error && <>
                    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-4">Thời gian</th><th className="p-4">Nghiệp vụ / Mô hình</th><th className="p-4">Sinh viên / Vị trí</th><th className="p-4">Trạng thái</th><th className="p-4">Thao tác</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">{runs.data?.content.map(run => <tr key={run.id} className="hover:bg-slate-50">
                            <td className="whitespace-nowrap p-4 text-xs text-slate-500">{formatDate(run.createdAt)}</td>
                            <td className="p-4"><p className="font-semibold">{RUN_TYPES[run.runType]}</p><p className="mt-1 text-xs text-slate-500">{run.modelName}</p></td>
                            <td className="p-4"><p className="font-medium">{run.studentName || '—'}</p><p className="mt-1 text-xs text-slate-500">{run.studentEmail}</p>{run.jobTitle && <p className="mt-1 text-xs text-slate-500">{run.jobTitle}</p>}</td>
                            <td className="p-4"><RunStatus status={run.status} /></td>
                            <td className="p-4"><Button size="sm" variant="outline" aria-label={`Xem chi tiết lượt ${run.id}`} onClick={() => setSelectedId(run.id)}>Chi tiết{run.canRetry && ' / Xử lý lỗi'}</Button></td>
                        </tr>)}</tbody>
                    </table></div>
                    {!runs.data?.content.length && <div className="p-12 text-center"><BrainCircuit className="mx-auto mb-3 h-9 w-9 text-slate-300" /><p className="text-sm font-medium text-slate-600">Chưa có lượt xử lý phù hợp.</p><p className="mt-1 text-xs text-slate-500">Lượt trích xuất CV sẽ xuất hiện sau khi được ghi nhận trong hệ thống.</p></div>}
                    {runs.data && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
                        <p className="text-xs text-slate-500">{runs.data.totalElements} lượt · Trang {runs.data.totalPages ? filter.page + 1 : 0} / {runs.data.totalPages}</p>
                        <div className="flex gap-2"><Button size="sm" variant="outline" disabled={filter.page === 0 || runs.isFetching} onClick={() => setFilter(previous => ({ ...previous, page: previous.page - 1 }))}>Trước</Button><Button size="sm" variant="outline" disabled={filter.page + 1 >= runs.data.totalPages || runs.isFetching} onClick={() => setFilter(previous => ({ ...previous, page: previous.page + 1 }))}>Sau</Button></div>
                    </div>}
                </>}
            </Card>}
            {selectedId && <AdminAiRunDetail key={selectedId} id={selectedId} onClose={() => setSelectedId(null)} onRetried={handleRetried} />}
        </div>
    );
}

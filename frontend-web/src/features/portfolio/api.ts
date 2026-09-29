import { ApiError, apiClient } from '@/lib/api-client';
import type { FormContent, FormKind, FormView, Journal, JournalInput, Overview, PlacementMeta } from './types';
const base = (id: string) => `/api/v1/portfolio/${encodeURIComponent(id)}`;
export const portfolioApi = {
  placements: () => apiClient.get<PlacementMeta[]>('/api/v1/portfolio'),
  overview: (id: string) => apiClient.get<Overview>(base(id)),
  days: (id: string) => apiClient.get<Journal[]>(`${base(id)}/days`),
  saveDay: (id: string, date: string, body: JournalInput, version: number | null, submit = false) =>
    apiClient.put<Journal>(`${base(id)}/days/${date}`, { ...body, version, submit }),
  reviewDay: (id: string, date: string, decision: string, note: string, version: number) =>
    apiClient.post<Journal>(`${base(id)}/days/${date}/review`, { decision, note, version }),
  submitWeek: (id: string, week: number) => apiClient.post(`${base(id)}/weeks/${week}/submit`),
  saveForm: (id: string, kind: FormKind, content: FormContent, version: number | null) =>
    apiClient.put<FormView>(`${base(id)}/forms/${kind}`, { content, version }),
  action: (id: string, kind: FormKind, action: string, version: number, note: string) =>
    apiClient.post<FormView>(`${base(id)}/forms/${kind}/actions`, { action, version, note }),
  uploadSigned: (id: string, kind: FormKind, file: File, revisionId?: string) => {
    const body = new FormData(); body.append('file', file);
    return apiClient.upload(`${base(id)}/forms/${kind}/signed${revisionId ? `?revisionId=${revisionId}` : ''}`, body);
  },
  exportUrl: (id: string, kind: FormKind, revisionId?: string) => `${base(id)}/forms/${kind}/docx${revisionId ? `?revisionId=${revisionId}` : ''}`,
  signedUrl: (id: string, kind: FormKind, fileId: string) => `${base(id)}/forms/${kind}/signed/${fileId}`,
};
export async function downloadFile(url: string, name: string) {
  const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.message || 'Không tải được tài liệu', response.status);
  }
  const blob = await response.blob(); const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = objectUrl; anchor.download = name;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
export function errorText(error: unknown) { return error instanceof Error ? error.message : 'Thao tác chưa thành công. Vui lòng thử lại.'; }

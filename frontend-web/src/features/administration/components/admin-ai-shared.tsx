import { Badge } from '@/components/ui/badge';
import { AiRunStatus, AiRunType } from '../types/admin-ai.types';

export const RUN_TYPES: Record<AiRunType, string> = {
    CV_EXTRACTION: 'Trích xuất CV', JOB_EXTRACTION: 'Trích xuất tin tuyển dụng',
    EMBEDDING: 'Tạo embedding', MATCHING: 'Đối sánh năng lực',
};
export const RUN_STATUSES: Record<AiRunStatus, string> = {
    PENDING: 'Chờ xử lý', RUNNING: 'Đang xử lý', COMPLETED: 'Hoàn tất', FAILED: 'Thất bại',
};

export function RunStatus({ status }: { status: AiRunStatus }) {
    return <Badge variant={status === 'COMPLETED' ? 'success' : status === 'FAILED' ? 'destructive' : 'warning'}>{RUN_STATUSES[status]}</Badge>;
}

export function formatDate(value: string | null) {
    return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

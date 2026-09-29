export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiFieldError {
    field: string;
    message: string;
}

export interface ApiResponse<T> {
    success: boolean;
    code?: number;
    message?: string;
    data: T;
    meta?: PaginationMeta;
    errors?: ApiFieldError[];
    timestamp?: string;
}
import { ApiResponse } from "@/types/api";

export class ApiError extends Error {
    status: number;
    errors?: Array<{ field: string; message: string }>;
    constructor(message: string, status: number, errors?: Array<{ field: string; message: string }>) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const config: RequestInit = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...options.headers,
        },
        credentials: "include",
    };
    const response = await fetch(endpoint, config);
    const data: ApiResponse<T> = await response.json();
    if (!response.ok) {
        throw new ApiError(data.message || "An error occurred", response.status, data.errors);
    }
    return data;
}
export const apiClient = {
    get: <T>(endpoint: string, options: RequestInit = {}) => request<T>(endpoint, { ...options, method: "GET" }),
    post: <T>(endpoint: string, body: any, options: RequestInit = {}) => request<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
    put: <T>(endpoint: string, body: any, options: RequestInit = {}) => request<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(endpoint: string, body: any, options: RequestInit = {}) => request<T>(endpoint, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(endpoint: string, options: RequestInit = {}) => request<T>(endpoint, { ...options, method: "DELETE" }),
};

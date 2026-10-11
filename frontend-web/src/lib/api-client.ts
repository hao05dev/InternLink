import { ApiResponse } from "@/lib/api.types";

export class ApiError extends Error {
    status: number;
    errors?: Array<{ field: string; message: string }>;
    retryAfter?: number;

    constructor(
        message: string,
        status: number,
        errors?: Array<{ field: string; message: string }>,
        retryAfter?: number
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
        this.retryAfter = retryAfter;
    }
}

/**
 * Trích xuất giá trị cookie theo tên từ document.cookie
 */
function getCookie(name: string): string | null {
    if (typeof document === "undefined") {
        return null;
    }
    const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
    return match ? decodeURIComponent(match[3]) : null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const defaultHeaders: Record<string, string> = {
        "Accept": "application/json",
    };
    if (!isFormData) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    // Tự động đính kèm CSRF Token cho các phương thức mutating (POST, PUT, PATCH, DELETE)
    const method = (options.method || "GET").toUpperCase();
    const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
    if (mutatingMethods.includes(method)) {
        const xsrfToken = getCookie("XSRF-TOKEN");
        if (xsrfToken) {
            defaultHeaders["X-XSRF-TOKEN"] = xsrfToken;
        }
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: "include",
    };
    const response = await fetch(endpoint, config);

    if (response.status === 204) {
        return { success: true, data: undefined as unknown as T };
    }

    const data: ApiResponse<T> = (typeof response.json === "function"
        ? await response.json().catch(() => null)
        : null) ?? ({} as ApiResponse<T>);

    if (!response.ok) {
        let retryAfter: number | undefined;
        const retryHeader = response.headers?.get?.("Retry-After");
        if (retryHeader) {
            retryAfter = parseInt(retryHeader, 10);
        }

        const message = data.message || response.statusText || `Request failed with status ${response.status}`;
        throw new ApiError(message, response.status, data.errors, retryAfter);
    }
    return data;
}

export const apiClient = {
    get: <T>(endpoint: string, options: RequestInit = {}) =>
        request<T>(endpoint, { ...options, method: "GET" }),
    post: <T>(endpoint: string, body?: any, options: RequestInit = {}) =>
        request<T>(endpoint, { ...options, method: "POST", body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined }),
    put: <T>(endpoint: string, body?: any, options: RequestInit = {}) =>
        request<T>(endpoint, { ...options, method: "PUT", body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined }),
    patch: <T>(endpoint: string, body?: any, options: RequestInit = {}) =>
        request<T>(endpoint, { ...options, method: "PATCH", body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined }),
    delete: <T>(endpoint: string, options: RequestInit = {}) =>
        request<T>(endpoint, { ...options, method: "DELETE" }),
    upload: <T>(endpoint: string, formData: FormData, options: RequestInit = {}) =>
        request<T>(endpoint, { ...options, method: "POST", body: formData }),
};

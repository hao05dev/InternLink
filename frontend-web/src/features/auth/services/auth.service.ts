import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api.types";
import type { AuthResponse, UserSummary, LoginCredentials } from "@/features/auth/types/auth.types";
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: ApiResponse<AuthResponse> = await apiClient.post("/api/v1/auth/login", credentials);
    return response.data;
}
export const logout = async (): Promise<void> => {
    await apiClient.post("/api/v1/auth/logout", {});
}

export const getCurrentUser = async (): Promise<UserSummary> => {
    const response: ApiResponse<UserSummary> = await apiClient.get("/api/v1/auth/me");
    return response.data;
}

export const getSessionUser = async (): Promise<UserSummary | null> => {
    try {
        const response: ApiResponse<UserSummary | null> = await apiClient.get("/api/v1/auth/session");
        return response.data ?? null;
    } catch (error) {
        const missingSessionEndpoint = error instanceof ApiError && (
            error.status === 401 ||
            error.status === 404 ||
            (error.status === 500 && error.message.includes("No static resource api/v1/auth/session"))
        );
        if (!missingSessionEndpoint) {
            throw error;
        }
        // An older backend may not have /session yet. Preserve existing cookies until it restarts.
        try {
            return await getCurrentUser();
        } catch (legacyError) {
            if (legacyError instanceof ApiError && legacyError.status === 401) return null;
            throw legacyError;
        }
    }
}

export const authService = {
    login, logout, getCurrentUser, getSessionUser,
}

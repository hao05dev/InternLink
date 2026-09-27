import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { AuthResponse, UserSummary } from "@/types/auth";

export interface LoginCredentials {
    email: string;
    password: string;
}
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

export const authService = {
    login, logout, getCurrentUser,
}
"use client";

import { createContext } from "react";
import type { UserSummary, AuthResponse, LoginCredentials } from "@/features/auth/types/auth.types";

export interface AuthContextType {
    user: UserSummary | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


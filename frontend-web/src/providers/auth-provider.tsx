'use client';

import { authService, getCurrentUser, getSessionUser } from "@/features/auth/services/auth.service";
import type { UserSummary, AuthResponse, LoginCredentials } from "@/features/auth/types/auth.types";
import { useEffect, useState } from "react";

import { AuthContext } from "@/features/auth/context/auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserSummary | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchUser = async () => {
        try {
            const currentUser = await getSessionUser();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const authData = await authService.login(credentials);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        return authData;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };
    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}


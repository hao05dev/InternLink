'use client';

import { authService, getCurrentUser, LoginCredentials } from "@/services/auth.service";
import { UserSummary, AuthResponse } from "@/types/auth";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: UserSummary | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserSummary | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchUser = async () => {
        try {
            const currentUser = await getCurrentUser();
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
        await fetchUser();
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
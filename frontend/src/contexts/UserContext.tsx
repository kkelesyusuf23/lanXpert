"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Plan {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
}

interface User {
    id: string;
    username: string;
    email: string;
    plan_id?: string;
    plan?: Plan;
    roles?: any[];
    native_language_id?: string;
    target_language_id?: string;
    email_verified?: boolean;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/users/me");
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            // Optionally redirect here or let protected routes handle it
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, isLoading, refreshUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}

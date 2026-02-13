"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Loader2 } from "lucide-react";
import { UserProvider, useUser } from "@/contexts/UserContext";

function DashboardAuthCheck({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        } else if (!isLoading && user) {
            if (!user.native_language_id || !user.target_language_id) {
                router.push("/onboarding");
            } else if (!user.email_verified) {
                router.push("/verify-email");
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!user) return null; // Will redirect

    return (
        <div className="flex h-screen bg-black text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/95">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <DashboardAuthCheck>
                {children}
            </DashboardAuthCheck>
        </UserProvider>
    );
}

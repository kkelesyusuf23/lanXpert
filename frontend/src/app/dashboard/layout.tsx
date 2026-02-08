
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const res = await api.get("/users/me");
                const user = res.data;
                if (!user.native_language_id || !user.target_language_id) {
                    router.push("/onboarding");
                    return;
                }

                if (!user.email_verified) {
                    router.push("/verify-email");
                    return;
                }
            } catch (error) {
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };
        checkProfile();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/95">
                    {children}
                </main>
            </div>
        </div>
    );
}

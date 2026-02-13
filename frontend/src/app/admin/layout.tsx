"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get("/users/me");
                const roles = res.data.roles?.map((r: any) => (r.role as any)?.name || r.name) || [];

                const isAdmin = roles.includes("admin");
                const isModerator = roles.includes("moderator");

                if (!isAdmin && !isModerator) {
                    router.push("/dashboard"); // Redirect unauthorized users
                    return;
                }

                // Page-specific restrictions for Moderators
                if (!isAdmin && (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/settings"))) {
                    router.push("/admin"); // Redirect moderators from restricted pages
                    return;
                }

                setIsAuthorized(true);
            } catch (error) {
                console.error("Auth check failed", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [pathname, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="flex bg-zinc-950 min-h-screen text-white font-sans selection:bg-red-500/30">
            <AdminSidebar />
            <main className="flex-1 md:ml-64 p-8 overflow-x-hidden">
                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    MessageCircle,
    FileText,
    Settings,
    LogOut,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const menuItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users, role: "admin" }, // Restricted to admin
    { name: "Vocabulary", href: "/admin/words", icon: BookOpen },
    { name: "Questions", href: "/admin/questions", icon: MessageCircle },
    { name: "Articles", href: "/admin/articles", icon: FileText },
    { name: "Database", href: "/admin/database", icon: Shield, role: "admin" },
    { name: "Settings", href: "/admin/settings", icon: Settings, role: "admin" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/users/me");
                // Extract roles from complex object or simple list
                // UserOut schema has roles: List[UserRoleOut] -> role: RoleOut -> name
                const roles = res.data.roles?.map((r: any) => r.role?.name || r.name) || [];
                setUserRoles(roles);
            } catch (error) {
                console.error("Failed to fetch user roles", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const isAdmin = userRoles.includes("admin");

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-red-900/20 bg-black/90 backdrop-blur-xl h-full fixed left-0 top-0">
            <div className="p-6 border-b border-red-900/20">
                <Link href="/admin" className="flex items-center space-x-2">
                    <Shield className="w-8 h-8 text-red-500" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent">
                        Admin Panel
                    </span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    // Hide if item requires admin role and user is not admin
                    if (item.role === "admin" && !isAdmin && !loading) return null;

                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-red-900/20 text-red-400 border border-red-500/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full" />
                            )}
                            <Icon className={cn("w-5 h-5", isActive ? "text-red-400" : "text-gray-500 group-hover:text-white")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-red-900/20">
                <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 mb-2 w-full rounded-lg text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">User Dashboard</span>
                </Link>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    }}
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Target,
    PenTool,
    Users,
    Settings,
    LogOut,
    Bookmark,
    MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vocabulary", href: "/dashboard/vocabulary", icon: BookOpen },
    { name: "Q&A", href: "/dashboard/questions", icon: Users },
    { name: "Articles", href: "/dashboard/articles", icon: PenTool },
    { name: "Messages", href: "/dashboard/chat", icon: MessageSquare }, // Added Messages
    { name: "Goals", href: "/dashboard/goals", icon: Target },
    { name: "Saved", href: "/dashboard/saved", icon: Bookmark },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
    const { user } = useUser();
    const pathname = usePathname();

    const planName = user?.plan?.name?.toLowerCase() || "free";
    const isPro = planName === "pro";
    const isEnterprise = planName === "enterprise";

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl h-full">
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center space-x-2">
                    <span className={cn(
                        "text-2xl font-bold bg-clip-text text-transparent transition-all duration-300",
                        isEnterprise ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse" :
                            isPro ? "bg-gradient-to-r from-yellow-200 to-yellow-500" :
                                "bg-gradient-to-r from-blue-400 to-purple-600"
                    )}>
                        LanXpert
                        {(isPro || isEnterprise) && <sup className="text-[10px] ml-1 text-white opacity-50">PRO</sup>}
                    </span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-purple-400" : "text-gray-500 group-hover:text-white")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto">
                {!isEnterprise && (
                    <div className={cn(
                        "rounded-xl p-4 border border-white/10 relative overflow-hidden group",
                        isPro ? "bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/20" : "bg-gradient-to-br from-blue-900/50 to-purple-900/50"
                    )}>
                        {isPro && <div className="absolute inset-0 bg-yellow-500/5 blur-xl group-hover:bg-yellow-500/10 transition-all duration-500" />}

                        <h3 className={cn("font-semibold mb-1 relative z-10", isPro ? "text-yellow-200" : "text-white")}>
                            {isPro ? "Upgrade to Enterprise" : "Upgrade to Pro"}
                        </h3>
                        <p className="text-xs text-gray-300 mb-3 relative z-10">
                            {isPro ? "Get unlimited everything and priority support." : "Unlock all features and advanced analytics."}
                        </p>
                        <Link href="/pricing">
                            <Button size="sm" className={cn(
                                "w-full font-semibold border-0 relative z-10 transition-all",
                                isPro ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-white text-black hover:bg-gray-200"
                            )}>
                                Upgrade
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/10">
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

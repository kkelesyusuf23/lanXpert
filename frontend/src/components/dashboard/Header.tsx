
import { Bell, Search, User, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

export default function Header() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const planName = user?.plan?.name?.toLowerCase() || "free";
    const isPro = planName === "pro";
    const isEnterprise = planName === "enterprise";

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const markAllRead = async () => {
        try {
            await api.post("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error(e);
        }
    };

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur flex items-center justify-between px-8 relative z-50">
            {/* Search Bar */}
            <div className="relative w-96 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                    placeholder="Search words, questions, articles..."
                    className="pl-10 bg-white/5 border-white/10 focus:border-purple-500 text-white placeholder:text-gray-600"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
                <div className="relative" ref={notificationRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-white/10 relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </Button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-white/10 rounded-md shadow-xl overflow-hidden flex flex-col max-h-[400px]">
                            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                                <span className="font-semibold text-sm">Notifications</span>
                                {unreadCount > 0 && (
                                    <Button variant="ghost" size="sm" onClick={markAllRead} className="h-auto p-1 text-xs text-purple-400 hover:text-purple-300">
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                            <div className="overflow-y-auto flex-1">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-3 border-b border-white/5 text-sm hover:bg-white/5 transition-colors cursor-pointer ${!n.is_read ? 'bg-purple-500/5' : ''}`}
                                            onClick={(e) => !n.is_read && markRead(n.id, e)}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1">
                                                    <p className={`font-medium ${!n.is_read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                                                    <p className="text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                                    <p className="text-xs text-gray-600 mt-2">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                                                </div>
                                                {!n.is_read && (
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <p className={cn("text-sm font-medium", isEnterprise ? "text-yellow-400" : "text-white")}>
                            {user.username}
                        </p>
                        <Link href="/pricing" className={cn(
                            "text-xs font-medium transition-colors",
                            isEnterprise ? "text-yellow-500/80" :
                                isPro ? "text-yellow-300" :
                                    "text-purple-400 hover:text-purple-300"
                        )}>
                            {isEnterprise ? "Enterprise" : isPro ? "Pro Member" : "Free Plan • Upgrade"}
                        </Link>
                    </div>
                    <Avatar className={cn(
                        "h-9 w-9 border-2 transition-all duration-300",
                        isEnterprise ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                            isPro ? "border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" :
                                "border-white/10"
                    )}>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
    Users,
    BookOpen,
    FileText,
    MessageCircle,
    Activity,
    ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/dashboard-stats");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to load admin stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: "Total Users", value: stats?.users || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Vocabulary", value: stats?.words || 0, icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
        { title: "Questions", value: stats?.questions || 0, icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
        { title: "Articles", value: stats?.articles || 0, icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                    Admin Dashboard
                </h1>
                <p className="text-gray-400 mt-2">System Overview and Management Control Center</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Card key={idx} className="bg-zinc-900/50 border-white/10 hover:border-red-500/30 transition-all">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-400">
                                        {card.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${card.bg}`}>
                                        <Icon className={`w-4 h-4 ${card.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{card.value}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        <Activity className="w-3 h-3 inline mr-1" />
                                        Active in system
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Recent Activity or Quick Actions could go here */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-8 text-center text-gray-500">
                <p>Select a module from the sidebar to manage content.</p>
            </div>
        </div>
    );
}

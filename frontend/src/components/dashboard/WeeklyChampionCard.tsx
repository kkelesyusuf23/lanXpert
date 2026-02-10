"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Flame } from "lucide-react";
import api from "@/lib/api";

export default function WeeklyChampionCard() {
    const [champion, setChampion] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/features/weekly-champion");
                setChampion(res.data);
            } catch (error) {
                console.error("Failed to fetch weekly champion", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-white/10 h-full flex items-center justify-center min-h-[150px]">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <Crown className="w-16 h-16 text-yellow-500" />
                </div>
            </Card>
        );
    }

    if (!champion) {
        return (
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-white/10 relative h-full">
                <CardHeader className="py-2">
                    <CardTitle className="text-yellow-400 font-bold text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Weekly Champion
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-400 text-sm">No activity this week yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-yellow-950/20 to-orange-900/20 border-yellow-500/20 shadow-lg shadow-yellow-500/5 relative overflow-hidden group hover:border-yellow-500/40 transition-colors h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown className="w-24 h-24 text-yellow-500" />
            </div>

            <CardHeader className="relative z-10 pb-2 flex-grow-0">
                <div className="flex justify-between items-start">
                    <div className="text-yellow-400 font-bold text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Weekly MVP
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 p-[2px] shadow-lg shadow-yellow-500/20 relative">
                        {/* Crown icon positioned above avatar */}
                        <div className="absolute -top-3 -right-2 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded-full border-2 border-yellow-900 font-bold flex items-center gap-0.5 shadow-sm">
                            <Crown className="w-3 h-3" /> #1
                        </div>
                        <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-black">
                            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                                {champion.user?.username?.[0]?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white leading-tight">
                            {champion.user?.username}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20 px-2 py-0 text-[10px] h-5">
                                <Flame className="w-3 h-3 mr-1" />
                                {champion.score} XP
                            </Badge>
                            <span className="text-xs text-gray-500">
                                {champion.accepted_count} helpful answers
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

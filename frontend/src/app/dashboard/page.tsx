"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, PenTool, Target, CheckCircle2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import DailySentenceCard from "@/components/dashboard/DailySentenceCard";
import WeeklyChampionCard from "@/components/dashboard/WeeklyChampionCard";

export default function DashboardOverview() {
    const [stats, setStats] = useState<any | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    api.get("/stats/overview"),
                    api.get("/stats/activity")
                ]);
                setStats(statsRes.data);
                setActivities(activityRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center p-20"><div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div></div>;
    }

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Vocabulary</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.total_vocabulary || 0}</div>
                        <p className="text-xs text-green-400 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +{stats?.vocab_this_week || 0} this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Questions Asked</CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.total_questions || 0}</div>
                        <p className="text-xs text-green-400 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +{stats?.questions_this_week || 0} this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-orange-500/50 transition-all group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Articles Read</CardTitle>
                        <PenTool className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.total_articles || 0}</div>
                        <p className="text-xs text-gray-500 mt-1">12 mins avg time</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-purple-200">Current Streak</CardTitle>
                        <Target className="h-4 w-4 text-purple-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats?.current_streak || 0} Days</div>
                        <p className="text-xs text-purple-300 mt-1">Keep it up!</p>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DailySentenceCard />
                </div>
                <div className="lg:col-span-1">
                    <WeeklyChampionCard />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
                        <CardDescription>Your latest learning milestones.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {activities.length === 0 ? (
                                <div className="text-gray-500 text-sm">No recent activity. Start learning!</div>
                            ) : (
                                activities.map((activity: any, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center border mr-4 ${activity.type === 'question' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                            activity.type === 'article' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                                'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                            }`}>
                                            {activity.type === 'question' ? <MessageSquare className="h-5 w-5" /> :
                                                activity.type === 'article' ? <PenTool className="h-5 w-5" /> :
                                                    <CheckCircle2 className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none text-white">
                                                {activity.type === 'question' ? 'Asked: ' :
                                                    activity.type === 'article' ? 'Published: ' : 'Learned: '}
                                                {activity.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-purple-400">+{activity.xp} XP</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Card */}
                <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Level Progression</CardTitle>
                        <CardDescription>
                            {stats?.level || "Beginner"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Overall Progress</span>
                                <span className="text-purple-400">{stats?.level_progress || 0}%</span>
                            </div>
                            <Progress value={stats?.level_progress || 0} className="h-2 bg-white/5" indicatorClassName="bg-purple-600" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-white/5 p-4 text-center border border-white/5">
                                <div className="text-2xl font-bold text-white mb-1">{stats?.xp || 0}</div>
                                <div className="text-xs text-gray-500">Current XP</div>
                            </div>
                            <div className="rounded-lg bg-white/5 p-4 text-center border border-white/5">
                                <div className="text-2xl font-bold text-white mb-1">{stats?.next_level_goal || 100}</div>
                                <div className="text-xs text-gray-500">Next Goal</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

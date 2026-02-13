"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Flame, CheckCircle2, MessageSquare, BookOpen, PenTool } from "lucide-react";
import api from "@/lib/api";

export default function GoalsPage() {
    const [goals, setGoals] = useState<any | null>(null);
    const [stats, setStats] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [goalsRes, statsRes] = await Promise.all([
                    api.get("/stats/daily"),
                    api.get("/stats/overview")
                ]);
                setGoals(goalsRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Failed to fetch goals", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center p-20"><div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div></div>;
    }

    // Calculate percentages
    const wordProgress = goals ? Math.min((goals.words.current / goals.words.target) * 100, 100) : 0;
    const questionProgress = goals ? Math.min((goals.questions.current / goals.questions.target) * 100, 100) : 0;
    const articleProgress = goals ? Math.min((goals.articles.current / goals.articles.target) * 100, 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Target className="w-8 h-8 text-purple-500" />
                    My Learning Goals
                </h1>
                <p className="text-gray-400 mt-1">Set daily targets and track your consistency.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Progress */}
                <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl text-white">Daily Progress</CardTitle>
                        <Button variant="ghost" size="sm" className="text-purple-400 hover:text-white">
                            <PenTool className="w-4 h-4 mr-2" /> Edit Goals
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Word Goal */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center text-gray-300">
                                    <CheckCircle2 className={`w-4 h-4 mr-2 ${wordProgress >= 100 ? 'text-green-500' : 'text-gray-500'}`} />
                                    Learn {goals?.words.target} New Words
                                </span>
                                <span className="text-gray-400">{goals?.words.current} / {goals?.words.target} ({Math.round(wordProgress)}%)</span>
                            </div>
                            <Progress value={wordProgress} className="h-2 bg-white/5" indicatorClassName="bg-blue-500" />
                        </div>

                        {/* Question Goal */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center text-gray-300">
                                    <MessageSquare className={`w-4 h-4 mr-2 ${questionProgress >= 100 ? 'text-green-500' : 'text-gray-500'}`} />
                                    Ask {goals?.questions.target} Questions
                                </span>
                                <span className="text-gray-400">{goals?.questions.current} / {goals?.questions.target} ({Math.round(questionProgress)}%)</span>
                            </div>
                            <Progress value={questionProgress} className="h-2 bg-white/5" indicatorClassName="bg-purple-500" />
                        </div>

                        {/* Article Goal */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center text-gray-300">
                                    <BookOpen className={`w-4 h-4 mr-2 ${articleProgress >= 100 ? 'text-green-500' : 'text-gray-500'}`} />
                                    Read {goals?.articles.target} Article
                                </span>
                                <span className="text-gray-400">{goals?.articles.current} / {goals?.articles.target} ({Math.round(articleProgress)}%)</span>
                            </div>
                            <Progress value={articleProgress} className="h-2 bg-white/5" indicatorClassName="bg-orange-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Streak Card */}
                <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-500/20">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <Flame className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">{stats?.current_streak || 0} Day Streak!</h2>
                            <p className="text-orange-200 text-sm mt-1">You&apos;re on fire! Keep it up properly.</p>
                        </div>
                        <div className="pt-4">
                            <div className="text-4xl font-black text-orange-500">{stats?.current_streak || 0}</div>
                            <div className="text-xs text-orange-400 uppercase tracking-widest mt-1">DAYS</div>
                        </div>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0 mt-4">
                            Share Achievement
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

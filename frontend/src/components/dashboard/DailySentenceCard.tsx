"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ThumbsUp, Star, Loader2, Quote } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function DailySentenceCard() {
    const [sentence, setSentence] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDaily = async () => {
            try {
                const res = await api.get("/features/daily-sentence");
                setSentence(res.data);
            } catch (error) {
                console.error("Failed to fetch daily sentence", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDaily();
    }, []);

    if (isLoading) {
        return (
            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 h-full flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </Card>
        );
    }

    if (!sentence) {
        return (
            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-300">
                        <Quote className="h-5 w-5" />
                        Daily Phrase
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-400 text-sm">No featured phrase for today yet. Check back later!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/20 h-full relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-24 w-24 text-indigo-100" />
            </div>

            <CardHeader className="relative z-10 pb-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 mb-2">
                        Phrase of the Day
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-indigo-300/70 bg-black/20 px-2 py-1 rounded-full">
                        <ThumbsUp className="h-3 w-3" /> {sentence.helpful_count || 0}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
                <div className="space-y-2">
                    {/* Display actual sentence if available in future schema, using answer_text for now */}
                    <p className="text-lg md:text-xl font-medium text-white italic leading-relaxed">
                        "{sentence.answer_text}"
                    </p>
                    {/* Assuming we might fetch question text too, but schema currently only returns answer */}
                    {sentence.context_tags && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {sentence.context_tags.split(',').map((tag: string, i: number) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/5 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {sentence.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span>by {sentence.user?.username || 'Unknown'}</span>
                    </div>
                    <Link href={`/dashboard/questions`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        View Context &rarr;
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

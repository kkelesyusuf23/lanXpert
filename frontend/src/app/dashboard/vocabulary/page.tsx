"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Book, Volume2, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";



export default function VocabularyPage() {
    const [currentWord, setCurrentWord] = useState<any | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [limitReached, setLimitReached] = useState(false);

    const [todayWords, setTodayWords] = useState<any[]>([]);



    const fetchTodayWords = async () => {
        try {
            const res = await api.get("/words/learned/today");
            setTodayWords(res.data);
        } catch (error) {
            console.error("Failed to fetch today words", error);
        }
    };

    const fetchRandomWord = useCallback(async (forceNew = false) => {
        setIsLoading(true);
        setIsRevealed(false);
        setError("");
        setLimitReached(false);

        if (!forceNew) {
            const savedWord = localStorage.getItem("currentWord");
            if (savedWord) {
                try {
                    const parsed = JSON.parse(savedWord);
                    setCurrentWord(parsed);
                    setIsLoading(false);
                    fetchTodayWords();
                    return;
                } catch {
                    localStorage.removeItem("currentWord");
                }
            }
        }

        try {
            const response = await api.get("/words/random");
            setCurrentWord(response.data);
            localStorage.setItem("currentWord", JSON.stringify(response.data));
            fetchTodayWords();
        } catch (err) {
            const fetchErr = err as { response?: { status?: number } };
            if (fetchErr.response?.status === 403) {
                setLimitReached(true);
            } else if (fetchErr.response?.status === 404) {
                setError("No words found for your target language yet.");
            } else {
                setError("Failed to fetch new word.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial load: don't force new, try storage
        fetchRandomWord(false);
        fetchTodayWords();
    }, [fetchRandomWord]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 relative">

            <div className="absolute top-0 right-0">
                {/* Admin button removed - moved to dedicated Admin Panel */}
            </div>

            {isLoading ? (
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-64 w-96 bg-white/5 rounded-xl mb-4"></div>
                    <div className="h-10 w-32 bg-white/5 rounded"></div>
                </div>
            ) : limitReached ? (
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-10 h-10 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Daily Limit Reached</h2>
                    <p className="text-gray-400 max-w-md">You&apos;ve reached your 5 free words for today. Upgrade to LanXpert Pro for unlimited learning.</p>
                    <Link href="/pricing">
                        <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">Upgrade Now</Button>
                    </Link>
                </div>
            ) : error ? (
                <div className="text-center text-red-400">{error}</div>
            ) : currentWord ? (
                <div className="flex flex-col items-center gap-8 w-full max-w-lg">
                    <Card
                        className="w-full bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden cursor-pointer group transition-all duration-300 hover:border-purple-500/30"
                        onClick={() => setIsRevealed(!isRevealed)}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                        <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center mt-3">

                            {/* Main Word */}
                            <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
                                {currentWord.word}
                            </h1>

                            {/* Pronunciation / Audio (Placeholder) */}
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full mb-8">
                                <Volume2 className="w-6 h-6" />
                            </Button>

                            {/* Revealed Content */}
                            <div className={`transition-all duration-500 overflow-hidden ${isRevealed ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <Badge variant="outline" className="text-purple-400 border-purple-500/30 px-3 py-1">
                                            {currentWord.part_of_speech || 'noun'}
                                        </Badge>
                                        <Badge variant="outline" className="text-blue-400 border-blue-500/30 px-3 py-1">
                                            Level {currentWord.level}
                                        </Badge>
                                    </div>

                                    <div className="py-4 border-t border-white/5 w-full">
                                        <p className="text-2xl text-gray-200 font-medium">
                                            {currentWord.meaning}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">Native Translation</p>
                                    </div>
                                </div>
                            </div>

                            {!isRevealed && (
                                <p className="text-sm text-gray-500 animate-pulse mt-8">Click card to reveal meaning</p>
                            )}

                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => fetchRandomWord(true)}
                            className="h-12 px-8 bg-white text-black hover:bg-gray-200 font-bold rounded-full flex items-center gap-2 transition-transform active:scale-95"
                        >
                            Next Word <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-gray-500">No words available.</div>
            )}

            {/* Today's Words Section */}
            <div className="w-full max-w-4xl mt-12 border-t border-white/10 pt-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Book className="w-5 h-5 text-purple-400" />
                    Words Learned Today
                </h3>

                {todayWords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-lg border border-white/5 border-dashed">
                        No words learned yet today. Start your session!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {todayWords.map((word: any) => (
                            <div key={word.id} className="bg-black/20 border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg text-white">{word.word}</h4>
                                    <Badge variant="outline" className="text-xs border-white/10 text-gray-400">
                                        {word.part_of_speech}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">{word.meaning}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

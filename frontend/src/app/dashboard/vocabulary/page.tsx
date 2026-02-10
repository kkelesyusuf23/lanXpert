"use client";

import { useState, useEffect } from "react";
import { Book, Volume2, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES } from "@/lib/constants";
import { useForm } from "react-hook-form";

export default function VocabularyPage() {
    const [currentWord, setCurrentWord] = useState<any | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [limitReached, setLimitReached] = useState(false);

    // For Admin adding words (keeping this just in case, but hiding from main view)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm();

    const fetchRandomWord = async (forceNew = false) => {
        setIsLoading(true);
        setIsRevealed(false);
        setError("");
        setLimitReached(false);

        // Check Local Storage first if not forced
        if (!forceNew) {
            const savedWord = localStorage.getItem("currentWord");
            if (savedWord) {
                try {
                    const parsed = JSON.parse(savedWord);
                    // Check if it's from today? Maybe not needed for "refresh" persistence request.
                    // Just basic persistence for now.
                    setCurrentWord(parsed);
                    setIsLoading(false);
                    return;
                } catch (e) {
                    localStorage.removeItem("currentWord");
                }
            }
        }

        try {
            const response = await api.get("/words/random");
            setCurrentWord(response.data);
            localStorage.setItem("currentWord", JSON.stringify(response.data));
        } catch (err: any) {
            if (err.response?.status === 403) {
                setLimitReached(true);
            } else if (err.response?.status === 404) {
                setError("No words found for your target language yet.");
            } else {
                setError("Failed to fetch new word.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial load: don't force new, try storage
        fetchRandomWord(false);
    }, []);

    const onAddSubmit = async (data: any) => {
        try {
            await api.post("/words", {
                word: data.word,
                meaning: data.meaning,
                level: data.level,
                part_of_speech: data.part_of_speech,
                language_id: data.language_id
            });
            setIsAddDialogOpen(false);
            reset();
            // Optionally fetch new word if we want to show it immediately, but random is better
        } catch (error) {
            console.error("Failed to add word:", error);
        }
    };

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
                    <p className="text-gray-400 max-w-md">You've reached your 5 free words for today. Upgrade to LanXpert Pro for unlimited learning.</p>
                    <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">Upgrade Now</Button>
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
        </div>
    );
}

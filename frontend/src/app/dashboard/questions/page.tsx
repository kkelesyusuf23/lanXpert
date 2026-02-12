"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Plus, Search, ThumbsUp, MessageSquare, MoreHorizontal, Globe, Loader2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import { LANGUAGES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns"; // Standard relative time

import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Import useRouter

export default function QuestionsPage() {
    const router = useRouter(); // Initialize router
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const toggleSave = async (question: any, e?: any) => {
        if (e) e.stopPropagation();
        try {
            // Optimistic update
            const newStatus = !question.is_saved;
            setQuestions(prev => prev.map(q =>
                q.id === question.id ? { ...q, is_saved: newStatus } : q
            ));
            if (selectedQuestion?.id === question.id) {
                setSelectedQuestion({ ...selectedQuestion, is_saved: newStatus });
            }

            const res = await api.post(`/features/save/question/${question.id}`);
            const confirmedStatus = res.data.is_saved;

            // Reconcile if different
            if (confirmedStatus !== newStatus) {
                setQuestions(prev => prev.map(q =>
                    q.id === question.id ? { ...q, is_saved: confirmedStatus } : q
                ));
            }
        } catch (error) {
            console.error("Failed to toggle save", error);
        }
    };

    const toggleHelpful = async (answer: any) => {
        try {
            // Check if already helpful-ed locally (optimistic check not full proof without user_has_helped flag from backend)
            // Assuming backend returns new count or error if duplicate. 
            // Better: Optimistic update + api call.
            // Current backend: Returns {status: "success"|"ignored", message}
            // And doesn't return new count. We increment locally if success.

            // However, we don't have "is_helpful" boolean on the answer object from listing (yet).
            // Let's assume we want to just try to mark it.

            const res = await api.post(`/features/helpful/${answer.id}`);
            if (res.data.status === 'success') {
                // Update local state
                if (selectedQuestion) {
                    const updatedAnswers = selectedQuestion.answers.map((a: any) =>
                        a.id === answer.id ? { ...a, helpful_count: (a.helpful_count || 0) + 1 } : a
                    );
                    setSelectedQuestion({ ...selectedQuestion, answers: updatedAnswers });
                }
            } else {
                // Already marked
                // Maybe show toast? For now silent or alert?
            }
        } catch (error) {
            console.error("Failed to mark helpful", error);
        }
    }

    const onReplySubmit = async (text: string) => {
        if (!selectedQuestion) return;
        setIsSubmittingReply(true);
        try {
            await api.post("/answers", {
                question_id: selectedQuestion.id,
                answer_text: text
            });
            // Refresh questions to show new answer
            await fetchQuestions();
            // Also need to update the currently selected question to show the new answer immediately
            // Since fetchQuestions updates the list, we can find the updated question in the new list, or just close modal?
            // Better UX: Keep modal open and update the local selectedQuestion state by fetching it or updating local list
            // For simplicity, let's re-fetch data and find the question again from the fresh list (or just optimistic update)
            // Let's create a temporary reload
            setIsReplying(false);
            setReplyText("");

            // Re-fetch logic is a bit decoupled due to scope, so let's just trigger a full refresh and ideally update selectedQuestion
            // But fetchQuestions is async.
            const res = await api.get("/questions"); // Simply re-calling API to get fresh data including new answer
            setQuestions(res.data);
            const updatedQ = res.data.find((q: any) => q.id === selectedQuestion.id);
            if (updatedQ) setSelectedQuestion(updatedQ);

        } catch (error) {
            console.error("Failed to submit reply:", error);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            title: "",
            description: "",
            source_lang: LANGUAGES[0].id,
            target_lang: LANGUAGES[1].id
        }
    });

    const watchedSourceLang = watch("source_lang");
    const watchedTargetLang = watch("target_lang");

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me");
            setCurrentUser(res.data);
            setValue("source_lang", res.data.native_language_id);
            setValue("target_lang", res.data.target_language_id);
        } catch (e) { console.error(e) }
    };

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            let url = "/questions";
            const params = new URLSearchParams();

            if (activeTab === "my_questions" && currentUser) {
                params.append("user_id", currentUser.id);
            } else if (activeTab === "unanswered") {
                params.append("unanswered", "true");
            } else if (activeTab === "for_me" && currentUser) {
                // If I'm an expert in my native language, I want to see questions asking for my native language
                // OR questions about my target language? 
                // User said: "bana sorulan diye bir alan olsun ve orada da hedef dile göre kullanıcılara görünmeli."
                // "Bana sorulan" implies I can answer. So I can answer questions where TargetLang = My NativeLang
                // Or questions where SourceLang = My NativeLang?
                // Usually "For Me" means questions I can answer.
                // If I am English native learning Turkish.
                // A Turk asks EN->TR (Target TR). I can't help much?
                // A Turk asks TR->EN (Question in TR, wants EN answer). I can help! (Target EN).
                // So show me questions where target_language_id = My Native Language.
                // AND potentially where target_language_id = My Target Language (to learn from others answers)?
                // Let's stick to "target_lang = my_native_lang" (I am the expert) as priority.
                if (currentUser.native_language_id) {
                    params.append("target_lang", currentUser.native_language_id);
                }
            }

            const response = await api.get(`${url}?${params.toString()}`);
            setQuestions(response.data);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (currentUser || activeTab === "all") {
            fetchQuestions();
        }
    }, [activeTab, currentUser]);

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const onSubmit = async (data: any) => {
        try {
            if (isEditing && editingId) {
                await api.put(`/questions/${editingId}`, {
                    question_text: data.title,
                    description: data.description,
                    source_language_id: data.source_lang,
                    target_language_id: data.target_lang
                });
            } else {
                // Ensure description is a string
                await api.post("/questions", {
                    question_text: data.title,
                    description: data.description,
                    source_language_id: data.source_lang,
                    target_language_id: data.target_lang
                });
            }
            fetchQuestions();
            setIsDialogOpen(false);
            reset({
                title: "",
                description: "",
                source_lang: currentUser?.native_language_id || LANGUAGES[0].id,
                target_lang: currentUser?.target_language_id || LANGUAGES[1].id
            });
            setIsEditing(false);
            setEditingId(null);
        } catch (error: any) { // Type as any to access response
            if (error.response && error.response.status === 403) {
                toast.warning("Daily Limit Reached", {
                    description: "You have reached your daily question limit. Upgrade to Pro for unlimited access.",
                    action: {
                        label: "Upgrade",
                        onClick: () => {
                            router.push("/pricing");
                            setIsDialogOpen(false);
                        }
                    },
                    duration: 5000,
                });
            } else {
                console.error("Failed to save question:", error);
                toast.error("Failed create question", {
                    description: error.response?.data?.detail || "Please check your input and try again."
                });
            }
        }
    };

    const handleMessageUser = async (userId: string, e: any) => {
        e.stopPropagation();
        try {
            const res = await api.post("/chats/direct", { target_user_id: userId });
            // Using window.location to force full reload if needed, but router.push is better for SPA
            router.push(`/dashboard/chat?chatId=${res.data.id}`);
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 403) {
                toast.warning("Messaging Restricted", {
                    description: error.response.data.detail || "Upgrade to Enterprise to message users directly.",
                    action: { label: "Upgrade", onClick: () => router.push("/pricing") }
                });
            } else {
                toast.error("Failed to start chat");
            }
        }
    };

    // Helper to format date
    const timeAgo = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return "";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <MessageCircle className="w-8 h-8 text-purple-500" />
                        Community Q&A
                    </h1>
                    <p className="text-gray-400 mt-1">Ask questions, get answers, and help others learn.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                            if (!isEditing) {
                                reset({
                                    title: "",
                                    description: "",
                                    source_lang: currentUser?.native_language_id || LANGUAGES[0].id,
                                    target_lang: currentUser?.target_language_id || LANGUAGES[1].id
                                });
                            }
                        }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Ask Question
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Edit Question" : "Ask the Community"}</DialogTitle>
                            <DialogDescription>Be specific to get better answers.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Question Title</Label>
                                <Input id="title" {...register("title", { required: true })} placeholder="e.g. Difference between make and do" className="bg-white/5 border-white/10" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Source Language</Label>
                                    <Select value={watchedSourceLang} onValueChange={(v) => setValue("source_lang", v)}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Target Language</Label>
                                    <Select value={watchedTargetLang} onValueChange={(v) => setValue("target_lang", v)}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Details</Label>
                                <Textarea id="desc" {...register("description")} placeholder="Provide context or examples..." className="bg-white/5 border-white/10 min-h-[100px]" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Post Question</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">All Questions</TabsTrigger>
                        <TabsTrigger value="for_me" className="data-[state=active]:bg-purple-600">For Me</TabsTrigger>
                        <TabsTrigger value="my_questions" className="data-[state=active]:bg-purple-600">My Questions</TabsTrigger>
                        <TabsTrigger value="unanswered" className="data-[state=active]:bg-purple-600">Unanswered</TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                            placeholder="Search topics..."
                            className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">No questions found in this category.</div>
                    ) : (
                        questions.map((q) => (
                            <Card key={q.id} className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all group relative">
                                <CardHeader className="pb-3 cursor-pointer" onClick={() => setSelectedQuestion(q)}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-white/10">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${q.user?.username || 'user'}`} />
                                                <AvatarFallback>{q.user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{q.user?.username || 'Unknown User'}</h3>
                                                <p className="text-xs text-gray-400">{timeAgo(q.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-3 cursor-pointer" onClick={() => setSelectedQuestion(q)}>
                                    <h2 className="text-lg font-bold text-white mb-2">{q.question_text}</h2>
                                    <p className="text-gray-300 text-sm line-clamp-2">{q.description}</p>

                                    <div className="flex gap-2 mt-4">
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-0 flex gap-1">
                                            <Globe className="w-3 h-3" />
                                            {LANGUAGES.find(l => l.id === q.source_language_id)?.code.toUpperCase() || 'UNK'} →
                                            {LANGUAGES.find(l => l.id === q.target_language_id)?.code.toUpperCase() || 'UNK'}
                                        </Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 border-t border-white/5 flex justify-between text-sm text-gray-400">
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1 hover:text-white transition-colors">
                                            <MessageSquare className="w-4 h-4" /> {q.answers?.length || 0} Answers
                                        </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {(currentUser && q.user_id === currentUser.id) && (
                                            <div className="flex items-center gap-2 mr-2">
                                                <Button size="sm" variant="ghost" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setValue("title", q.question_text);
                                                    setValue("description", q.description);
                                                    setValue("source_lang", q.source_language_id);
                                                    setValue("target_lang", q.target_language_id);
                                                    setIsEditing(true);
                                                    setEditingId(q.id);
                                                    setIsDialogOpen(true);
                                                }} className="h-6 text-xs text-gray-400 hover:text-white">Edit</Button>
                                                <Button size="sm" variant="ghost" onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Are you sure you want to delete this question?')) {
                                                        await api.delete(`/questions/${q.id}`);
                                                        fetchQuestions();
                                                    }
                                                }} className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20">Delete</Button>
                                            </div>
                                        )}
                                        <Button variant="link" onClick={() => setSelectedQuestion(q)} className="text-purple-400 p-0 h-auto">read more</Button>
                                    </div>

                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-purple-400" onClick={(e) => toggleSave(q, e)}>
                                        <Bookmark className={`w-4 h-4 ${q.is_saved ? "fill-purple-400 text-purple-400" : ""}`} />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )))}
                </div>
            </Tabs>

            {/* Question Detail & Reply Modal */}
            <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
                <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[700px] max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Question Details</DialogTitle>
                    </DialogHeader>

                    {selectedQuestion && (
                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {/* Question Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedQuestion.user?.username || 'user'}`} />
                                        <AvatarFallback>{selectedQuestion.user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-white">{selectedQuestion.user?.username}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-400">{timeAgo(selectedQuestion.created_at)}</p>
                                            {currentUser && selectedQuestion.user_id !== currentUser.id && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-5 px-2 text-[10px] text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                                                    onClick={(e) => handleMessageUser(selectedQuestion.user_id, e)}
                                                >
                                                    <MessageCircle className="w-3 h-3 mr-1" /> Message
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">{selectedQuestion.question_text}</h2>
                                    <p className="text-gray-300 whitespace-pre-wrap">{selectedQuestion.description}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-0">
                                        {LANGUAGES.find(l => l.id === selectedQuestion.source_language_id)?.name} → {LANGUAGES.find(l => l.id === selectedQuestion.target_language_id)?.name}
                                    </Badge>
                                </div>
                            </div>

                            <div className="h-px bg-white/10" />

                            {/* Answers Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    {selectedQuestion.answers?.length || 0} Answers
                                </h3>

                                {selectedQuestion.answers?.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-lg">
                                        No answers yet. Be the first to help!
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedQuestion.answers?.map((ans: any) => (
                                            <div key={ans.id} className="bg-white/5 rounded-lg p-4 border border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ans.user?.username || 'user'}`} />
                                                            <AvatarFallback>U</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-sm text-gray-300">{ans.user?.username || 'User'}</span>
                                                        <span className="text-xs text-gray-500">• {timeAgo(ans.created_at)}</span>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="h-6 text-gray-400 hover:text-green-500 gap-1" onClick={() => toggleHelpful(ans)}>
                                                        <ThumbsUp className="w-3 h-3" /> {ans.helpful_count || 0}
                                                    </Button>
                                                </div>
                                                <p className="text-gray-200 text-sm whitespace-pre-wrap">{ans.answer_text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reply Section (Fixed at bottom) */}
                    <div className="pt-4 border-t border-white/10 mt-2">
                        {!isReplying ? (
                            <Button onClick={() => setIsReplying(true)} className="w-full bg-purple-600 hover:bg-purple-700">
                                <MessageCircle className="w-4 h-4 mr-2" /> Reply to this question
                            </Button>
                        ) : (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                onReplySubmit(replyText);
                            }} className="space-y-3">
                                <Textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write your helpful answer here..."
                                    className="bg-zinc-950 border-white/20 min-h-[100px]"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={!replyText.trim() || isSubmittingReply}>
                                        {isSubmittingReply && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                        Post Answer
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

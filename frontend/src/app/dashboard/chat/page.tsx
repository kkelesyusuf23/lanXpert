"use client";

import { useEffect, useState, useRef } from "react";
import { MessageSquare, Search, MoreVertical, Send, UserMinus, Flag, Loader2, Sparkles, User, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card"; // using div for layout mostly
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initChatId = searchParams.get("chatId");

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isSearchingRandom, setIsSearchingRandom] = useState(false);

    // Polling refs
    const chatPollingInterval = useRef<NodeJS.Timeout | null>(null);
    const msgPollingInterval = useRef<NodeJS.Timeout | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch User & Chats on Load
    useEffect(() => {
        const init = async () => {
            try {
                const userRes = await api.get("/users/me");
                setCurrentUser(userRes.data);

                // Check Plan
                if (!userRes.data.plan_id) {
                    // Free User - Show Upgrade Screen logic handled in render
                } else {
                    fetchChats();
                    chatPollingInterval.current = setInterval(fetchChats, 5000);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        init();

        return () => {
            if (chatPollingInterval.current) clearInterval(chatPollingInterval.current);
            if (msgPollingInterval.current) clearInterval(msgPollingInterval.current);
        };
    }, []);

    // Poll messages when chat selected
    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
            msgPollingInterval.current = setInterval(() => fetchMessages(selectedChat.id), 3000);
        }
        return () => {
            if (msgPollingInterval.current) clearInterval(msgPollingInterval.current);
        };
    }, [selectedChat]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchChats = async () => {
        try {
            const res = await api.get("/chats");
            setChats(res.data);

            if (initChatId && res.data.length > 0) {
                const target = res.data.find((c: any) => c.id === initChatId);
                if (target) setSelectedChat(target);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMessages = async (chatId: string) => {
        try {
            const res = await api.get(`/chats/${chatId}/messages`);
            // Only update if different count (simple check) or deep compare if needed
            // For now, just set
            setMessages(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || !selectedChat) return;

        const text = inputText;
        setInputText("");
        setIsSending(true);

        try {
            const res = await api.post(`/chats/${selectedChat.id}/messages`, { content: text });
            setMessages(prev => [...prev, res.data]);
        } catch (e) {
            toast.error("Failed to send message");
            setInputText(text); // Restore
        } finally {
            setIsSending(false);
        }
    };

    const startRandomChat = async () => {
        setIsSearchingRandom(true);
        try {
            const res = await api.post("/chats/random");
            const chat = res.data;
            if (chat.type === 'random_queue' && chat.participants.length === 1) {
                toast.info("Looking for a partner...", { description: "You are in the queue. Please wait." });
            } else {
                toast.success("Connected!", { description: "Say hello to your new language partner." });
                setSelectedChat(chat);
            }
            fetchChats();
        } catch (e: any) {
            toast.error("Failed to start random chat", { description: e.response?.data?.detail });
        } finally {
            setIsSearchingRandom(false);
        }
    };

    const handleBlock = async (userId: string) => {
        if (!confirm("Block this user? You won't receive messages from them.")) return;
        try {
            await api.post("/chats/block", { user_id: userId });
            toast.success("User blocked");
            setSelectedChat(null);
            fetchChats();
        } catch (e) { toast.error("Failed to block"); }
    };

    const handleReport = async (userId: string) => {
        const reason = prompt("Reason for reporting (spam, harassment, etc.):");
        if (!reason) return;
        try {
            await api.post("/chats/report", { user_id: userId, reason });
            toast.success("User reported. Thank you for keeping the community safe.");
        } catch (e) { toast.error("Failed to report"); }
    };

    // New Delete Logic
    const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the chat
        if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) return;

        try {
            await api.delete(`/chats/${chatId}`);
            setChats(prev => prev.filter(c => c.id !== chatId));
            if (selectedChat?.id === chatId) {
                setSelectedChat(null);
            }
            toast.success("Chat deleted");
        } catch (e) {
            toast.error("Failed to delete chat");
        }
    };

    // Helper to get other participant
    const getOtherParticipant = (chat: any) => {
        if (!chat || !currentUser) return null;
        return chat.participants.find((p: any) => p.user.id !== currentUser.id)?.user;
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;

    // Free User Lock Screen
    if (currentUser && !currentUser.plan_id) {
        return (
            <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center text-center p-6 space-y-6">
                <div className="w-20 h-20 rounded-full bg-purple-900/30 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Unlock Community Chat</h1>
                <p className="text-gray-400 max-w-md">Chat with language learners worldwide, practice with random partners, and make new friends. Upgrade to Pro to access.</p>
                <Button onClick={() => router.push("/pricing")} className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8 py-6">
                    Upgrade to Pro
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-5rem)] bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Sidebar (List) */}
            <div className={`w-full md:w-80 border-r border-white/10 flex flex-col bg-black/40 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                {/* ... Header and Search ... */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-500" /> Messages
                    </h2>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300 gap-2"
                        onClick={startRandomChat}
                        disabled={isSearchingRandom}
                    >
                        {isSearchingRandom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Random Chat
                    </Button>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input placeholder="Search chats..." className="pl-9 bg-zinc-900/50 border-white/10 h-9" />
                    </div>
                </div>

                {/* List */}
                <ScrollArea className="flex-1">
                    <div className="space-y-1 p-2">
                        {chats.length === 0 ? (
                            <div className="text-center text-gray-500 py-10 text-sm p-4">
                                No chats yet.<br />Start a random chat or message someone from Q&A!
                            </div>
                        ) : (
                            chats.map(chat => {
                                const other = getOtherParticipant(chat);
                                const isActive = selectedChat?.id === chat.id;
                                const isQueue = chat.type === 'random_queue';

                                return (
                                    <div
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 group relative ${isActive ? 'bg-purple-600/10 border border-purple-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.username || 'user'}`} />
                                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-medium text-white truncate text-sm">
                                                    {isQueue ? "Checking Queue..." : (other?.username || "Unknown User")}
                                                </h3>
                                                <span className="text-[10px] text-gray-500">{chat.last_message ? formatDistanceToNow(new Date(chat.last_message.created_at)) : ''}</span>
                                            </div>
                                            <p className="text-gray-400 text-xs truncate">
                                                {isQueue ? "Waiting for partner..." : (chat.last_message?.content || "No messages yet")}
                                            </p>
                                        </div>

                                        {/* Delete Option - Visible on Hover or Active */}
                                        <div className={`absolute right-2 top-1/2 -translate-y-1/2 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={(e) => e.stopPropagation()}>
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                                                    <DropdownMenuItem
                                                        className="text-red-400 hover:text-red-300 hover:bg-white/5 cursor-pointer"
                                                        onClick={(e) => handleDeleteChat(chat.id, e as any)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete Chat
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* ... rest of the component ... */}
            <div className={`flex-1 flex flex-col bg-zinc-900/20 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 h-16">
                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="ghost" className="md:hidden -ml-2 text-gray-400" onClick={() => setSelectedChat(null)}>
                                    {/* Back Arrow */}
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </Button>
                                <Avatar className="h-9 w-9 border border-white/10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getOtherParticipant(selectedChat)?.username || 'user'}`} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-white text-sm">
                                        {selectedChat.type === 'random_queue' ? "Searching..." : (getOtherParticipant(selectedChat)?.username || "User")}
                                    </h3>
                                    {selectedChat.type === 'random' && <p className="text-[10px] text-purple-400">Random Match</p>}
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-gray-300">
                                    <DropdownMenuItem className="hover:bg-white/5 cursor-pointer text-red-400 hover:text-red-300" onClick={() => handleBlock(getOtherParticipant(selectedChat)?.id)}>
                                        <UserMinus className="w-4 h-4 mr-2" /> Block User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-white/5 cursor-pointer text-yellow-400 hover:text-yellow-300" onClick={() => handleReport(getOtherParticipant(selectedChat)?.id)}>
                                        <Flag className="w-4 h-4 mr-2" /> Report User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-500 hover:text-red-400 hover:bg-white/5 cursor-pointer border-t border-white/10 mt-1 pt-1"
                                        onClick={(e) => handleDeleteChat(selectedChat.id, e as any)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Chat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_id === currentUser?.id;
                                const isSystem = !msg.sender_id;

                                if (isSystem) {
                                    return (
                                        <div key={msg.id || i} className="flex justify-center my-4">
                                            <span className="bg-zinc-800 text-gray-400 text-xs px-3 py-1 rounded-full border border-white/5">
                                                {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe
                                            ? 'bg-purple-600 text-white rounded-br-none'
                                            : 'bg-zinc-800 text-gray-200 rounded-bl-none border border-white/5'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <span className={`text-[10px] block mt-1 opacity-70 ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                                                {formatDistanceToNow(new Date(msg.created_at))} ago
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {selectedChat.type === 'random_queue' && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                    <p>Waiting for a language partner...</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-zinc-900/50 border-t border-white/10">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    className="bg-black/50 border-white/10 text-white focus-visible:ring-purple-500"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    disabled={isSending || selectedChat.type === 'random_queue'}
                                />
                                <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700" disabled={isSending || selectedChat.type === 'random_queue'}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                        <p className="max-w-xs mx-auto">Click on a chat from the list or start a new Random Chat to practice.</p>
                        <Button className="mt-6 bg-white/5 hover:bg-white/10 text-white border border-white/10" onClick={startRandomChat} disabled={isSearchingRandom}>
                            {isSearchingRandom ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Find Language Partner
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { PenTool, Plus, Search, BookOpen, Clock, Heart, Share2, Globe, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { formatDistanceToNow } from "date-fns";

import Editor from "@/components/ui/rich-editor";

export default function ArticlesPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // New State
    const [activeTab, setActiveTab] = useState("all");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const contentValue = watch("content"); // Watch for custom editor

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me");
            setCurrentUser(res.data);
        } catch (e) { console.error(e) }
    };

    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            let url = "/articles";
            const params = new URLSearchParams();
            if (activeTab === "my_articles" && currentUser) {
                params.append("user_id", currentUser.id);
            }
            if (currentUser) {
                params.append("current_user_id", currentUser.id);
            }

            const response = await api.get(`${url}?${params.toString()}`);
            setArticles(response.data);
        } catch (error) {
            console.error("Failed to fetch articles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async (articleId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!currentUser) return alert("Please login to like articles.");

        try {
            await api.post(`/articles/${articleId}/like`);
            // Optimistic update or Refetch
            // Refetching is easier to keep consistent
            fetchArticles();

            // If viewing in modal, also update selectedArticle if it matches
            if (selectedArticle && selectedArticle.id === articleId) {
                // We need to fetch the single article or just toggle local state
                // For now, let's just refetch list and find the article again from list?
                // A bit hacky. Let's just manually toggle for the UI feeling.
                const isLiked = selectedArticle.is_liked;
                setSelectedArticle((prev: any) => ({
                    ...prev,
                    is_liked: !isLiked,
                    like_count: isLiked ? prev.like_count - 1 : prev.like_count + 1
                }));
            }

        } catch (error) {
            console.error("Failed to like:", error);
        }
    };

    const handleShare = (article: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const text = `Check out this article "${article.title}" on LanXpert!`;
        navigator.clipboard.writeText(text).then(() => {
            alert("Link copied to clipboard! (Simulation)");
        });
    };

    const calculateReadTime = (text: string) => {
        const words = text?.split(" ").length || 0;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (currentUser || activeTab === "all") {
            fetchArticles();
        }
    }, [activeTab, currentUser]);

    // ... (rest of the component until CardFooter)

    return (
        <div className="space-y-8">
            {/* ... Header and Tabs ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <PenTool className="w-8 h-8 text-purple-500" />
                        Articles & Stories
                    </h1>
                    <p className="text-gray-400 mt-1">Read immersive stories or write your own to practice.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    {/* ... Dialog Content ... */}
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Write Article
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[700px]">
                        <DialogHeader>
                            {/* ... */}
                            <DialogTitle>{isEditing ? "Edit Article" : "Write a New Article"}</DialogTitle>
                            <DialogDescription>Share your knowledge or practice your writing skills.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(async (data) => {
                            try {
                                if (isEditing && editingId) {
                                    await api.put(`/articles/${editingId}`, {
                                        title: data.title,
                                        content: data.content,
                                        language_id: data.language_id
                                    });
                                } else {
                                    await api.post("/articles", {
                                        title: data.title,
                                        content: data.content,
                                        language_id: data.language_id
                                    });
                                }
                                fetchArticles();
                                setIsDialogOpen(false);
                                reset();
                                setIsEditing(false);
                                setEditingId(null);
                            } catch (error) {
                                console.error("Failed to save article:", error);
                            }
                        })} className="grid gap-4 py-4">
                            {/* ... Form ... */}
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" {...register("title", { required: true })} placeholder="Give your article a catchy title" className="bg-white/5 border-white/10" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Language</Label>
                                    <Select onValueChange={(v) => setValue("language_id", v)} defaultValue={LANGUAGES[0].id}>
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
                                <Label htmlFor="content">Content</Label>
                                <div className="min-h-[300px] border border-white/10 rounded-md">
                                    <Editor
                                        content={contentValue || ""}
                                        onChange={(html) => setValue("content", html)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">{isEditing ? "Update Article" : "Publish Article"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col space-y-4">
                <div className="flex gap-2 border-b border-white/10 pb-4">
                    <Button
                        variant={activeTab === 'all' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('all')}
                        className={activeTab === 'all' ? "bg-purple-600 hover:bg-purple-700" : "text-gray-400 hover:text-white hover:bg-white/5"}
                    >
                        All Articles
                    </Button>
                    <Button
                        variant={activeTab === 'my_articles' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('my_articles')}
                        className={activeTab === 'my_articles' ? "bg-purple-600 hover:bg-purple-700" : "text-gray-400 hover:text-white hover:bg-white/5"}
                    >
                        My Articles
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <Input
                            placeholder="Search articles..."
                            className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Articles Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : articles.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No articles found. Write something!</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <Card key={article.id} className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-colors cursor-pointer group h-full flex flex-col relative">
                            {/* ... Edit/Delete Buttons ... */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                                {(currentUser && article.user_id === currentUser.id) && (
                                    <>
                                        <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/50 hover:bg-purple-600 text-white border border-white/10" onClick={(e) => {
                                            e.stopPropagation();
                                            setValue("title", article.title);
                                            setValue("language_id", article.language_id);
                                            setValue("content", article.content);
                                            setIsEditing(true);
                                            setEditingId(article.id);
                                            setIsDialogOpen(true);
                                        }}>
                                            <PenTool className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8 bg-red-900/50 hover:bg-red-600 text-white border border-white/10" onClick={async (e) => {
                                            e.stopPropagation();
                                            if (confirm("Are you sure you want to delete this article?")) {
                                                try {
                                                    await api.delete(`/articles/${article.id}`);
                                                    fetchArticles();
                                                } catch (error) {
                                                    console.error("Failed to delete article:", error);
                                                    alert("Failed to delete article.");
                                                }
                                            }
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            <CardHeader onClick={() => setSelectedArticle(article)}>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                        {LANGUAGES.find(l => l.id === article.language_id)?.name || "Unknown"}
                                    </Badge>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {calculateReadTime(article.content)}
                                    </span>
                                </div>
                                <CardTitle className="text-xl text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                                    {article.title}
                                </CardTitle>
                                <CardDescription className="text-gray-400">by {article.user?.username || "Anonymous"}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1" onClick={() => setSelectedArticle(article)}>
                                <div className="text-gray-400 text-sm line-clamp-3 mb-4 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
                            </CardContent>
                            <CardFooter className="border-t border-white/5 pt-4 text-gray-500 text-sm flex justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`p-0 h-auto hover:bg-transparent ${article.is_liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                    onClick={(e) => handleLike(article.id, e)}
                                >
                                    <Heart className={`w-4 h-4 mr-1 ${article.is_liked ? 'fill-current' : ''}`} /> {article.like_count || 0}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-auto text-gray-400 hover:text-white hover:bg-transparent"
                                    onClick={(e) => handleShare(article, e)}
                                >
                                    <Share2 className="w-4 h-4 mr-1" /> Share
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Reading View Modal */}
                    <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
                        <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[800px] h-[80vh] flex flex-col">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-purple-600 hover:bg-purple-700">{LANGUAGES.find(l => l.id === selectedArticle?.language_id)?.name}</Badge>
                                </div>
                                <DialogTitle className="text-3xl font-bold">{selectedArticle?.title}</DialogTitle>
                                <DialogDescription className="flex items-center gap-4 text-gray-400">
                                    <span>Author: <span className="text-white">{selectedArticle?.user?.username || "Anonymous"}</span></span>
                                    <span>•</span>
                                    <span>{calculateReadTime(selectedArticle?.content || "")} read</span>
                                </DialogDescription>
                            </DialogHeader>

                            <Separator className="bg-white/10 my-2" />

                            <ScrollArea className="flex-1 pr-4">
                                <div className="text-lg leading-relaxed text-gray-300 space-y-4">
                                    <Editor content={selectedArticle?.content || ""} editable={false} />
                                </div>
                            </ScrollArea>

                            <DialogFooter className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center w-full sm:justify-between">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`border-white/10 hover:bg-white/5 ${selectedArticle?.is_liked ? 'text-red-500 border-red-900/50 bg-red-900/10' : 'text-gray-400 hover:text-white'}`}
                                        onClick={() => selectedArticle && handleLike(selectedArticle.id)}
                                    >
                                        <Heart className={`w-4 h-4 mr-2 ${selectedArticle?.is_liked ? 'fill-current' : ''}`} /> Like ({selectedArticle?.like_count || 0})
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                                        onClick={() => selectedArticle && handleShare(selectedArticle)}
                                    >
                                        <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>
                                </div>
                                <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="text-gray-400">Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}

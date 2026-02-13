"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { LANGUAGES } from "@/lib/constants";
import Link from "next/link";


export default function ArticlesAdminPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/admin/articles");
            setArticles(res.data);
        } catch (error) {
            console.error("Failed to fetch articles", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this article?")) {
            try {
                await api.delete(`/admin/articles/${id}`);
                setArticles(articles.filter(a => a.id !== id));
            } catch (error) {
                console.error("Failed to delete article", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Article Management</h1>
                    <p className="text-gray-400">Review and moderate user-submitted articles.</p>
                </div>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden bg-black/20">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i} className="border-white/10">
                                    <TableCell colSpan={6} className="h-12 animate-pulse bg-white/5" />
                                </TableRow>
                            ))
                        ) : articles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No articles found.</TableCell>
                            </TableRow>
                        ) : (
                            articles.map((a) => (
                                <TableRow key={a.id as string} className="border-white/10 hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <Badge variant={a.is_published ? "default" : "secondary"} className={a.is_published ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}>
                                            {a.is_published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-white max-w-xs truncate" title={a.title}>
                                        {a.title}
                                        <div className="text-xs text-gray-500 truncate">{a.content.substring(0, 50)}...</div>
                                    </TableCell>
                                    <TableCell className="text-gray-400">{a.user?.username || 'Unknown'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                                            {LANGUAGES.find(l => l.id === a.language_id)?.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-xs">
                                        {a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/dashboard/articles?id=${a.id}`} target="_blank">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-900/20">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="h-8 w-8 text-red-500 hover:bg-red-900/20">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

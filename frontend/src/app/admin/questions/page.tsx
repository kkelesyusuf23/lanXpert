"use client";

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

export default function QuestionsAdminPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/admin/questions");
            setQuestions(res.data);
        } catch (error) {
            console.error("Failed to fetch questions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this question and all its answers?")) {
            try {
                await api.delete(`/admin/questions/${id}`);
                setQuestions(questions.filter(q => q.id !== id));
            } catch (error) {
                console.error("Failed to delete question", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Question Management</h1>
                    <p className="text-gray-400">Moderate community questions and answers.</p>
                </div>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden bg-black/20">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="w-[150px]">Status</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Date</TableHead>
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
                        ) : questions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No questions found.</TableCell>
                            </TableRow>
                        ) : (
                            questions.map((q) => (
                                <TableRow key={q.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <Badge variant={q.answers?.length > 0 ? "outline" : "secondary"} className={q.answers?.length > 0 ? "text-green-400 border-green-500/30" : "text-yellow-400 bg-yellow-500/10"}>
                                            {q.answers?.length} Answers
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-white max-w-xs truncate" title={q.question_text}>
                                        {q.question_text}
                                        <div className="text-xs text-gray-500 truncate">{q.description}</div>
                                    </TableCell>
                                    <TableCell className="text-gray-400">{q.user?.username || 'Unknown'}</TableCell>
                                    <TableCell>
                                        <div className="flex text-xs space-x-1">
                                            <span className="text-gray-400">{LANGUAGES.find(l => l.id === q.source_language_id)?.code?.toUpperCase() || '-'}</span>
                                            <span>→</span>
                                            <span className="text-purple-400">{LANGUAGES.find(l => l.id === q.target_language_id)?.code?.toUpperCase() || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-xs text-nowrap">
                                        {q.created_at ? formatDistanceToNow(new Date(q.created_at), { addSuffix: true }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/dashboard/questions?id=${q.id}`} target="_blank">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-900/20">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} className="h-8 w-8 text-red-500 hover:bg-red-900/20">
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

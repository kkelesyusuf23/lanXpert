"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { LANGUAGES } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WordsAdminPage() {
    const [words, setWords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const LIMIT = 100;
    const [levelFilter, setLevelFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingWord, setEditingWord] = useState<any | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm();

    const fetchWords = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            params.append("skip", ((page - 1) * LIMIT).toString());
            params.append("limit", LIMIT.toString());

            if (levelFilter !== "all") params.append("level", levelFilter);
            if (typeFilter !== "all") params.append("part_of_speech", typeFilter);

            const res = await api.get(`/admin/words?${params.toString()}`);
            setWords(res.data);
        } catch (error) {
            console.error("Failed to fetch words", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, page, levelFilter, typeFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Reset to page 1 on new search parameter change
            if (page !== 1) setPage(1);
            else fetchWords();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, levelFilter, typeFilter, fetchWords, page]);

    useEffect(() => {
        fetchWords();
    }, [page, fetchWords]);

    const onSubmit = async (data: any) => {
        try {
            // Defaults (if not touched)
            const targetLang = data.language_id || (editingWord?.language_id || LANGUAGES[0].id);
            const sourceLang = data.source_language_id || (editingWord?.source_language_id || (LANGUAGES.find(l => l.code === 'tr')?.id || LANGUAGES[0].id));

            // Validation
            if (targetLang === sourceLang) {
                alert("Target and Native/Source languages cannot be the same.");
                return;
            }

            // Ensure incomplete data uses defaults
            data.language_id = targetLang;
            data.source_language_id = sourceLang;

            if (editingWord) {
                await api.put(`/admin/words/${editingWord.id}`, data);
            } else {
                await api.post("/admin/words", data);
            }
            fetchWords();
            setIsDialogOpen(false);
            reset();
            setEditingWord(null);
        } catch (error) {
            console.error("Failed to save word", error);
            alert("Failed to save word.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this word?")) {
            try {
                await api.delete(`/admin/words/${id}`);
                fetchWords();
            } catch (error) {
                console.error("Failed to delete word", error);
            }
        }
    };

    const openEdit = (word: any) => {
        setEditingWord(word);
        setValue("word", word.word);
        setValue("meaning", word.meaning);
        setValue("part_of_speech", word.part_of_speech);
        setValue("level", word.level);
        setValue("language_id", word.language_id);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto min-h-screen pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-900/10 to-transparent p-6 rounded-2xl border border-purple-500/10">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400">
                        Vocabulary
                    </h1>
                    <p className="text-gray-400 mt-2 font-light tracking-wide">
                        Manage dictionary, search deeply, and organize 100s of words.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) { setEditingWord(null); reset(); }
                    }}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-900/20 text-white font-semibold">
                                <Plus className="w-5 h-5 mr-2" />
                                Add Word
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-light">{editingWord ? "Edit Word" : "Add New Word"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-6">
                                <div className="grid gap-3">
                                    <Label className="text-gray-400">Word</Label>
                                    <Input {...register("word", { required: true })} className="bg-zinc-900 border-zinc-800 focus:border-purple-500" placeholder="Target Language Word" />
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-gray-400">Meaning</Label>
                                    <Input {...register("meaning", { required: true })} className="bg-zinc-900 border-zinc-800 focus:border-purple-500" placeholder="Native Language Meaning" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-3">
                                        <Label className="text-gray-400">Part of Speech</Label>
                                        <Select onValueChange={(v) => setValue("part_of_speech", v)} defaultValue={editingWord?.part_of_speech}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder="Type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="noun">Noun</SelectItem>
                                                <SelectItem value="verb">Verb</SelectItem>
                                                <SelectItem value="adjective">Adjective</SelectItem>
                                                <SelectItem value="adverb">Adverb</SelectItem>
                                                <SelectItem value="phrase">Phrase</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-gray-400">Level</Label>
                                        <Select onValueChange={(v) => setValue("level", v)} defaultValue={editingWord?.level}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder="Level" /></SelectTrigger>
                                            <SelectContent>
                                                {["A1", "A2", "B1", "B2", "C1", "C2"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Target Language (for Word)</Label>
                                        <Select onValueChange={(v) => setValue("language_id", v)} defaultValue={editingWord?.language_id || LANGUAGES[0].id}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Native Language (for Meaning)</Label>
                                        <Select onValueChange={(v) => setValue("source_language_id", v)} defaultValue={editingWord?.source_language_id || LANGUAGES.find(l => l.code === 'tr')?.id || LANGUAGES[0].id}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-lg py-6">
                                    {editingWord ? "Update Word" : "Create Word"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-purple-400 border border-purple-500/20 shadow-lg">
                                <MoreVertical className="w-5 h-5 mr-2" />
                                Bulk Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[800px]">
                            <DialogHeader>
                                <DialogTitle>Bulk Import</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Select Target Language (Word)</Label>
                                        <Select defaultValue={LANGUAGES[0].id} onValueChange={(v) => document.getElementById('bulkLangId')?.setAttribute('data-value', v)}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800 w-full"><SelectValue placeholder="Target" /></SelectTrigger>
                                            <SelectContent>
                                                {LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Select Native Language (Meaning)</Label>
                                        <Select defaultValue={LANGUAGES.find(l => l.code === 'tr')?.id || LANGUAGES[0].id} onValueChange={(v) => document.getElementById('bulkSourceLangId')?.setAttribute('data-value', v)}>
                                            <SelectTrigger className="bg-zinc-900 border-zinc-800 w-full"><SelectValue placeholder="Native" /></SelectTrigger>
                                            <SelectContent>
                                                {LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 text-sm text-yellow-200">
                                    <strong>Format:</strong> <code>Word | Meaning | Type | Level</code>
                                </div>
                                <textarea
                                    className="w-full h-96 bg-black border border-zinc-800 rounded-lg p-6 text-sm font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                                    placeholder={`Example (En -> Tr):\nApple | Elma | noun | A1\nRun | Koşmak | verb | A2\nBeautiful | Güzel | adjective | B1`}
                                    id="bulkInput"
                                ></textarea>
                                <span id="bulkLangId" data-value={LANGUAGES[0].id} className="hidden"></span>
                                <span id="bulkSourceLangId" data-value={LANGUAGES.find(l => l.code === 'tr')?.id || LANGUAGES[0].id} className="hidden"></span>
                                <Button onClick={async () => {
                                    const input = (document.getElementById('bulkInput') as HTMLTextAreaElement).value;
                                    const langId = document.getElementById('bulkLangId')?.getAttribute('data-value') || LANGUAGES[0].id;
                                    const sourceLangId = document.getElementById('bulkSourceLangId')?.getAttribute('data-value') || (LANGUAGES.find(l => l.code === 'tr')?.id || LANGUAGES[0].id);

                                    if (langId === sourceLangId) {
                                        alert("Target and Native languages cannot be the same. Please select different languages.");
                                        return;
                                    }

                                    if (!input.trim()) return;
                                    const lines = input.split('\n').filter(l => l.trim());
                                    const payload = lines.map(line => {
                                        const [word, meaning, pos, level] = line.split('|').map(s => s.trim());
                                        return {
                                            word, meaning,
                                            part_of_speech: pos || 'noun',
                                            level: level || 'A1',
                                            language_id: langId,
                                            source_language_id: sourceLangId
                                        };
                                    });
                                    try {
                                        const res = await api.post('/admin/words/bulk', payload);
                                        alert(`Created: ${res.data.created}. Errors: ${res.data.errors.length}`);
                                        fetchWords();
                                    } catch (e) {
                                        console.error(e);
                                        alert('Failed to import');
                                    }
                                }} className="w-full bg-purple-600 hover:bg-purple-500 py-6 text-lg">
                                    Start Batch Process
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 sticky top-4 z-30 bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                    <Input
                        placeholder="Search across all words..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 bg-white/5 border-white/10 focus:border-purple-500 h-12 text-lg rounded-lg transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="w-[120px] bg-white/5 border-white/10 h-12"><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px] bg-white/5 border-white/10 h-12"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {["noun", "verb", "adjective", "adverb", "phrase"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {isLoading ? (
                    [...Array(10)].map((_, i) => (
                        <div key={i} className="h-40 bg-white/5 animate-pulse rounded-xl border border-white/5" />
                    ))
                ) : words.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                            <Search className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-xl font-medium">No vocabulary found.</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    words.map((word) => (
                        <div key={word.id} className="group relative bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-purple-500/30 rounded-xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/10 hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className={`
                                    ${word.level === 'A1' || word.level === 'A2' ? 'border-green-500/30 text-green-400' : ''}
                                    ${word.level === 'B1' || word.level === 'B2' ? 'border-yellow-500/30 text-yellow-400' : ''}
                                    ${word.level === 'C1' || word.level === 'C2' ? 'border-red-500/30 text-red-400' : ''}
                                `}>
                                    {word.level}
                                </Badge>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-500 hover:text-white">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                                        <DropdownMenuItem onClick={() => openEdit(word)}>
                                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => handleDelete(word.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-1 truncate" title={word.word}>
                                {word.word}
                            </h3>
                            <p className="text-purple-400 font-medium mb-4 truncate" title={word.meaning}>
                                {word.meaning}
                            </p>

                            <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge className="bg-white/10 hover:bg-white/20 text-white capitalize">
                                    {word.part_of_speech}
                                </Badge>
                            </div>
                            <div className="absolute bottom-5 left-5 opacity-40 group-hover:opacity-0 transition-opacity">
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{word.part_of_speech}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg border-t border-white/10 flex justify-center items-center gap-6 z-40">
                <Button
                    variant="ghost"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="hover:bg-white/10 text-white"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Page</span>
                    <span className="text-xl font-bold text-white bg-white/10 rounded px-2 min-w-[2rem] text-center">{page}</span>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => setPage(p => p + 1)}
                    disabled={words.length < LIMIT} // Crude check: if less than limit returned, implies last page
                    className="hover:bg-white/10 text-white"
                >
                    Next <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
}

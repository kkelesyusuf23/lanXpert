"use client"

import { useState } from "react";
import { createQuestion } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewQuestionPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        try {
            await createQuestion(formData);
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-xl">
                <Link href="/questions" className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8 text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    Geri Dön
                </Link>

                <h1 className="text-3xl font-bold mb-2">Soru Sor</h1>
                <p className="text-neutral-400 mb-8">Çevrilmesini istediğiniz cümleyi ve bağlamı girin.</p>

                <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Cümle / Metin</label>
                        <textarea
                            name="source_text"
                            required
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                            placeholder="Çevrilmesini istediğiniz metni buraya yazın..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Kaynak Dil</label>
                            <select name="source_language" className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                                <option value="Türkçe">Türkçe</option>
                                <option value="İngilizce">İngilizce</option>
                                <option value="Almanca">Almanca</option>
                                <option value="Fransızca">Fransızca</option>
                                <option value="İspanyolca">İspanyolca</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Hedef Dil</label>
                            <select name="target_language" className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                                <option value="İngilizce">İngilizce</option>
                                <option value="Türkçe">Türkçe</option>
                                <option value="Almanca">Almanca</option>
                                <option value="Fransızca">Fransızca</option>
                                <option value="İspanyolca">İspanyolca</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Kullanım Türü</label>
                            <select name="usage_type" className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                                <option value="formal">Resmi (Formal)</option>
                                <option value="informal">Günlük (Informal)</option>
                                <option value="street">Sokak Ağzı (Street)</option>
                                <option value="academic">Akademik</option>
                                <option value="slang">Argoda</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-300">Zorluk Seviyesi</label>
                            <select name="difficulty_level" className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                                <option value="A1">A1</option>
                                <option value="A2">A2</option>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="C1">C1</option>
                                <option value="C2">C2</option>
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {loading ? "Paylaşılıyor..." : "Soruyu Paylaş"}
                    </button>
                </form>
            </div>
        </div>
    );
}

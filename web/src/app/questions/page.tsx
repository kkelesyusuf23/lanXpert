import { createClient } from "@/utils/supabase/server";
import { QuestionFeed } from "@/components/blocks/question-feed";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function QuestionsPage() {
    const supabase = await createClient();

    const { data: questions, error } = await supabase
        .from('questions')
        .select(`
      *,
      users!questions_asked_by_fkey(username, email),
      answers(count)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching questions:", error);
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur">
                <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="text-xl font-bold text-primary">lanXpert</Link>
                    <Link
                        href="/questions/new"
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium text-sm hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Soru Sor
                    </Link>
                </div>
            </header>

            <main>
                <QuestionFeed questions={questions || []} />
            </main>
        </div>
    );
}

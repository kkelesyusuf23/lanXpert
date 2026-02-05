import { SocialCard } from "./question-card";
import { Languages } from "lucide-react";

interface Question {
    question_id: string;
    source_text: string;
    source_language: string;
    target_language: string;
    usage_type: string;
    difficulty_level: string;
    created_at: string;
    users: {
        username: string;
        email: string;
    };
    answers?: { count: number }[];
}

export function QuestionFeed({ questions }: { questions: any[] }) {
    return (
        <div className="flex flex-col gap-6 py-8 px-4 max-w-4xl mx-auto">
            {questions.map((q) => (
                <SocialCard
                    key={q.question_id}
                    author={{
                        name: q.users.username || q.users.email.split('@')[0],
                        username: q.users.username,
                        avatar: `https://i.pravatar.cc/150?u=${q.asked_by}`,
                        timeAgo: new Date(q.created_at).toLocaleDateString(),
                    }}
                    content={{
                        text: q.source_text,
                        link: {
                            title: `${q.source_language} ➔ ${q.target_language}`,
                            description: `${q.usage_type || 'Genel'} · ${q.difficulty_level || 'A1'}`,
                            icon: <Languages className="w-5 h-5 text-primary" />,
                        },
                    }}
                    engagement={{
                        likes: 0,
                        comments: q.answers?.[0]?.count || 0,
                        shares: 0,
                    }}
                    onComment={() => {
                        window.location.href = `/questions/${q.question_id}`;
                    }}
                />
            ))}

            {questions.length === 0 && (
                <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-white/5">
                    <p className="text-neutral-500">Henüz soru bulunamadı. İlk soruyu sen sor!</p>
                </div>
            )}
        </div>
    );
}

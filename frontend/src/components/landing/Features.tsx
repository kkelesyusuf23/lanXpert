"use client";

import { motion } from "framer-motion";
import { BookOpen, Brain, Globe, MessageCircle, Trophy, Zap } from "lucide-react";
import { ReactNode } from "react";

const features = [
    {
        title: "Smart Flashcards",
        description: "AI-generated flashcards that adapt to your learning pace and focus on your weak spots.",
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        className: "md:col-span-2",
    },
    {
        title: "Immersive Reading",
        description: "Read articles and stories generated for your exact proficiency level.",
        icon: <BookOpen className="w-6 h-6 text-blue-400" />,
        className: "md:col-span-1",
    },
    {
        title: "Contextual Grammar",
        description: "Learn grammar rules naturally as they appear in real conversations and texts.",
        icon: <Brain className="w-6 h-6 text-purple-400" />,
        className: "md:col-span-1",
    },
    {
        title: "Real-world Topics",
        description: "Practice with content relevant to your interests, from tech to travel.",
        icon: <Globe className="w-6 h-6 text-green-400" />,
        className: "md:col-span-2",
    },
    {
        title: "Community Q&A",
        description: "Ask questions and get answers from the community and AI experts.",
        icon: <MessageCircle className="w-6 h-6 text-pink-400" />,
        className: "md:col-span-3",
    },
];

const FeatureCard = ({ title, description, icon, className, index }: { title: string, description: string, icon: ReactNode, className?: string, index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 hover:bg-zinc-800/50 transition-colors ${className}`}
    >
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors duration-500" />

        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            {icon}
        </div>
        <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed max-w-sm">
            {description}
        </p>
    </motion.div>
);

export default function Features() {
    return (
        <section className="py-24 bg-black relative">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center max-w-2xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        Everything you need to <br />
                        <span className="text-gray-500">become fluent fast.</span>
                    </motion.h2>
                    <p className="text-gray-400 text-lg">
                        LanXpert combines the best of traditional learning with cutting-edge AI to personalize your journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <FeatureCard key={i} {...feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

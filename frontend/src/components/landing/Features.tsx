"use client";

import { motion } from "framer-motion";
import { BookOpen, Globe, Star, TrendingUp, Users } from "lucide-react";
import { ReactNode } from "react";

const features = [
    {
        title: "Dual-Language Vocabulary",
        description: "Master new words by connecting them directly to your native language. Filter by proficiency (A1-C2) and part of speech for targeted learning.",
        icon: <Globe className="w-6 h-6 text-indigo-400" />,
        className: "md:col-span-2",
        gradient: "from-indigo-500/10 to-blue-500/10"
    },
    {
        title: "Community Q&A",
        description: "Stuck on a phrase? Ask the community! Get answers, vote for the best explanations, and help others on their journey.",
        icon: <Users className="w-6 h-6 text-pink-400" />,
        className: "md:col-span-1",
        gradient: "from-pink-500/10 to-rose-500/10"
    },
    {
        title: "Curated Articles",
        description: "Immerse yourself in articles tailored to your level. Enhance reading comprehension with real-world content.",
        icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
        className: "md:col-span-1",
        gradient: "from-emerald-500/10 to-green-500/10"
    },
    {
        title: "Smart Progress Tracking",
        description: "Visual analytics track your daily streaks, words learned, and questions answered. Watch your fluency grow.",
        icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
        className: "md:col-span-2",
        gradient: "from-amber-500/10 to-yellow-500/10"
    },
    {
        title: "Expert Verification",
        description: "Content is verified by advanced AI and community experts to ensure accuracy and cultural relevance.",
        icon: <Star className="w-6 h-6 text-purple-400" />,
        className: "md:col-span-3",
        gradient: "from-purple-500/10 to-violet-500/10"
    },
];

const FeatureCard = ({ title, description, icon, className, gradient, index }: { title: string, description: string, icon: ReactNode, className?: string, gradient: string, index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 hover:bg-zinc-800/80 transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-900/10 ${className}`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <div className="relative z-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="mb-3 text-2xl font-semibold text-white tracking-tight">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-base">
                {description}
            </p>
        </div>
    </motion.div>
);

export default function Features() {
    return (
        <section className="py-32 bg-black relative overflow-visible">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium"
                    >
                        Feature Rich Platform
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                    >
                        Everything you need <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">to achieve fluency.</span>
                    </motion.h2>
                    <p className="text-gray-400 text-xl leading-relaxed">
                        LanXpert combines professional-grade tools with community power. From vocabulary management to real-time discussions, we cover every aspect of language acquisition.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {features.map((feature, i) => (
                        <FeatureCard key={i} {...feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

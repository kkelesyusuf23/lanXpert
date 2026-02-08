"use client";

import { motion } from "framer-motion";
import { UserPlus, Target, Zap, Trophy } from "lucide-react";

const steps = [
    {
        title: "Create Your Profile",
        description: "Set your native language and the language you want to master. We support over 10 languages!",
        icon: <UserPlus className="w-6 h-6 text-blue-400" />,
    },
    {
        title: "Set Daily Goals",
        description: "Define how many minutes you want to learn each day. Consistency is key, and we help you stick to it.",
        icon: <Target className="w-6 h-6 text-purple-400" />,
    },
    {
        title: "Practice with AI",
        description: "Engage with personalized lessons, stories, and quizzes generated instantly by our advanced AI.",
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
    },
    {
        title: "Track & Compete",
        description: "Watch your stats grow, earn badges, and climb the leaderboard to stay motivated.",
        icon: <Trophy className="w-6 h-6 text-green-400" />,
    },
];

export default function HowItWorks() {
    return (
        <section className="py-24 bg-zinc-950 relative border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        How <span className="text-purple-500">LanXpert</span> works.
                    </motion.h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        A simple, proven path to language mastery designed for busy people.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 -z-10" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="relative flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-xl relative z-10 group hover:border-purple-500/50 transition-colors duration-300">
                                <div className="absolute inset-0 bg-white/5 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300" />
                                {step.icon}
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-bold text-gray-400">
                                    {i + 1}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

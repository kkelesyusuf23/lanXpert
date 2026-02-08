"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Aspiring Polyglot",
        content: "I've tried every app out there, but LanXpert's AI-generated stories are a game changer. I'm actually reading in Spanish after just 2 weeks!",
        image: "https://i.pravatar.cc/150?u=sarah",
    },
    {
        name: "David Chen",
        role: "Travel Enthusiast",
        content: "The contextual grammar explanations finally made French click for me. It feels like having a personal tutor available 24/7.",
        image: "https://i.pravatar.cc/150?u=david",
    },
    {
        name: "Elena Rodriguez",
        role: "Business Professional",
        content: "I needed to improve my Business English quickly. The customized articles focused on finance were exactly what I needed.",
        image: "https://i.pravatar.cc/150?u=elena",
    },
    {
        name: "Michael Chang",
        role: "Student",
        content: "The daily streak system and leaderboards keep me motivated. It's the only app I open every single day without fail.",
        image: "https://i.pravatar.cc/150?u=michael",
    },
    {
        name: "Jessica Lee",
        role: "Language Teacher",
        content: "I recommend LanXpert to all my students. The way it adapts to their individual levels is something I can't easily do in a classroom.",
        image: "https://i.pravatar.cc/150?u=jessica",
    },
    {
        name: "Omar Farooq",
        role: "Software Engineer",
        content: "The clean UI and fast performance are impressive. But the AI quality for German is what really sold me.",
        image: "https://i.pravatar.cc/150?u=omar",
    },
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        Loved by learners <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">worldwide.</span>
                    </motion.h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what our community has to say about their journey to fluency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors h-full">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <Avatar>
                                        <AvatarImage src={t.image} />
                                        <AvatarFallback>{t.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{t.name}</p>
                                        <p className="text-xs text-gray-400">{t.role}</p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-300 leading-relaxed italic">"{t.content}"</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

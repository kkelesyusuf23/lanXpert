"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Globe, MessageCircle, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-black text-white pt-32 pb-24 md:pt-48 md:pb-40">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-purple-600/20 blur-[140px] rounded-full opacity-40 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />
            <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-pink-600/10 blur-[120px] rounded-full opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur hover:bg-white/10 transition-colors cursor-default"
                >
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                    <span className="font-medium tracking-wide">LanXpert 2.0: Now with Community & Advanced Vocabulary</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-400"
                >
                    Master Languages <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        The Professional Way
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
                >
                    Build your personal dictionary with native-to-target translations, ask questions to a vibrant community, and immerse yourself in AI-curated articles.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-5"
                >
                    <Link href="/register">
                        <Button size="lg" className="h-14 px-10 text-lg bg-white text-black hover:bg-zinc-200 transition-all rounded-full font-semibold flex items-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            Start Learning Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button size="lg" variant="ghost" className="h-14 px-10 text-lg text-gray-300 hover:text-white hover:bg-white/10 rounded-full font-medium backdrop-blur-sm border border-transparent hover:border-white/20 transition-all">
                            Sign In
                        </Button>
                    </Link>
                </motion.div>

                {/* Floating UI Mockup/Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-24 relative mx-auto max-w-5xl"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                    <div className="relative bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        {/* App Header Mockup */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="h-6 w-1/3 bg-white/5 rounded-full mx-auto"></div>
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50"></div>
                        </div>

                        {/* App Content Mockup */}
                        <div className="p-8 md:p-12 bg-zinc-900/40 backdrop-blur-sm grid md:grid-cols-3 gap-8">
                            {/* Card 1: Vocabulary */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 hover:border-purple-500/30 transition-colors group">
                                <div className="mb-4 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">My Dictionary</h4>
                                <div className="space-y-2">
                                    <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                                    <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                                </div>
                            </div>

                            {/* Card 2: Community */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 hover:border-pink-500/30 transition-colors group">
                                <div className="mb-4 w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">Community Q&A</h4>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-white/10 rounded"></div>
                                    <div className="h-2 w-2/3 bg-white/10 rounded"></div>
                                </div>
                            </div>

                            {/* Card 3: Articles */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 hover:border-green-500/30 transition-colors group">
                                <div className="mb-4 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                                    <Book className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">Smart Articles</h4>
                                <div className="space-y-2">
                                    <div className="h-2 w-5/6 bg-white/10 rounded"></div>
                                    <div className="h-2 w-4/5 bg-white/10 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

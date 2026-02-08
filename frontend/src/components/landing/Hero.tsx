"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-black text-white pt-32 pb-20 md:pt-48 md:pb-32">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full opacity-30 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur"
                >
                    <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="font-medium">v1.0 Public Beta is Live</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
                >
                    Master Any Language <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        The LanXpert Way
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    An AI-powered platform designed to help you learn languages naturally.
                    Practice with immersive stories, smart flashcards, and interactive questions.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/register">
                        <Button size="lg" className="h-12 px-8 text-lg bg-white text-black hover:bg-gray-200 transition-all rounded-full font-medium flex items-center gap-2 group">
                            Start Learning for Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button size="lg" variant="ghost" className="h-12 px-8 text-lg text-gray-400 hover:text-white hover:bg-white/5 rounded-full">
                            Sign In
                        </Button>
                    </Link>
                </motion.div>

                {/* Floating UI Mockup/Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-20 relative mx-auto max-w-4xl"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-20"></div>
                    <div className="relative bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/50">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            <div className="ml-4 h-6 w-full max-w-[300px] bg-white/5 rounded-md"></div>
                        </div>
                        <div className="p-8 grid md:grid-cols-2 gap-8 items-center bg-zinc-950/80 backdrop-blur-sm">
                            <div className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-purple-500/20 rounded"></div>
                                    <h3 className="text-2xl font-bold">Daily Challenge</h3>
                                    <p className="text-gray-400 text-sm">Review 10 new Spanish words to keep your streak alive.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 rounded bg-white/10 animate-pulse"></div>
                                        <div className="h-8 flex-1 bg-white/10 rounded animate-pulse"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 rounded bg-white/10 animate-pulse"></div>
                                        <div className="h-8 flex-1 bg-white/10 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-48 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-lg border border-white/5 flex items-center justify-center">
                                <Sparkles className="w-16 h-16 text-purple-500/50 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

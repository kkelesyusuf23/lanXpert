"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-12 md:p-20 backdrop-blur-sm max-w-5xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to start your journey?
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Join thousands of learners who are mastering new languages faster with LanXpert. Start your free trial today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold">
                                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-white/20 hover:bg-white/10 text-white rounded-full">
                                Already have an account?
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

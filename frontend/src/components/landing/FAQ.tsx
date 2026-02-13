"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "Is LanXpert really free?",
        answer: "Yes! We offer a generous free tier that includes daily lessons, basic flashcards, and community access. We also have a Premium plan for unlimited access and advanced AI features.",
    },
    {
        question: "How many languages do you support?",
        answer: "Currently, we support over 10 major languages including Spanish, French, German, Italian, Portuguese, Chinese, Japanese, and more. We're constantly adding new ones based on community request.",
    },
    {
        question: "Can I use it offline?",
        answer: "At the moment, LanXpert requires an internet connection to generate AI content in real-time. We are working on an offline mode for saved lessons in our mobile app roadmap.",
    },
    {
        question: "Is the content suitable for beginners?",
        answer: "Absolutely! Our AI assesses your level during onboarding and tailors every single sentence, story, and question to match your proficiency, whether you're a complete beginner or an advanced learner.",
    },
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-6 text-left text-lg font-medium text-white hover:text-purple-400 transition-colors"
            >
                {question}
                {isOpen ? <Minus className="h-5 w-5 text-purple-500" /> : <Plus className="h-5 w-5 text-gray-500" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-gray-400 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQ() {
    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6"
                    >
                        Frequently Asked Questions
                    </motion.h2>
                    <p className="text-gray-400 text-lg">
                        Have a question? We&apos;re here to help.
                    </p>
                </div>

                <div className="space-y-2">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} {...faq} />
                    ))}
                </div>
            </div>
        </section>
    );
}

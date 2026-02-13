"use client";

export const dynamic = "force-dynamic";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";

const plans = [
    {
        name: "Basic",
        price: "Free",
        description: "Perfect for getting started with language learning.",
        features: [
            "Daily Words (5/day)",
            "Community Questions (2/day)",
            "Article Posting (1/day)",
            "Daily goal tracking",
        ],
        buttonText: "Current Plan",
        popular: false,
        gradient: "from-gray-500 to-gray-700",
    },
    {
        name: "Pro",
        price: "$9.99",
        period: "/month",
        description: "Unlock your full potential with advanced features.",
        features: [
            "Unlimited vocabulary lists",
            "Advanced grammar analysis",
            "Unlimited article reading",
            "Priority community support",
            "Ad-free experience",
            "Offline mode (Mobile)",
        ],
        buttonText: "Upgrade to Pro",
        popular: true,
        gradient: "from-blue-600 to-purple-600",
    },
    {
        name: "Enterprise",
        price: "$29.99",
        period: "/month",
        description: "For serious learners and teams who need the best.",
        features: [
            "All Pro features",
            "1-on-1 Tutor sessions (2/mo)",
            "Team progress tracking",
            "API Access",
            "Dedicated success manager",
            "Certification upon completion",
        ],
        buttonText: "Contact Sales",
        popular: false,
        gradient: "from-orange-500 to-red-600",
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6"
                    >
                        Choose Your Path to Fluency
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        Select the plan that best fits your learning goals. Upgrade, downgrade, or cancel at any time.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className={`relative p-8 rounded-2xl border ${plan.popular
                                ? "border-purple-500/50 bg-zinc-900/50"
                                : "border-white/10 bg-zinc-900/30"
                                } backdrop-blur-xl flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                                </div>
                                <p className="text-gray-400 mt-4 text-sm">{plan.description}</p>
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-4">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-gray-300">
                                            <div className={`mt-1 p-0.5 rounded-full bg-gradient-to-r ${plan.gradient}`}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                className={`w-full py-6 text-base font-semibold transition-all duration-300 ${plan.popular
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] border-0"
                                    : "bg-white/10 hover:bg-white/20 text-white border-0"
                                    }`}
                            >
                                {plan.buttonText}
                            </Button>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 max-w-3xl mx-auto text-center border-t border-white/10 pt-10">
                    <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                    <div className="grid gap-6 text-left">
                        <div className="bg-zinc-900/30 p-6 rounded-xl border border-white/5">
                            <h4 className="font-semibold text-white mb-2">Can I switch plans later?</h4>
                            <p className="text-gray-400 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes will be applied immediately.</p>
                        </div>
                        <div className="bg-zinc-900/30 p-6 rounded-xl border border-white/5">
                            <h4 className="font-semibold text-white mb-2">Do you offer student discounts?</h4>
                            <p className="text-gray-400 text-sm">Absolutely! Contact our support team with your student ID for a special 50% discount on Pro plans.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

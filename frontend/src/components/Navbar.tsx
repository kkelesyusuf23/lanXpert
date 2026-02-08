"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    LanXpert
                </Link>

                <nav className="hidden md:flex gap-6 items-center">
                    <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</Link>
                    <Link href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</Link>
                    <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-gray-300 hover:text-white">Login</Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}

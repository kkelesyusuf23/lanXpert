"use client";

import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Languages className="w-5 h-5 text-white" />
            </div>
            LanXpert
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-white text-black hover:bg-gray-200 rounded-full font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-zinc-950">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 LanXpert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

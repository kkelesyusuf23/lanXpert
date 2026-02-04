"use client"

import * as React from "react"
import { useState } from "react";
import { login, signup } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      if (mode === "login") {
        await login(formData);
      } else {
        await signup(formData);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden w-full">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/10 shadow-2xl p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-6 shadow-lg border border-primary/30">
          <span className="text-xl font-bold text-primary">L</span>
        </div>
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {mode === "login" ? "Hoş Geldiniz" : "Hesap Oluştur"}
        </h2>
        <p className="text-neutral-400 text-sm mb-8 text-center px-4">
          {mode === "login"
            ? "lanXpert topluluğuna katılmak için giriş yapın."
            : "Dil öğrenme yolculuğuna başlamak için kayıt olun."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="E-posta"
              type="email"
              required
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Şifre"
              type="password"
              required
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div className="text-sm text-red-500 font-medium px-1">{error}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 disabled:pointer-events-none shadow-primary/20"
          >
            {loading ? "Bekleyin..." : (mode === "login" ? "Giriş Yap" : "Kayıt Ol")}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-neutral-900/0 px-2 text-neutral-500">Veya</span></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3 font-medium text-white hover:bg-white/10 transition text-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google ile devam et
          </button>

          <div className="w-full text-center mt-4">
            <span className="text-sm text-neutral-400">
              {mode === "login" ? "Hesabınız yok mu? " : "Zaten üye misiniz? "}
              <a
                href={mode === "login" ? "/auth/register" : "/auth/login"}
                className="font-semibold text-primary hover:underline transition-all underline-offset-4"
              >
                {mode === "login" ? "Kayıt Ol" : "Giriş Yap"}
              </a>
            </span>
          </div>
        </form>
      </div>

      {/* Social proof */}
      <div className="relative z-10 mt-12 flex flex-col items-center text-center px-4">
        <p className="text-neutral-500 text-sm mb-4">
          Dünya çapında <span className="font-semibold text-neutral-300">5,000+</span> dil meraklısına katılın.
        </p>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-neutral-800 overflow-hidden">
              <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
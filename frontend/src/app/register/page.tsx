"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const password = watch("password");

    const onSubmit = async (data: Record<string, string>) => {
        setIsLoading(true);
        setError("");
        try {
            const payload = {
                username: data.username,
                email: data.email,
                password: data.password
            };

            await api.post("/users/", payload);

            // Auto login
            const params = new URLSearchParams();
            params.append("username", data.email);
            params.append("password", data.password);

            const loginRes = await api.post("/token", params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            const { access_token, refresh_token } = loginRes.data;
            localStorage.setItem("token", access_token);
            localStorage.setItem("refresh_token", refresh_token);

            router.push("/onboarding");

        } catch (err) {
            const regErr = err as { response?: { data?: { detail?: string } } };
            if (regErr.response && regErr.response.data && regErr.response.data.detail) {
                setError(regErr.response.data.detail);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative overflow-hidden bg-zinc-900 border-r border-white/5 p-12">
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-900/50">
                        <Rocket className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Start Learning Today</h2>
                    <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
                        Join our community of learners and master a new language with the power of AI.
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Create an account</h1>
                        <p className="text-gray-400">Enter your details to get started.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 chars" } })}
                                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                            />
                            {errors.username && <p className="text-xs text-red-400">{errors.username.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                            />
                            {errors.email && <p className="text-xs text-red-400">{errors.email.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                            />
                            {errors.password && <p className="text-xs text-red-400">{errors.password.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                {...register("confirmPassword", {
                                    required: "Please confirm password",
                                    validate: (val: string) => val === password || "Passwords do not match"
                                })}
                                className="bg-white/5 border-white/10 h-12 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                            />
                            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message as string}</p>}
                        </div>

                        {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-sm text-red-200">{error}</div>}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-white text-black hover:bg-gray-200 font-medium text-base rounded-full mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                        </Button>

                        <p className="text-center text-sm text-gray-400 mt-6">
                            Already have an account? <Link href="/login" className="text-white hover:underline underline-offset-4">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

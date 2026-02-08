"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { LANGUAGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { setValue, handleSubmit, watch, formState: { errors } } = useForm();

    const nativeLang = watch("native_language_id");
    const targetLang = watch("target_language_id");

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await api.put("/users/me", {
                native_language_id: data.native_language_id,
                target_language_id: data.target_language_id
            });

            // Check verification or send email
            try {
                await api.post("/users/verify-email/send");
            } catch (e) {
                console.error("Failed to send verification email", e);
            }
            router.push("/verify-email");
        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black/95 text-white p-4">
            <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Globe className="h-6 w-6 text-purple-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Customize Your Experience</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Select your languages to personalize your learning dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Native Language</Label>
                            <Select onValueChange={(val) => setValue("native_language_id", val)}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select your native language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem key={lang.id} value={lang.id}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Target Language</Label>
                            <Select onValueChange={(val) => setValue("target_language_id", val)}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select language to learn" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem key={lang.id} value={lang.id} disabled={lang.id === nativeLang}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                            disabled={isLoading || !nativeLang || !targetLang}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Continue to Dashboard
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

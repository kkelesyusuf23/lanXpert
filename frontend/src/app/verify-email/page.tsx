"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, CheckCircle, RefreshCcw } from "lucide-react";
import api from "@/lib/api";

export default function VerifyEmailPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");
    const [devLink, setDevLink] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch user to get email and check status
        api.get("/users/me").then(res => {
            if (res.data.email_verified) {
                router.push("/dashboard");
            }
            setEmail(res.data.email);
            // Trigger initial send for convenience
            handleResend();
        }).catch(() => {
            router.push("/login");
        });
    }, [router]);

    const handleResend = async () => {
        setLoading(true);
        try {
            const res = await api.post("/users/verify-email/send");
            console.log("Verification Link (Dev):", res.data.link);
            setDevLink(res.data.link); // Capture dev link
            setSuccess(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-white/10">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-purple-400" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Verify your email</CardTitle>
                    <CardDescription className="text-gray-400">
                        We've sent a verification link to <span className="text-white font-medium">{email}</span>.
                        Please check your inbox to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {success && devLink && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm flex flex-col gap-2">
                            <div className="flex items-center gap-2 font-bold">
                                <CheckCircle className="w-4 h-4" />
                                Development Mode:
                            </div>
                            <p>Since SMTP is not configured, click here to verify:</p>
                            <a href={devLink} className="text-blue-400 underline break-all hover:text-blue-300">
                                {devLink}
                            </a>
                        </div>
                    )}

                    <Button
                        onClick={handleResend}
                        className="w-full bg-white text-black hover:bg-gray-200"
                        disabled={loading}
                    >
                        {loading ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Resend Verification Email
                    </Button>

                    <Button variant="ghost" className="w-full text-gray-500" onClick={() => router.push("/login")}>
                        Back to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

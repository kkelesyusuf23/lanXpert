"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function ConfirmContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        // Call verify API
        api.post("/users/verify-email/verify", { token })
            .then(() => {
                setStatus('success');
                setTimeout(() => {
                    router.push("/dashboard");
                }, 3000); // Redirect after 3s
            })
            .catch((err) => {
                console.error(err);
                setStatus('error');
            });
    }, [token, router]);

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md w-full bg-zinc-900 border border-white/10 rounded-2xl">
            {status === 'verifying' && (
                <>
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Verifying...</h2>
                    <p className="text-gray-400">Please wait while we confirm your email.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                    <p className="text-gray-400 mb-6">Redirecting you to the dashboard...</p>
                    <Button onClick={() => router.push("/dashboard")} className="w-full bg-white text-black hover:bg-gray-200">
                        Go to Dashboard
                    </Button>
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                    <p className="text-gray-400 mb-6">The link may be invalid or expired.</p>
                    <Button onClick={() => router.push("/login")} variant="outline" className="w-full border-white/10 hover:bg-white/5">
                        Back to Login
                    </Button>
                </>
            )}
        </div>
    );
}

export default function VerifyEmailConfirmPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <ConfirmContent />
            </Suspense>
        </div>
    )
}

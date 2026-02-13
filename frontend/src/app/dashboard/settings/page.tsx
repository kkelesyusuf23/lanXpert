"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { User, Bell, Monitor, Sun, Moon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { LANGUAGES } from "@/lib/constants";
import { toast } from "sonner";

export default function SettingsPage() {
    const [theme, setThemeState] = useState("dark");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        username: "",
        email: "",
        native_language_id: "",
        target_language_id: ""
    });

    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me");
            setProfile({
                username: res.data.username,
                email: res.data.email,
                native_language_id: res.data.native_language_id || "",
                target_language_id: res.data.target_language_id || ""
            });
        } catch {
            toast.error("Failed to load user profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Only update updateable fields
            // Assuming endpoint accepts partial updates or validation ignores readonly email if passed
            // Usually email/username might be restricted. If so, only send languages.
            // Let's try sending languages only first if username/email are readonly in typical setup
            // Or send all if the endpoint supports it. 
            // Based on previous files, typically /users/me updates languages/names/etc.

            const payload = {
                username: profile.username, // might need separate endpoint to change if unique check is strict
                email: profile.email,
                native_language_id: profile.native_language_id,
                target_language_id: profile.target_language_id
            };

            // Assuming PUT /users/me updates user
            await api.put("/users/me", payload);
            toast.success("Profile updated successfully");
        } catch (e) {
            const err = e as { response?: { data?: { detail?: string } } };
            toast.error("Failed to update profile", { description: err.response?.data?.detail });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-0">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    Settings & Preferences
                </h1>
                <p className="text-gray-400 mt-1">Manage your account settings and set e-mail preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Card */}
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-500" />
                            <CardTitle className="text-white">Profile Information</CardTitle>
                        </div>
                        <CardDescription className="text-gray-400">Update your photo and personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-300">Username</Label>
                                <Input
                                    id="username"
                                    value={profile.username}
                                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                    className="bg-black/50 border-white/10 text-white focus-visible:ring-purple-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email</Label>
                                <Input
                                    id="email"
                                    value={profile.email}
                                    readOnly
                                    disabled
                                    className="bg-black/50 border-white/10 text-gray-400 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="native" className="text-gray-300">Native Language</Label>
                                <Select
                                    value={profile.native_language_id}
                                    onValueChange={(val) => setProfile({ ...profile, native_language_id: val })}
                                >
                                    <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        {LANGUAGES.map(l => (
                                            <SelectItem key={l.id} value={l.id} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">{l.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target" className="text-gray-300">Target Language</Label>
                                <Select
                                    value={profile.target_language_id}
                                    onValueChange={(val) => setProfile({ ...profile, target_language_id: val })}
                                >
                                    <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        {LANGUAGES.map(l => (
                                            <SelectItem key={l.id} value={l.id} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">{l.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/10 pt-4 flex justify-end bg-black/20">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
                            Save Profile
                        </Button>
                    </CardFooter>
                </Card>

                {/* Notifications */}
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-purple-500" />
                            <CardTitle className="text-white">Notifications</CardTitle>
                        </div>
                        <CardDescription className="text-gray-400">Choose what you want to be notified about.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium text-white">Email Notifications</span>
                                <span className="text-sm text-gray-500">Receive daily summaries and achievement alerts via email.</span>
                            </div>
                            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} className="data-[state=checked]:bg-purple-600" />
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium text-white">Push Notifications</span>
                                <span className="text-sm text-gray-500">Receive real-time updates directly to your device.</span>
                            </div>
                            <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} className="data-[state=checked]:bg-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card className="bg-zinc-900 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-purple-500" />
                            <CardTitle className="text-white">Appearance</CardTitle>
                        </div>
                        <CardDescription className="text-gray-400">Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div
                                onClick={() => setThemeState("light")}
                                className={`cursor-pointer rounded-lg border-2 p-1 flex flex-col items-center gap-2 py-4 transition-all ${theme === "light" ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-white/30 text-gray-400 hover:text-white"}`}
                            >
                                <Sun className="w-6 h-6" />
                                <span className="text-sm font-medium">Light</span>
                            </div>
                            <div
                                onClick={() => setThemeState("dark")}
                                className={`cursor-pointer rounded-lg border-2 p-1 flex flex-col items-center gap-2 py-4 transition-all ${theme === "dark" ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-white/30 text-gray-400 hover:text-white"}`}
                            >
                                <Moon className="w-6 h-6" />
                                <span className="text-sm font-medium">Dark</span>
                            </div>
                            <div
                                onClick={() => setThemeState("system")}
                                className={`cursor-pointer rounded-lg border-2 p-1 flex flex-col items-center gap-2 py-4 transition-all ${theme === "system" ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-white/30 text-gray-400 hover:text-white"}`}
                            >
                                <Monitor className="w-6 h-6" />
                                <span className="text-sm font-medium">System</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    )
}

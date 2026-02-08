
"use client";

import { useState } from "react";
import { User, Bell, Shield, Smartphone, Globe, Moon, Sun, Monitor, Save } from "lucide-react";
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

export default function SettingsPage() {
    const [theme, setTheme] = useState("dark");
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    Settings & Preferences
                </h1>
                <p className="text-gray-400 mt-1">Manage your account settings and set e-mail preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Card */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-500" />
                            <CardTitle className="text-white">Profile Information</CardTitle>
                        </div>
                        <CardDescription>Update your photo and personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" defaultValue="johndoe" className="bg-black/20 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue="john@example.com" className="bg-black/20 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="native">Native Language</Label>
                                <Select defaultValue="en">
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="tr">Turkish</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target">Target Language</Label>
                                <Select defaultValue="es">
                                    <SelectTrigger className="bg-black/20 border-white/10">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="tr">Turkish</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 pt-4 flex justify-end">
                        <Button className="bg-purple-600 hover:bg-purple-700">Save Profile</Button>
                    </CardFooter>
                </Card>

                {/* Notifications */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-purple-500" />
                            <CardTitle className="text-white">Notifications</CardTitle>
                        </div>
                        <CardDescription>Choose what you want to be notified about.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium text-white">Email Notifications</span>
                                <span className="text-sm text-gray-500">Receive daily summaries and achievement alerts via email.</span>
                            </div>
                            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                        </div>
                        <Separator className="bg-white/10" />
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium text-white">Push Notifications</span>
                                <span className="text-sm text-gray-500">Receive real-time updates directly to your device.</span>
                            </div>
                            <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-purple-500" />
                            <CardTitle className="text-white">Appearance</CardTitle>
                        </div>
                        <CardDescription>Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div
                                onClick={() => setTheme("light")}
                                className={`cursor-pointer rounded-lg border-2 p-1 flex flex-col items-center gap-2 py-4 ${theme === "light" ? "border-purple-500 bg-white/10" : "border-white/10 hover:border-white/30"}`}
                            >
                                <Sun className="w-6 h-6" />
                                <span className="text-sm">Light</span>
                            </div>
                            <div
                                onClick={() => setTheme("dark")}
                                className={`cursor-pointer rounded-lg border-2 p-1 flex flex-col items-center gap-2 py-4 ${theme === "dark" ? "border-purple-500 bg-white/10" : "border-white/10 hover:border-white/30"}`}
                            >
                                <Moon className="w-6 h-6" />
                                <span className="text-sm">Dark</span>
                            </div>
                            <div
                                onClick={() => setTheme("system")}
                                className={`cursor-pointer rounded-lg border-2 p-1 flex flex-col items-center gap-2 py-4 ${theme === "system" ? "border-purple-500 bg-white/10" : "border-white/10 hover:border-white/30"}`}
                            >
                                <Monitor className="w-6 h-6" />
                                <span className="text-sm">System</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

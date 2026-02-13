"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import {
    Users, Shield, Layout, Globe, BookOpen, MessageCircle,
    FileText, MessageSquare, Bell, Settings, Database
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const resources = [
    { name: "Users", slug: "users", icon: Users, desc: "Manage user accounts and profiles" },
    { name: "Roles", slug: "roles", icon: Shield, desc: "System roles and permissions" },
    { name: "User Roles", slug: "user_roles", icon: Shield, desc: "Assign roles to users" },
    { name: "Plans", slug: "plans", icon: Layout, desc: "Subscription plans and limits" },
    { name: "Daily Limits", slug: "user_daily_limits", icon: Layout, desc: "User resource usage tracking" },
    { name: "Languages", slug: "languages", icon: Globe, desc: "Supported languages" },
    { name: "Words", slug: "words", icon: BookOpen, desc: "Dictionary entries" },
    { name: "Questions", slug: "questions", icon: MessageCircle, desc: "Community Q&A" },
    { name: "Answers", slug: "answers", icon: MessageCircle, desc: "Responses to questions" },
    { name: "Articles", slug: "articles", icon: FileText, desc: "User submitted articles" },
    { name: "Chats", slug: "chats", icon: MessageSquare, desc: "Active and past conversations" },
    { name: "Messages", slug: "messages", icon: MessageSquare, desc: "Chat content logs" },
    { name: "Reports", slug: "user_reports", icon: Database, desc: "User reports and complaints" },
    { name: "Notifications", slug: "notifications", icon: Bell, desc: "System notifications" },
    { name: "Site Settings", slug: "site_settings", icon: Settings, desc: "Global configuration" },
    { name: "Moderation", slug: "content_moderation", icon: Shield, desc: "Content review queue" },
];

export default function DatabaseDashboard() {
    return (
        <div className="p-8 space-y-8 bg-black min-h-screen text-white">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent mb-2">
                    Database Management
                </h1>
                <p className="text-gray-400">Direct CRUD access to all system resources.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {resources.map((res) => {
                    const Icon = res.icon;
                    return (
                        <Link href={`/admin/database/${res.slug}`} key={res.slug} className="block group">
                            <Card className="bg-zinc-900/50 border-white/10 hover:border-red-500/50 transition-all hover:bg-zinc-900 group-hover:-translate-y-1 duration-200 h-full">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <Badge variant="outline" className="text-[10px] border-white/10 text-gray-500">
                                            {res.slug}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-4 text-xl text-white group-hover:text-red-400 transition-colors">
                                        {res.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500">{res.desc}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

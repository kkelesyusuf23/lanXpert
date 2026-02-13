"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
    // Placeholder state - fetch from API in real implementation
    const [settings, setSettings] = useState({
        siteName: "LanXpert",
        maintenanceMode: false,
        allowRegistration: true,
        defaultUserPlan: "Free"
    });

    const handleSave = () => {
        alert("Settings saved (Simulated)");
        // api.put('/admin/settings', settings)
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">System Settings</h1>
                <p className="text-gray-400">Configure global application parameters.</p>
            </div>

            <div className="grid gap-6">
                <Card className="bg-zinc-900/50 border-white/10">
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Basic site information and defaults.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Site Name</Label>
                            <Input
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Allow New Registrations</Label>
                                <p className="text-xs text-gray-500">If disabled, new users cannot sign up.</p>
                            </div>
                            <Switch
                                checked={settings.allowRegistration}
                                onCheckedChange={(c) => setSettings({ ...settings, allowRegistration: c })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-900/10 border-red-500/20">
                    <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>Actions that affect the entire system availability.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-red-300">Maintenance Mode</Label>
                                <p className="text-xs text-red-400/60">Take the site offline for all non-admin users.</p>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onCheckedChange={(c) => setSettings({ ...settings, maintenanceMode: c })}
                                className="data-[state=checked]:bg-red-600"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}

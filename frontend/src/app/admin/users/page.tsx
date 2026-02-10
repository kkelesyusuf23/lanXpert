"use client";

import { useState, useEffect } from "react";
import { Search, Ban, Unlock, Shield, ShieldOff, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function UsersAdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            const res = await api.get(`/admin/users?${params.toString()}`);
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const toggleActive = async (userId: string) => {
        setActionLoading(userId);
        try {
            await api.put(`/admin/users/${userId}/toggle-active`);
            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
        } catch (error) {
            console.error("Failed to toggle status", error);
        } finally {
            setActionLoading(null);
        }
    };

    const toggleRoleForUser = async (userId: string, currentRoles: any[], roleToToggle: 'admin' | 'moderator') => {
        const hasRole = currentRoles && currentRoles.some((r: any) => r.role?.name === roleToToggle || r.name === roleToToggle);
        const action = hasRole ? `Remove ${roleToToggle} role` : `Make ${roleToToggle}`;

        if (!confirm(`Are you sure you want to ${action} for this user?`)) return;

        setActionLoading(userId);
        try {
            if (hasRole) {
                await api.delete(`/admin/users/${userId}/roles/${roleToToggle}`);
            } else {
                await api.put(`/admin/users/${userId}/promote`, null, { params: { role: roleToToggle } });
            }
            fetchUsers();
        } catch (error) {
            console.error("Failed to change role", error);
            alert("Failed to update role.");
        } finally {
            setActionLoading(null);
        }
    };

    const resetUserLimits = async (userId: string) => {
        if (!confirm("Reset daily limits for this user? This will allow them to post more content today.")) return;

        setActionLoading(userId);
        try {
            await api.post(`/admin/users/${userId}/reset-limits`);
            alert("Limits successfully reset!");
        } catch (error) {
            console.error("Failed to reset limits", error);
            alert("Failed to reset limits.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-gray-400">Manage user accounts, roles, and access.</p>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 w-full md:w-96">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 h-8 p-0 placeholder:text-gray-500"
                />
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden bg-black/20">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i} className="border-white/10">
                                    <TableCell colSpan={7} className="h-12 animate-pulse bg-white/5" />
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">No users found.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{user.username}</TableCell>
                                    <TableCell className="text-gray-400">{user.email}</TableCell>
                                    <TableCell className="text-gray-400 text-xs">
                                        {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map((r: any, idx: number) => (
                                                    <Badge key={idx} variant="outline" className="border-blue-500/30 text-blue-400 capitalize">
                                                        {r.role?.name || r.name}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <Badge variant="outline" className="border-gray-500/30 text-gray-400">User</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} border-0`}>
                                            {user.is_active ? 'Active' : 'Banned'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleActive(user.id)}
                                            disabled={actionLoading === user.id}
                                            title={user.is_active ? "Ban User" : "Activate User"}
                                            className={`h-8 w-8 ${user.is_active ? 'text-red-400 hover:bg-red-900/20' : 'text-green-400 hover:bg-green-900/20'}`}
                                        >
                                            {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.is_active ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                        </Button>

                                        {/* Moderator Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleRoleForUser(user.id, user.roles, 'moderator')}
                                            disabled={actionLoading === user.id}
                                            title={user.roles?.some((r: any) => r.role?.name === 'moderator') ? "Remove Moderator" : "Make Moderator"}
                                            className={`h-8 w-8 ${user.roles?.some((r: any) => r.role?.name === 'moderator') ? 'text-orange-400 hover:bg-orange-900/20' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            <Shield className="w-4 h-4" />
                                        </Button>

                                        {/* Admin Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleRoleForUser(user.id, user.roles, 'admin')}
                                            disabled={actionLoading === user.id}
                                            title={user.roles?.some((r: any) => r.role?.name === 'admin') ? "Remove Admin" : "Make Admin"}
                                            className={`h-8 w-8 ${user.roles?.some((r: any) => r.role?.name === 'admin') ? 'text-blue-400 hover:bg-blue-900/20' : 'text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {user.roles?.some((r: any) => r.role?.name === 'admin') ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => resetUserLimits(user.id)}
                                            disabled={actionLoading === user.id}
                                            title="Reset Daily Limits"
                                            className="h-8 w-8 text-yellow-400 hover:bg-yellow-900/20"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

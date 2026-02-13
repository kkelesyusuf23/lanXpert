"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, RefreshCw, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";


interface Column {
    name: string;
    type: "string" | "number" | "boolean" | "date";
    required: boolean;
    pk: boolean;
    fk: boolean;
}

export default function GenericResourcePage() {
    const params = useParams();
    const router = useRouter();
    const resource = params.resource as string;

    const [columns, setColumns] = useState<Column[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 20;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchSchema = useCallback(async () => {
        try {
            const res = await api.get(`/admin/generic/${resource}/schema`);
            setColumns(res.data.columns);
        } catch (error) {
            toast.error("Failed to load schema");
            console.error(error);
        }
    }, [resource]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const skip = (page - 1) * limit;
            const res = await api.get(`/admin/generic/${resource}?skip=${skip}&limit=${limit}`);
            setData(res.data.items);
            setTotal(res.data.total);
        } catch (error) {
            toast.error("Failed to load data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [resource, page]);

    useEffect(() => {
        if (resource) {
            fetchSchema();
            fetchData();
        }
    }, [resource, page, fetchSchema, fetchData]);

    const handleCreate = () => {
        setEditingItem(null);
        // Initialize form data with defaults
        const defaults: any = {};
        columns.forEach(col => {
            if (col.type === 'boolean') defaults[col.name] = false;
            else defaults[col.name] = "";
        });
        setFormData(defaults);
        setIsDialogOpen(true);
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
        } catch { return ""; }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        const formValues = { ...item };
        // Format dates for input
        columns.forEach(col => {
            if (col.type === 'date' && formValues[col.name]) {
                formValues[col.name] = formatDateForInput(formValues[col.name]);
            }
        });
        setFormData(formValues);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this record? This cannot be undone.")) return;

        try {
            await api.delete(`/admin/generic/${resource}/${id}`);
            toast.success("Record deleted");
            fetchData();
        } catch (error) {
            const err = error as { response?: { data?: { detail?: string } } };
            toast.error("Failed to delete record", { description: err.response?.data?.detail });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Clean data: remove undefined/nulls if creating, handle types
            const payload: any = {};
            columns.forEach(col => {
                // Skip read-only PKs for create
                if (col.pk && !editingItem) return;

                let val = formData[col.name];

                // Handle optional empty string fields as null/undefined
                if (!col.required && val === "") {
                    if (col.type !== 'string') {
                        payload[col.name] = null;
                        return;
                    }
                }

                if (col.type === 'number') {
                    val = val === "" ? null : Number(val);
                }

                payload[col.name] = val;
            });

            if (editingItem) {
                // Find PK
                const pkCol = columns.find(c => c.pk);
                if (!pkCol) throw new Error("No primary key found");
                const id = editingItem[pkCol.name];

                await api.put(`/admin/generic/${resource}/${id}`, payload);
                toast.success("Updated successfully");
            } else {
                await api.post(`/admin/generic/${resource}`, payload);
                toast.success("Created successfully");
            }

            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            const err = error as { response?: { data?: { detail?: string } } };
            toast.error("Failed to save", { description: err.response?.data?.detail });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (colName: string, value: unknown) => {
        setFormData((prev: any) => ({ ...prev, [colName]: value }));
    };

    // Sort columns: PK first, then others
    const sortedColumns = [...columns].sort((a, b) => (a.pk === b.pk ? 0 : a.pk ? -1 : 1));

    return (
        <div className="p-6 h-screen flex flex-col bg-zinc-950 text-white">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admin/database")}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold capitalize">{resource.replace(/_/g, " ")}</h1>
                    <p className="text-sm text-gray-400">Manage {resource} records</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                    </Button>
                    <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 gap-2 text-white">
                        <Plus className="w-4 h-4" /> Create New
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto border border-white/10 rounded-lg bg-zinc-900/50">
                <Table>
                    <TableHeader className="bg-zinc-900 sticky top-0">
                        <TableRow className="hover:bg-zinc-900 border-white/10">
                            {sortedColumns.map(col => (
                                <TableHead key={col.name} className="text-gray-300 font-bold whitespace-nowrap min-w-[100px]">
                                    {col.name} {col.pk && <span className="text-xs text-red-400 ml-1">(PK)</span>} {col.fk && <span className="text-xs text-blue-400 ml-1">(FK)</span>}
                                </TableHead>
                            ))}
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500" />
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-gray-500">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, i) => {
                                const pkCol = columns.find(c => c.pk);
                                const pkVal = pkCol ? row[pkCol.name] : i;

                                return (
                                    <TableRow key={pkVal} className="hover:bg-white/5 border-white/10 transition-colors">
                                        {sortedColumns.map(col => {
                                            let val = row[col.name];
                                            if (col.type === 'boolean') val = val ? "Yes" : "No";
                                            if (typeof val === 'object' && val !== null) val = JSON.stringify(val); // Handle dict/json

                                            // Truncate long text
                                            const displayVal = String(val);
                                            const isLong = displayVal.length > 50;

                                            return (
                                                <TableCell key={col.name} className="text-gray-300 font-mono text-xs truncate max-w-[200px]" title={String(val)}>
                                                    {isLong ? displayVal.substring(0, 50) + "..." : displayVal}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-white/10" onClick={() => handleEdit(row)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-white/10" onClick={(e) => handleDelete(pkVal, e)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4 px-2">
                <div className="text-sm text-gray-400">
                    Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page * limit >= total}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-zinc-900 border-white/10 max-h-[85vh] flex flex-col text-white">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Record" : "Create New Record"}</DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
                        <form id="resource-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                            {sortedColumns.map(col => {
                                // Hide PK on create if autogenerated (usually assume yes for generic)
                                // But if it's editing, show as readonly
                                if (col.pk && !editingItem) return null; // Assume generated on create

                                return (
                                    <div key={col.name} className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {col.name} {col.required && <span className="text-red-500">*</span>}
                                        </Label>

                                        {col.type === 'boolean' ? (
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={!!formData[col.name]}
                                                    onCheckedChange={(c) => handleInputChange(col.name, c)}
                                                    disabled={col.pk}
                                                />
                                                <span className="text-sm text-gray-300">{formData[col.name] ? 'True' : 'False'}</span>
                                            </div>
                                        ) : (col.name.includes("description") || col.name.includes("content") || col.name.includes("text")) ? (
                                            <Textarea
                                                value={formData[col.name] || ""}
                                                onChange={(e) => handleInputChange(col.name, e.target.value)}
                                                className="bg-black/50 border-white/10 font-mono text-sm"
                                                required={col.required && !col.pk}
                                                disabled={col.pk} // PK always disabled in edit
                                            />
                                        ) : (
                                            <Input
                                                type={col.type === 'number' ? 'number' : col.type === 'date' ? 'datetime-local' : 'text'}
                                                value={formData[col.name] || ""}
                                                onChange={(e) => handleInputChange(col.name, e.target.value)}
                                                className="bg-black/50 border-white/10 font-mono text-sm"
                                                required={col.required && !col.pk}
                                                disabled={col.pk}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </form>
                    </ScrollArea>

                    <DialogFooter className="border-t border-white/10 pt-4 mt-auto">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" form="resource-form" disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white">
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingItem ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

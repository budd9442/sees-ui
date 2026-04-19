'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ShieldCheck, Mail } from 'lucide-react';
import { upsertReportCategory, deleteReportCategory } from '@/lib/actions/admin-actions';

interface Category {
    id: string;
    name: string;
    description: string;
    assignedTo: string;
    isActive: boolean;
    updatedAt: string;
}

interface Staff {
    id: string;
    name: string;
    email: string;
}

interface PageData {
    categories: Category[];
    staffMembers: Staff[];
}

export default function ReportCategoriesConfig({ initialData }: { initialData: PageData }) {
    const [categories, setCategories] = useState<Category[]>(initialData.categories);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

    const handleSave = async () => {
        if (!editingCategory?.name) {
            toast.error("Category name is required");
            return;
        }

        setLoading(true);
        try {
            const res = await upsertReportCategory({
                id: editingCategory.id,
                name: editingCategory.name,
                description: editingCategory.description,
                assignedTo: editingCategory.assignedTo,
                isActive: editingCategory.isActive
            });

            if (res.success) {
                toast.success(editingCategory.id ? "Category updated" : "Category created");
                // Refresh list locally
                const newCat: Category = {
                    id: res.data.id,
                    name: res.data.name,
                    description: res.data.description || '',
                    assignedTo: res.data.assigned_to || '',
                    isActive: res.data.is_active,
                    updatedAt: new Date().toISOString()
                };

                if (editingCategory.id) {
                    setCategories(prev => prev.map(c => c.id === editingCategory.id ? newCat : c));
                } else {
                    setCategories(prev => [...prev, newCat]);
                }
                setIsDialogOpen(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save category");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            await deleteReportCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success("Category deleted");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageHeader 
                    title="Report Categories" 
                    description="Configure categories and assign responsible staff for anonymous reports" 
                />
                <Button onClick={() => { setEditingCategory({ isActive: true }); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Categories</CardTitle>
                    <CardDescription>Reports filed under these categories will be automatically routed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        <div>{category.name}</div>
                                        <div className="text-xs text-muted-foreground">{category.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        {category.assignedTo ? (
                                            <div className="flex items-center text-sm">
                                                <ShieldCheck className="mr-2 h-3 w-3 text-blue-500" />
                                                {initialData.staffMembers.find(s => s.id === category.assignedTo)?.name || category.assignedTo}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Unassigned (Admin only)</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {category.isActive ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(category.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(category); setIsDialogOpen(true); }}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(category.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                        <DialogDescription>Define a report category and specify who should handle it.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input 
                                placeholder="e.g. Academic Misconduct" 
                                value={editingCategory?.name || ''}
                                onChange={e => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                                placeholder="What kind of issues fall under this category?" 
                                value={editingCategory?.description || ''}
                                onChange={e => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Assigned Person (Routing)</Label>
                            <Select 
                                value={editingCategory?.assignedTo || 'none'} 
                                onValueChange={val => setEditingCategory(prev => ({ ...prev, assignedTo: val === 'none' ? '' : val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">System Administrators (Default)</SelectItem>
                                    {initialData.staffMembers.map(staff => (
                                        <SelectItem key={staff.id} value={staff.id}>
                                            {staff.name} ({staff.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Enabled</Label>
                            <Switch 
                                checked={editingCategory?.isActive ?? true}
                                onCheckedChange={val => setEditingCategory(prev => ({ ...prev, isActive: val }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Category'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

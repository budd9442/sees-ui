'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { upsertModule } from '@/lib/actions/admin-modules';
import { Loader2, Plus, Pencil } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModuleDialogProps {
    module?: any;
    trigger?: React.ReactNode;
}

export function ModuleDialog({ module, trigger }: ModuleDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        credits: 4,
        description: '',
        level: 'L1'
    });

    useEffect(() => {
        if (module) {
            setFormData({
                code: module.code,
                name: module.name,
                credits: module.credits,
                description: module.description || '',
                level: module.level || 'L1'
            });
        } else {
            setFormData({
                code: '',
                name: '',
                credits: 4,
                description: '',
                level: 'L1'
            });
        }
    }, [module, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await upsertModule({
                moduleId: module?.module_id,
                code: formData.code,
                name: formData.name,
                credits: Number(formData.credits),
                description: formData.description,
                active: true,
                // @ts-ignore - Schema update needed if passing level, but action handles it if updated
                level: formData.level
            });
            setOpen(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Module
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{module ? 'Edit Module' : 'Add New Module'}</DialogTitle>
                    <DialogDescription>
                        {module ? 'Update module details.' : 'Create a new academic module.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Module Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. SE101"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="level">Default Level</Label>
                            <Select
                                value={formData.level}
                                onValueChange={(val) => setFormData({ ...formData, level: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L1">Level 1</SelectItem>
                                    <SelectItem value="L2">Level 2</SelectItem>
                                    <SelectItem value="L3">Level 3</SelectItem>
                                    <SelectItem value="L4">Level 4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Module Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Software Engineering"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="credits">Credits</Label>
                        <Input
                            id="credits"
                            type="number"
                            value={formData.credits}
                            onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                            required
                            min={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {module ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

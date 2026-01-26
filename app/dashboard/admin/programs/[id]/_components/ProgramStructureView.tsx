'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addModuleToStructure, removeModuleFromStructure } from '@/lib/actions/admin-programs';
import { toast } from 'sonner';

type StructureItem = {
    structure_id: string;
    module: {
        module_id: string;
        code: string;
        name: string;
        credits: number;
    };
    academic_level: string;
    semester_number: number;
    module_type: string;
    specialization_id: string | null;
};

type Props = {
    programId: string;
    structure: StructureItem[];
    modules: { module_id: string, code: string, name: string }[];
    specializations: { specialization_id: string, name: string, code: string }[];
};

export function ProgramStructureView({ programId, structure, modules, specializations }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Add Form State
    const [selectedModule, setSelectedModule] = useState('');
    const [level, setLevel] = useState('L1');
    const [semester, setSemester] = useState('1');
    const [type, setType] = useState<'CORE' | 'ELECTIVE'>('CORE');
    const [spec, setSpec] = useState<string>('none');

    const handleAdd = async () => {
        if (!selectedModule) return toast.error("Select a module");

        setIsAdding(true);
        try {
            await addModuleToStructure({
                programId,
                moduleId: selectedModule,
                academicLevel: level,
                semesterNumber: parseInt(semester),
                moduleType: type,
                specializationId: spec === 'none' ? null : spec
            });
            toast.success("Module added to structure");
            setSelectedModule('');
        } catch (error) {
            toast.error("Failed to add module");
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this module from the structure?')) return;
        setIsDeleting(true);
        try {
            await removeModuleFromStructure(id);
            toast.success('Module removed');
        } catch (error) {
            toast.error('Failed to remove module');
        } finally {
            setIsDeleting(false);
        }
    };

    // Grouping for Display
    const levels = ['L1', 'L2', 'L3', 'L4']; // Fixed levels for consistency

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Module to Structure</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Module to Structure</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Module</Label>
                                <Select value={selectedModule} onValueChange={setSelectedModule}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.map(m => (
                                            <SelectItem key={m.module_id} value={m.module_id}>
                                                {m.code} - {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Level</Label>
                                <Select value={level} onValueChange={setLevel}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="L1">Level 1</SelectItem>
                                        <SelectItem value="L2">Level 2</SelectItem>
                                        <SelectItem value="L3">Level 3</SelectItem>
                                        <SelectItem value="L4">Level 4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Semester</Label>
                                <Select value={semester} onValueChange={setSemester}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Semester 1</SelectItem>
                                        <SelectItem value="2">Semester 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Type</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CORE">Core</SelectItem>
                                        <SelectItem value="ELECTIVE">Elective</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Specialization</Label>
                                <Select value={spec} onValueChange={setSpec}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="None (Common)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Common Core)</SelectItem>
                                        {specializations.map(s => (
                                            <SelectItem key={s.specialization_id} value={s.specialization_id}>
                                                {s.name} ({s.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleAdd} disabled={isAdding}>
                            {isAdding ? "Adding..." : "Add Module"}
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            {levels.map(lvl => {
                const levelItems = structure.filter(s => s.academic_level === lvl);
                const semesters = [1, 2];

                if (levelItems.length === 0) return null;

                return (
                    <div key={lvl} className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Level {lvl.replace('L', '')}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {semesters.map(sem => {
                                const semItems = levelItems.filter(s => s.semester_number === sem);
                                return (
                                    <Card key={sem}>
                                        <CardHeader className="pb-3 pt-4 px-4">
                                            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Semester {sem}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-4 pb-4">
                                            <ul className="space-y-2">
                                                {semItems.map(item => (
                                                    <li key={item.structure_id} className="flex items-center justify-between text-sm border p-2 rounded bg-card/50">
                                                        <div>
                                                            <div className="font-medium flex items-center gap-2">
                                                                <span className="font-mono text-xs">{item.module.code}</span>
                                                                {item.specialization_id && (
                                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">
                                                                        {specializations.find(s => s.specialization_id === item.specialization_id)?.code || 'SPEC'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-muted-foreground text-xs truncate max-w-[180px]">{item.module.name}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={item.module_type === 'CORE' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                                                {item.module_type[0]}
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDelete(item.structure_id)}
                                                                disabled={isDeleting}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </li>
                                                ))}
                                                {semItems.length === 0 && (
                                                    <li className="text-xs text-muted-foreground italic py-1">No modules</li>
                                                )}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { createGoal, deleteGoal } from '@/lib/actions/student-subactions';
import type { QuantGoalType } from '@/types';

interface QuantitativeGoalsClientProps {
    initialGoals: any[];
}

const goalTypeLabels: Record<QuantGoalType, string> = {
    GPA_TARGET: 'Target GPA',
    CREDITS_TARGET: 'Credits Target',
    MODULE_GRADE_TARGET: 'Module Grade Target',
    CGPA_IMPROVEMENT: 'CGPA Improvement',
};

export function QuantitativeGoalsClient({ initialGoals }: QuantitativeGoalsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        goalType: 'GPA_TARGET' as QuantGoalType,
        targetValue: '',
        baselineValue: '',
        moduleId: '',
        deadline: '',
    });

    const completedGoals = initialGoals.filter((g) => g.status === 'COMPLETED').length;
    const overdueGoals = initialGoals.filter((g) => g.deadline && new Date(g.deadline) < new Date() && g.status !== 'COMPLETED').length;
    const activeGoals = initialGoals.filter((g) => g.status === 'IN_PROGRESS').length;

    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            goalType: 'GPA_TARGET',
            targetValue: '',
            baselineValue: '',
            moduleId: '',
            deadline: '',
        });
    };

    const handleCreate = async () => {
        if (!form.title || !form.targetValue) {
            toast.error('Title and target value are required.');
            return;
        }
        if (form.goalType === 'MODULE_GRADE_TARGET' && !form.moduleId) {
            toast.error('Module ID is required for module-grade goals.');
            return;
        }

        try {
            await createGoal({
                title: form.title,
                description: form.description || undefined,
                goalType: form.goalType,
                targetValue: Number(form.targetValue),
                baselineValue: form.goalType === 'CGPA_IMPROVEMENT' && form.baselineValue ? Number(form.baselineValue) : null,
                moduleId: form.goalType === 'MODULE_GRADE_TARGET' ? form.moduleId : null,
                deadline: form.deadline ? new Date(form.deadline) : null,
                milestones: [],
            });
            toast.success('Goal created.');
            setShowAddDialog(false);
            resetForm();
            startTransition(() => router.refresh());
        } catch (error: any) {
            toast.error(error.message || 'Failed to create goal.');
        }
    };

    const handleDelete = async (goalId: string) => {
        try {
            await deleteGoal(goalId);
            toast.success('Goal deleted.');
            startTransition(() => router.refresh());
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete goal.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Academic Goals</h1>
                    <p className="text-muted-foreground mt-1">Quantitative goals only: GPA, credits, module grade, CGPA improvement.</p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button disabled={isPending || activeGoals > 0}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Quantitative Goal</DialogTitle>
                            <DialogDescription>Only one active goal is allowed at a time.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="grid gap-1">
                                <Label>Title</Label>
                                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div className="grid gap-1">
                                <Label>Description</Label>
                                <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="grid gap-1">
                                <Label>Goal Type</Label>
                                <Select value={form.goalType} onValueChange={(v) => setForm((p) => ({ ...p, goalType: v as QuantGoalType }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GPA_TARGET">Target GPA</SelectItem>
                                        <SelectItem value="CREDITS_TARGET">Credits Target</SelectItem>
                                        <SelectItem value="MODULE_GRADE_TARGET">Module Grade Target</SelectItem>
                                        <SelectItem value="CGPA_IMPROVEMENT">CGPA Improvement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1">
                                <Label>Target Value</Label>
                                <Input type="number" value={form.targetValue} onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))} />
                            </div>
                            {form.goalType === 'CGPA_IMPROVEMENT' && (
                                <div className="grid gap-1">
                                    <Label>Baseline GPA</Label>
                                    <Input type="number" step="0.01" value={form.baselineValue} onChange={(e) => setForm((p) => ({ ...p, baselineValue: e.target.value }))} />
                                </div>
                            )}
                            {form.goalType === 'MODULE_GRADE_TARGET' && (
                                <div className="grid gap-1">
                                    <Label>Module ID</Label>
                                    <Input value={form.moduleId} onChange={(e) => setForm((p) => ({ ...p, moduleId: e.target.value }))} />
                                </div>
                            )}
                            <div className="grid gap-1">
                                <Label>Deadline</Label>
                                <Input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isPending}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{initialGoals.length}</CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{activeGoals}</CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{completedGoals}</CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Overdue</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{overdueGoals}</CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Goals</CardTitle>
                    <CardDescription>Progress is calculated automatically from your academic records.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {initialGoals.length === 0 && (
                        <div className="text-sm text-muted-foreground py-6 text-center">No goals yet.</div>
                    )}
                    {initialGoals.map((goal) => (
                        <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        <p className="font-semibold">{goal.title}</p>
                                        <Badge variant={goal.status === 'COMPLETED' ? 'default' : 'secondary'}>{goal.status}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{goal.description || goalTypeLabels[goal.goalType as QuantGoalType]}</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(goal.id)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                                <span>Type: {goalTypeLabels[goal.goalType as QuantGoalType] ?? goal.goalType}</span>
                                <span>Target: {goal.targetValue}</span>
                                {goal.moduleCode && <span>Module: {goal.moduleCode}</span>}
                                {goal.deadline && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(goal.deadline).toLocaleDateString()}</span>}
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

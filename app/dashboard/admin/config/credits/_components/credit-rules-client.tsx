'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Save, Plus, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { saveCreditRule, deleteCreditRule } from '@/lib/actions/credit-rule-actions';
import { motion, AnimatePresence } from 'framer-motion';

interface CreditRule {
    id: string;
    level: string;
    semester_number: number;
    min_credits: number;
    max_credits: number;
}

interface CreditRulesClientProps {
    initialRules: CreditRule[];
}

export function CreditRulesClient({ initialRules }: CreditRulesClientProps) {
    const [rules, setRules] = useState<CreditRule[]>(initialRules);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State
    const [newLevel, setNewLevel] = useState('L1');
    const [newSem, setNewSem] = useState('1');
    const [newMin, setNewMin] = useState('15');
    const [newMax, setNewMax] = useState('24');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (ruleData?: Partial<CreditRule>) => {
        setIsSaving(true);
        try {
            const data = ruleData ? {
                level: ruleData.level!,
                semester_number: ruleData.semester_number!,
                min_credits: ruleData.min_credits!,
                max_credits: ruleData.max_credits!
            } : {
                level: newLevel,
                semester_number: parseInt(newSem),
                min_credits: parseInt(newMin),
                max_credits: parseInt(newMax)
            };

            const res = await saveCreditRule(data);
            if (res.success) {
                toast.success("Credit rule updated successfully");
                window.location.reload();
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this rule? System defaults will apply.")) return;
        try {
            await deleteCreditRule(id);
            toast.success("Rule deleted");
            setRules(rules.filter(r => r.id !== id));
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academic Credit Rules</h1>
                    <p className="text-muted-foreground">Manage minimum and maximum credit thresholds per Level and Semester</p>
                </div>
                <Button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
                >
                    {isAdding ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> New Rule</>}
                </Button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-blue-200 bg-blue-50/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Add New Credit Threshold</CardTitle>
                                <CardDescription>Define a specific rule for an academic year and semester.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label>Level (Year)</Label>
                                        <Select value={newLevel} onValueChange={setNewLevel}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L1">Level 1 (Foundation)</SelectItem>
                                                <SelectItem value="L2">Level 2</SelectItem>
                                                <SelectItem value="L3">Level 3</SelectItem>
                                                <SelectItem value="L4">Level 4</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Semester</Label>
                                        <Select value={newSem} onValueChange={setNewSem}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Semester 1</SelectItem>
                                                <SelectItem value="2">Semester 2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Min Credits</Label>
                                        <Input type="number" value={newMin} onChange={(e) => setNewMin(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Credits</Label>
                                        <Input type="number" value={newMax} onChange={(e) => setNewMax(e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-4 border-t flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setIsAdding(false)}>Discard</Button>
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => handleSave()}
                                    disabled={isSaving}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Rule
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <CardTitle>Active Constraints</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Academic Level</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Min Credits</TableHead>
                                    <TableHead>Max Credits</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map((rule) => (
                                    <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono">{rule.level}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {rule.level === 'L1' ? 'First Year' : 
                                                     rule.level === 'L2' ? 'Second Year' : 
                                                     rule.level === 'L3' ? 'Third Year' : 'Final Year'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">Semester {rule.semester_number}</Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">{rule.min_credits}</TableCell>
                                        <TableCell>
                                            <span className="font-bold text-blue-600">{rule.max_credits}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(rule.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {rules.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <HelpCircle className="h-10 w-10 opacity-20" />
                                                <p>No custom credit rules defined.</p>
                                                <p className="text-xs uppercase tracking-widest">Defaulting to 12 Min / 24 Max</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-amber-800 shadow-sm">
                <HelpCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-bold mb-1">How rules are applied:</p>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                        <li>The system matches a student's current Year (e.g., L1) and Semester to find the applicable rule.</li>
                        <li>If a rule is found, the registration screen will dynamically adjust its "Maximum Credits" popup.</li>
                        <li>These rules are enforced twice: once in the browser and again on the server for full security.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

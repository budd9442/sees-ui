'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ModuleCard } from '@/components/common/module-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, BookOpen, CheckCircle, AlertCircle, Info, CalendarRange, Hourglass } from 'lucide-react';
import { toast } from 'sonner';
import { registerForModules } from '@/lib/actions/student-actions';
import { motion, AnimatePresence } from 'framer-motion';

interface CreditRule {
    min_credits: number;
    max_credits: number;
}

interface RegistrationSemester {
    semesterId: string;
    label: string;
    semesterNumber: number;
    rule: CreditRule;
    modules: any[];
}

interface RegistrationWindowProps {
    canEdit: boolean;
    windowOk: boolean;
    message?: string;
    label?: string;
    status?: string;
    opensAt: string | null;
    closesAt: string | null;
    studentMessage: string | null;
}

interface ModuleRegistrationViewProps {
    student: {
        academicYear: string;
        degreeProgram?: string;
        specialization?: string;
    };
    semesters: RegistrationSemester[];
    registeredModuleIds: string[];
    completedModuleCodes: string[];
    registrationWindow: RegistrationWindowProps;
}

export function ModuleRegistrationView({
    student,
    semesters,
    registeredModuleIds,
    completedModuleCodes,
    registrationWindow,
}: ModuleRegistrationViewProps) {
    const canEdit = registrationWindow.canEdit;
    const closesAt = registrationWindow.closesAt ? new Date(registrationWindow.closesAt) : null;
    const router = useRouter();
    const buildSelectionKey = (ids: string[]) => [...ids].sort().join('|');

    // 1. Initial selection: registered + compulsory across all semesters
    const initialSelection = useMemo(() => {
        const allAvailableIds = new Set(semesters.flatMap(s => s.modules.map(m => m.id)));
        const set = new Set([...registeredModuleIds].filter(id => allAvailableIds.has(id)));
        
        // Add all compulsory modules
        semesters.forEach(sem => {
            sem.modules.filter(m => m.isCompulsory).forEach(m => set.add(m.id));
        });
        
        return Array.from(set);
    }, [registeredModuleIds, semesters]);

    const [selectedModules, setSelectedModules] = useState<string[]>(initialSelection);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState(semesters[0]?.semesterId || "");
    const [lastSavedSelectionKey, setLastSavedSelectionKey] = useState<string>(buildSelectionKey(initialSelection));
    const [hasSavedPlan, setHasSavedPlan] = useState<boolean>(registeredModuleIds.length > 0);

    // 2. Helper to get credits for a specific semester
    const getSemCredits = (semester: RegistrationSemester) => {
        return selectedModules.reduce((total, moduleId) => {
            const module = semester.modules.find(m => m.id === moduleId);
            return total + (module?.credits || 0);
        }, 0);
    };

    const toggleModule = (moduleId: string, semester: RegistrationSemester) => {
        if (!canEdit) {
            toast.error(registrationWindow.message || 'Module registration is closed.');
            return;
        }
        const module = semester.modules.find(m => m.id === moduleId);
        if (!module) return;

        if (module.isCompulsory) {
            toast.error('Compulsory modules cannot be removed');
            return;
        }

        const currentSemCredits = getSemCredits(semester);
        const maxCredits = semester.rule.max_credits;

        setSelectedModules((prev) => {
            if (prev.includes(moduleId)) {
                return prev.filter((id) => id !== moduleId);
            } else {
                if (currentSemCredits + module.credits > maxCredits) {
                    toast.error(`Semester Limit: Cannot exceed ${maxCredits} credits in ${semester.label}`);
                    return prev;
                }
                return [...prev, moduleId];
            }
        });
    };

    const selectedModuleMetaById = useMemo(
        () =>
            new Map(
                semesters.flatMap((sem) =>
                    sem.modules.map((module) => [
                        module.id,
                        { code: module.code as string, semesterNumber: sem.semesterNumber },
                    ])
                )
            ),
        [semesters]
    );

    const checkPrerequisites = (module: any, moduleSemesterNumber: number): boolean => {
        return module.prerequisites.every((prereq: string) => {
            if (completedModuleCodes.includes(prereq)) {
                return true;
            }

            // Allow annual-plan co-registration: a Semester 2 module can rely on a selected Semester 1 prerequisite.
            return selectedModules.some((selectedId) => {
                const selectedModule = selectedModuleMetaById.get(selectedId);
                return (
                    selectedModule?.code === prereq &&
                    selectedModule.semesterNumber < moduleSemesterNumber
                );
            });
        });
    };

    const handleSubmitRegistration = async () => {
        if (!canEdit) {
            toast.error(registrationWindow.message || 'Module registration is closed.');
            return;
        }
        // Validate ALL semesters
        for (const sem of semesters) {
            const credits = getSemCredits(sem);
            if (credits < sem.rule.min_credits) {
                toast.error(`${sem.label}: Minimum ${sem.rule.min_credits} credits required`);
                setActiveTab(sem.semesterId);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await registerForModules(selectedModules);
            toast.success('Annual registration submitted successfully!');
            setLastSavedSelectionKey(currentSelectionKey);
            setHasSavedPlan(true);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Global Validity Check
    const isGlobalValid = semesters.every(sem => {
        const credits = getSemCredits(sem);
        return credits >= sem.rule.min_credits && credits <= sem.rule.max_credits;
    }) && selectedModules.every(id => {
        const mod = semesters.flatMap(s => s.modules).find(m => m.id === id);
        return mod ? checkPrerequisites(mod, mod.semesterNumber) : true;
    });
    const currentSelectionKey = buildSelectionKey(selectedModules);
    const hasUnsavedChanges = currentSelectionKey !== lastSavedSelectionKey;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {!canEdit && (
                <Alert className="border-amber-300 bg-amber-50/90 text-amber-950">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        <strong>View only.</strong> {registrationWindow.message || 'You cannot change module selections right now.'}
                        {registrationWindow.studentMessage && (
                            <span className="block mt-2 text-amber-900/90">{registrationWindow.studentMessage}</span>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Annual Module Registration"
                    description={`Planning for academic year ${student.academicYear}${registrationWindow.label ? ` · ${registrationWindow.label}` : ''}`}
                />

                {canEdit && closesAt && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 shadow-sm"
                    >
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                            <Hourglass className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">Time remaining</p>
                            <p className="text-sm font-bold leading-none">
                                {(() => {
                                    const now = new Date();
                                    const days = Math.ceil((closesAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    return days > 0 ? `${days} days left to register` : 'Window closing soon';
                                })()}
                            </p>
                        </div>
                    </motion.div>
                )}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="py-3 px-4 flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Annual Credits</p>
                            <p className="text-xl font-black text-primary">
                                {semesters.reduce((sum, sem) => sum + getSemCredits(sem), 0)}
                            </p>
                        </div>
                        <div className="h-8 w-px bg-primary/20" />
                        <Button
                            className="font-bold shadow-lg shadow-primary/20"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={handleSubmitRegistration}
                        >
                            {isSubmitting ? 'Processing…' : hasUnsavedChanges ? 'Submit annual plan' : 'Update plan'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {hasSavedPlan && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        {hasUnsavedChanges
                            ? 'You have unsaved changes to your annual plan.'
                            : 'Your annual module plan is saved.'}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-4 items-start">
                {/* Year Info Sidebar */}
                <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CalendarRange className="h-4 w-4 text-blue-500" />
                            Academic Context
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Program</span>
                                <span className="font-medium">{student.degreeProgram}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Level</span>
                                <Badge variant="secondary" className="h-5">{student.academicYear}</Badge>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-3">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Yearly Status</p>
                            {semesters.map(sem => {
                                const creds = getSemCredits(sem);
                                const isValid = creds >= sem.rule.min_credits && creds <= sem.rule.max_credits;
                                return (
                                    <div key={sem.semesterId} className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span>{sem.label}</span>
                                            <span className={`font-bold ${isValid ? 'text-green-600' : 'text-orange-500'}`}>
                                                {creds} credits
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${isValid ? 'bg-green-500' : 'bg-orange-400'}`}
                                                style={{ width: `${Math.min(100, (creds / sem.rule.max_credits) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Alert className="bg-blue-50/50 border-blue-100 text-[10px] leading-relaxed mt-4">
                            <Info className="h-3 w-3 text-blue-500" />
                            <AlertDescription>
                                Modules are selected for both semesters at once. Limits are applied per semester independently.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Registration Main Area */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1">
                            {semesters.map(sem => (
                                <TabsTrigger 
                                    key={sem.semesterId} 
                                    value={sem.semesterId}
                                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold"
                                >
                                    {sem.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search modules by code or name..."
                                    className="pl-9 bg-muted/20 border-none focus-visible:ring-1"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {semesters.map(sem => {
                            const filteredModules = sem.modules.filter(m => 
                                m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                m.title.toLowerCase().includes(searchQuery.toLowerCase())
                            );
                            
                            const semCredits = getSemCredits(sem);
                            const semRule = sem.rule;

                            return (
                                <TabsContent key={sem.semesterId} value={sem.semesterId} className="space-y-6 focus-visible:outline-none">
                                    {/* Semester Rule Banner */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border border-muted-foreground/10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-900 border flex items-center justify-center font-bold text-lg">
                                                {semCredits}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm">{sem.label} Load</h3>
                                                <p className="text-xs text-muted-foreground">Min {semRule.min_credits} credits • Max {semRule.max_credits} credits</p>
                                            </div>
                                        </div>
                                        {semCredits >= semRule.min_credits && semCredits <= semRule.max_credits ? (
                                            <Badge className="bg-green-500 hover:bg-green-600">Valid Capacity</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Limit Warning</Badge>
                                        )}
                                    </div>

                                    {/* Module Grid */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {filteredModules.map((module) => (
                                            <ModuleCard
                                                key={module.id}
                                                module={module}
                                                isSelected={selectedModules.includes(module.id)}
                                                isInitiallySelected={registeredModuleIds.includes(module.id)}
                                                prerequisitesMet={checkPrerequisites(module, sem.semesterNumber)}
                                                onToggleSelect={
                                                    canEdit ? () => toggleModule(module.id, sem) : undefined
                                                }
                                            />
                                        ))}
                                    </div>

                                    {filteredModules.length === 0 && (
                                        <div className="text-center py-20 border rounded-xl bg-muted/5 border-dashed">
                                            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-muted-foreground">No modules available for your search.</h3>
                                        </div>
                                    )}
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
